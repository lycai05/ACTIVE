import { defineComponent, ref, onMounted, reactive, watch } from 'vue';

// import { usecorenavStore } from '../store/corenav'
import { storeToRefs } from 'pinia'
import { clusterMultiplexing } from './clusterMultiplexing'
// export const useBaseRowTrack = defineComponent({
// })

const _intersects = (dim1, dim2, hpad = 10) => {
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
    console.log(canvasEle)
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

const _measureWidth = (canvas, w, scls, c, showLable) => {
    // determine which part of canvas will be used to draw given scls
    var ctx = canvas.getContext("2d"),
        cstart = Math.max(1, c(scls.start)),
        cend = Math.min(w, c(scls.end + 1)),
        actualWidth = Math.max(cend - cstart, showLable ? ctx.measureText(scls._text).width : 0);

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

const _clearCanvas = (canvas, linklayer) => {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetWidth);
    if (linklayer) {
        linklayer.css({
            height: canvas.offsetWidth,
            width: canvas.offsetWidth - 16
        }).empty();
    }
}

const filterItems = (items) => {
  const clusterIdCounts = {};
  for (const item of items) {
    const clusterId = item.clusterId;
    if (clusterIdCounts.hasOwnProperty(clusterId)) {
      clusterIdCounts[clusterId]++;
    } else {
      clusterIdCounts[clusterId] = 1;
    }
  }
  // Filter out clusterIds that occur only once
  const validClusterIds = Object.keys(clusterIdCounts).filter(clusterId => clusterIdCounts[clusterId] > 2);
  // console.log(validClusterIds)

  let filteredItems = items.filter(item => validClusterIds.includes(item.clusterId));
    // Create an object to map each clusterId to its index
  const rows = {};
  validClusterIds.forEach((clusterId, index) => {
    rows[clusterId] = index;
  });
  return {
    items2: filteredItems, 
    validClusterIds: validClusterIds,
    rows: rows
  }
}

function splitArray(originalArray) {
  const clusterGroups = originalArray.reduce((acc, obj) => {
    const { clusterId } = obj;
    if (!acc[clusterId]) {
      acc[clusterId] = [];
    }
    acc[clusterId].push(obj);
    return acc;
  }, {});

  let array1 = [];
  let array2 = [];

  for (const clusterId in clusterGroups) {
    const clusterObjects = clusterGroups[clusterId];
    let smallestStartObject = clusterObjects[0];
    let largestEndObject = clusterObjects[0];

    // Find the objects with the smallest start and the largest end
    clusterObjects.forEach(obj => {
      if (obj.start < smallestStartObject.start) {
        smallestStartObject = obj;
      }
      if (obj.end > largestEndObject.end) {
        largestEndObject = obj;
      }
    });

    // Create a new object for array1
    array1.push({
      chrom: smallestStartObject.chrom,
      start: smallestStartObject.start,
      end: smallestStartObject.end,
      chrom2: largestEndObject.chrom,
      start2: largestEndObject.start,
      end2: largestEndObject.end,
      clusterId: clusterId
    });

    // Add remaining objects to array2
    const selectedIds = new Set([smallestStartObject, largestEndObject]);
    array2.push(...clusterObjects.filter(obj => !selectedIds.has(obj)));
  }

  return { bedpeArray: array1, bedArray: array2 };
}

// Outputs the remaining objects not included in array1
// function determineRows(items,validClusterIds) {
//        // Initialize the rows object and a map to track cluster indices
//     const rows = {0: 0};
//     const clusterMap = {[items[0]['clusterId']]: 0};
   
//     // Loop through the items starting from the second one
//     for (let i = 0; i < items.length; i++) {
//       const clusterId = items[i]['clusterId']; // Access the cluster ID
//       // console.log(validClusterIds)
//       // If the cluster ID has been seen before, use its index in rows
//       // Otherwise, create a new index
//       // if (validClusterIds.includes(clusterId)) {
//         if(clusterId in clusterMap) {
//             rows[i] = clusterMap[clusterId];
//           } else {
//             const newIndex = Object.keys(clusterMap).length; // The new index is the count of unique cluster IDs
//             clusterMap[clusterId] = newIndex;
//             rows[i] = newIndex;
//           }
//       // } 

//     }
//   // console.log
//     // Return the resulting rows object
//     return rows;
//   }
var INTER1 = 0,
    INTER2 = 1,
    INTRA = 2,
    MIN_ANCHOR_WIDTH = 3,
    MIN_CONNECTOR_LENGTH = 10
const _determineStartEnd = (pcls) => {
  var start, end, link;

  if (pcls.type == INTER1) {
      // head anchor visible
      start = pcls.start;
      end = pcls.end;
      link = [pcls.chrom2, pcls.start2, pcls.end2];
  } else if (pcls.type == INTER2) {
      // tail anchor visible
      start = pcls.start2;
      end = pcls.end2;
      link = [pcls.chrom, pcls.start, pcls.end];
  } else {
      if (pcls.start < pcls.start2) {
          start = pcls.start;
          end = pcls.end2;
      } else {
          start = pcls.start2;
          end = pcls.end;
      }
      link = [pcls.chrom, start, end];
  }

  // pcls._link = link;
  // pcls._start = start;
  // pcls._end = end;
  // pcls._text = this._makeLabel(pcls);
  // pcls._tooltip = this._makeLabel(pcls, this.options.tooltip);
  //console.log('_determineStartEnd')
  return ({ link, start, end })
}
const _preprocess = (items) => {
  // var chrom = chrom.value; // from [abs-track]
  // for (var i in items) {
  //     var it = items[i];
  //     if (it.chrom === chrom) {
  //         it.type = (it.chrom2 === chrom) ? INTRA : INTER1;
  //     } else {
  //         it.type = INTER2;
  //     }
  //     console.log(it)

  // }
  items.forEach((it) => {
      // if (it.chrom === chrom) {
      //     it.type = (it.chrom2 === chrom) ? INTRA : INTER1;
      // } else {
      //     it.type = INTER2;
      // }

      it.type = INTRA

      const { link, start, end } = _determineStartEnd(it);
      it._link = link;
      it._start = start;
      it._end = end;
  })


  return (items)

  // this.options.glyph.postpad = this.options.showLabel ? _DEFAULT_GLYPH_POSTPAD : 2;
}

export const drawPlotX = (canvasEle, items, quick,ParentEle, h, prepad, postpad, showLabel, _drawItemBed, _drawItemBedpe, _measureWidth, start, end, color) => {
    // console.log('drawPlotX BED file')
    
    // Filter clusters within only one fragment in curretn view
    // let validClusterIds = []
    let {items2, validClusterIds} = filterItems(items)
    console.log(items2)

    const {rows, matrix} = clusterMultiplexing(start, end, items2, 25000)
    console.log(rows,matrix)

    // console.log(items2)
    let { bedpeArray, bedArray } = splitArray(items2)
    bedpeArray = _preprocess(bedpeArray)
    const linklayer = null;
    // console.log(items2, validClusterIds)
    var links = []; // returned at the end of function; so this plugin can't be chained
    
    const colors = color || reactive({ '_': "black" })
    // console.log(colors)
    // colors = _.isObject(colors_)
    //     ? colors_ // if head/tail/line is missing, wildcard/default color will be used (see _getColor)
    //     : { _: colors_ }; // set wildcard if it's either string or function
    // console.log(items)

    // 设置canvas元素的宽和高，宽度设置成和父元素一致，高度设置成和items的长度一致
    _createCanvas(canvasEle, ParentEle, h, prepad, postpad, items2)

    // cavas元素的宽度
    const w = canvasEle.getBoundingClientRect().width;
    // console.log(h)


    const ratio = w / (end - start + 1)
    const _c = function (x1) { return (x1 - start) * ratio; }; // convert genome location to canvas coordinate

    let groups = []
    // let rows = {}

    canvasEle.style.display = "none";
    _clearCanvas(canvasEle, linklayer);

    var rowcount = 0, k = 0; // running number

    // determine layout
    // for (var i = 0; i < items.length; i++, k++) {
    //     var item = items[i];
    //     if (rows[k] == null) {
    //         rows[k] = _determineRow(_measureWidth(canvasEle, w, item, _c, showLabel), groups);
    //     }
    //     if (rowcount < rows[k]) rowcount = rows[k];
    // }

    // rows = determineRows(items2, validClusterIds)
    rowcount = Math.max(...Object.values(rows));
  // console.log(items2, rows)
    canvasEle.setAttribute('height', (h + prepad + postpad) * (rowcount + 2));
  // console.log(bedpeArray, bedArray)
    k = 0; // restart from 0
    for (var i = 0; i < bedArray.length; i++, k++) {
        var item = bedArray[i], r = rows[bedArray[i].clusterId];
        // console.log(r * (h + postpad) + prepad * (r + 1))
        _drawItemBed(canvasEle, 0, r * (h + postpad) + prepad * (r + 1), w, h, item, colors, _c, quick);

        // if (!quick && _addLinks) {
        //     var link = _addLinks(linklayer, cnv_elem, r * (h + postpad) + prepad * (r + 1), w, h.value, postpad, item, _c);
        //     links.push([item, link]);
        // }
    }
    for (var i = 0; i < bedpeArray.length; i++, k++) {
        var item = bedpeArray[i], r = rows[bedpeArray[i].clusterId];
        // console.log(r * (h + postpad) + prepad * (r + 1))
        _drawItemBedpe(canvasEle, 0, r * (h + postpad) + prepad * (r + 1), w, h, item, colors, _c, quick);
        
        // if (!quick && _addLinks) {
        //     var link = _addLinks(linklayer, cnv_elem, r * (h + postpad) + prepad * (r + 1), w, h.value, postpad, item, _c);
        //     links.push([item, link]);
        // }
    }
    // canvas.value.show();
    canvasEle.style.display = "block";


    return matrix;
}


