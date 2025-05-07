import { defineComponent, ref, onMounted, reactive, watch } from 'vue';

// import { usecorenavStore } from '../../unused/corenav'
// import { storeToRefs } from 'pinia'

// export const useBaseRowTrack = defineComponent({
// })

const _intersects = (dim1, dim2, hpad = 1) => {
    var pad = hpad,
        p = dim1.start - pad,
        q = dim1.end + pad,
        m = dim2.start - pad,
        n = dim2.end + pad;
    return p < n && q >= m;
}

const _noIntersection = (dim, group) => {
    for (var i = 0; i < group.length; i++) {
        if (_intersects(group[i], dim)) return false;
    }
    return true;
}

const _createCanvas = (canvasEle, ParentEle, h, prepad, postpad, data) => {
    // var canvas = $(cvs_holder).data('canvas');

    // if (isCanvasBlank(cvs_holder)) {
    // avoid re-creating canvas if it's already present
    // console.log(canvasEle)
    canvasEle.setAttribute('width', ParentEle.offsetWidth);
    canvasEle.setAttribute('height', (h.value + prepad + postpad) * data.length);

    // cvs_holder.scroll(function () { // must sync link layer with canvas scrolling
    //     var link_layer = cvs_holder.find(">div");
    //     link_layer.css({ top: canvas.position().top });
    // });

    // cvs_holder.value.addEventListener('scroll', function () { // must sync link layer with canvas scrolling
    //     var link_layer = cvs_holder.querySelector('>div');
    //     link_layer.style.top = canvas.offsetTop + 'px';
    // });
    // }

    // return canvas;
}

const _createLayer = (canvas,canvasHolder) => {
      // Get the direct child canvas of the provided canvasHolder
//   var canvas = canvasHolder.querySelector("canvas");

  // Create a new div element
  var layerDiv = document.createElement("div");

  // Get canvas dimensions and position
  var canvasRect = canvas.getBoundingClientRect();
//   console.log(canvas.offsetHeight)
  // Set styles to match the jQuery example
  layerDiv.style.position = "absolute";
  layerDiv.style.top = 0 + 'px';
  layerDiv.style.left = 0 + 'px';
  layerDiv.style.width = canvas.offsetWidth + 'px'; // Assuming canvas.width() is equivalent to canvas.offsetWidth
  layerDiv.style.height = canvas.offsetHeight + 'px'; // Assuming canvas.height() is equivalent to canvas.offsetHeight
  layerDiv.style.overflowX = 'hidden';
  layerDiv.style.overflowY = 'hidden';
  layerDiv.style.margin = '0';
// console.log(layerDiv.style.height, layerDiv.style.width)
  // Attach a wheel event listener
//   layerDiv.addEventListener('wheel', function(ev) {
//     // Prevent the default scrolling behavior and manually adjust the scrollTop
//     var delta = Math.sign(ev.deltaY);
//     var top = canvasHolder.scrollTop;
//     canvasHolder.scrollTop -= 36 * delta;
//     if (top !== canvasHolder.scrollTop) ev.preventDefault();
//   });

  // Append the new div to the canvasHolder
  canvasHolder.appendChild(layerDiv);

  // Return the new div element
  return layerDiv;
}

const _measureWidth = (canvas, w, scls, c, showLable) => {
    // determine which part of canvas will be used to draw given scls
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(scls.start)),
        cend = Math.min(w, c(scls.end + 1)),
        actualWidth = Math.max(cend - cstart, showLable ? ctx.measureText(scls._text).width : 0);
    console.log(cstart, cend)
    return { start: cstart, end: cstart + actualWidth };
}

const _determineRow = (dim, groups) => {
    for (var i = 0; i < groups.length; i++) {
        if (_noIntersection(dim, groups[i])) {
            groups[i].push(dim);
            return i;
        }
    }
    // must be placed in a new row
    groups.push([dim]);
    return groups.length - 1;
}

// const _clearCanvas = (canvas, linklayer) => {
//     var ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetWidth);
//     if (linklayer) {
//         linklayer.css({
//             height: canvas.offsetWidth,
//             width: canvas.offsetWidth - 16
//         }).empty();
//     }
// }
const _clearCanvas = (canvas, linkLayer) => {
    // Get the 2D rendering context for the canvas
    var ctx = canvas.getContext("2d");

    // Clear the entire canvas
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);

    // If a linkLayer is provided, adjust its dimensions and clear its contents
    if (linkLayer) {
        // Set the linkLayer's height and width
        linkLayer.style.height = canvas.offsetHeight + 'px';
        linkLayer.style.width = (canvas.offsetWidth - 16) + 'px';

        // Empty the linkLayer's contents
        while (linkLayer.firstChild) {
            linkLayer.removeChild(linkLayer.firstChild);
        }
    }
};

// Function to create the tooltip
function createTooltip(element, text) {
    // Create the tooltip div
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.innerHTML = text;
    
    // Append the tooltip to the body
    document.body.appendChild(tooltip);
    
    // Function to show the tooltip
    function showTooltip(e) {
      tooltip.style.opacity = '1';
      tooltip.style.top = `${e.pageY + 10}px`;
      tooltip.style.left = `${e.pageX + 10}px`;
    //   tooltip.style.lineHeight = '1.6'; // 增加行距
      tooltip.style.whiteSpace = 'pre-line'; // 允许换行
    }
    
    // Function to hide the tooltip
    function hideTooltip() {
      tooltip.style.opacity = '0';
    }
    
    // Attach the event listeners
    element.addEventListener('mouseover', showTooltip);
    element.addEventListener('mousemove', showTooltip);
    element.addEventListener('mouseout', hideTooltip);
  }

export const drawPlotX = (canvasEle, items, quick,ParentEle, h, prepad, postpad, showLabel, _drawItem, _measureWidth, start, end, color, _addLinks = null) => {
    // console.log('drawPlotX BED file')
    // const corenavStore = usecorenavStore()
    // console.log(items)

    // const { chrom, min, max, start, end, isLoaded, chromSizes, chromBands } = storeToRefs(corenavStore)

    // const linklayer = null;

    var links = []; // returned at the end of function; so this plugin can't be chained
    
    const colors = color || reactive({ '_': "black" })
    // console.log(colors)
    // colors = _.isObject(colors_)
    //     ? colors_ // if head/tail/line is missing, wildcard/default color will be used (see _getColor)
    //     : { _: colors_ }; // set wildcard if it's either string or function
    // console.log(items)

    // 设置canvas元素的宽和高，宽度设置成和父元素一致，高度设置成和items的长度一致
    _createCanvas(canvasEle, ParentEle, h, prepad, postpad, items)

    // cavas元素的宽度
    const w = canvasEle.getBoundingClientRect().width;
    // console.log(h)
    // console.log(w)
    // check if quickdraw is requested
    // if (!quick) {
    //     if (clickable) {
    //         linklayer = data(cvs_holder, "linkLayer");
    //         if (!linklayer) {
    //             linklayer = _createLayer(cvs_holder);
    //             data(cvs_holder, { "linkLayer": linklayer });
    //         }
    //     }
    //     // reset item placement data, so that they'll be recalculated
    //     data(cvs_holder, { "rows": {} });
    // }
    const linklayer = _createLayer(canvasEle, ParentEle)
    // console.log(linklayer)

    const ratio = w / (end - start + 1)
    const _c = function (x1) { return (x1 - start) * ratio; }; // convert genome location to canvas coordinate

    let groups = []
    const rows = {}
    // stores mapping {item local ID -> row number}
    // let rows = data(cvs_holder.value, "rows")
    // used in quickdraw so that we don't need to recompute layout
    // cnv_elem = canvas.get(0);
    // cnv_elem = canvas
    // console.log(rows)
    canvasEle.style.display = "none";
    _clearCanvas(canvasEle, linklayer);

    var rowcount = 0, k = 0; // running number

    // determine layout
    for (var i = 0; i < items.length; i++, k++) {
        var item = items[i];
        if (rows[k] == null) {
            rows[k] = _determineRow(_measureWidth(canvasEle, w, item, _c, showLabel), groups);
        }
        if (rowcount < rows[k]) rowcount = rows[k];
    }
    // resize canvas and redraw
    // $(cnv_elem).attr({
    //     height: (h + prepad + postpad) * (rowcount + 2)
    // });
    canvasEle.setAttribute('height', (h + prepad + postpad) * (rowcount + 2));
    // canvasEle.height =  (h + prepad + postpad) * (rowcount + 2)
    linklayer.style.height =  (h + prepad + postpad) * (rowcount + 2) + 'px';
    // console.log(linklayer.style.height)
    k = 0; // restart from 0
    for (let i = 0; i < items.length; i++, k++) {
        let item = items[i], r = rows[k];

        // console.log(r * (h + postpad) + prepad * (r + 1))
        _drawItem(canvasEle, 0, r * (h + postpad) + prepad * (r + 1), w, h, item, colors, _c, quick);
        // console.log(_addLinks)
        if (_addLinks) {
            // console.log('2222222')
            let link = _addLinks(linklayer, canvasEle, r * (h + postpad) + prepad * (r + 1), w, h, postpad, item, _c);
            links.push([item, link]);
            // console.log(links)
            link[0].addEventListener('click', function() {
                // link[0].style.backgroundColor = 'red';
                // if it is gene track
                if (item.sym) {
                    createTooltip(link[0],`${item.sym}`);
                    // if it is bedpe track
                } else if (item.chrom2) {
                    createTooltip(link[0],`${item.chrom}:${item.start}-${item.end} - ${item.chrom2}:${item.start2}-${item.end2}`);
                } else {
                    const content = `
                    <div><strong>Region:</strong> ${item.chrom}:${item.start}-${item.end}</div>
                    <div><strong>-LogPValue:</strong> ${item.pvalue}</div>
                    <div><strong>Experiment:</strong> ${item.experiment}</div>
                    <div><strong>Tissue:</strong> ${item.tissue}</div>
                `;
                    createTooltip(link[0],content);
                    console.log(item)
                }
              });
        }
    }
    // canvas.value.show();
    canvasEle.style.display = "block";

    // console.log(links)
    return links;
}


