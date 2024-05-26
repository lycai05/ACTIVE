// import workerpool from 'workerpool';
import { expose,Transfer } from "threads/worker"

import * as d3 from "d3";
import { BigWig } from '@gmod/bbi'
import { RemoteFile } from 'generic-filehandle'
import { Buffer } from 'buffer';
globalThis.Buffer = Buffer
// import { initConsoleLogImg } from 'console-log-img';
// // Run this once to initialize the library
// initConsoleLogImg({
//   // Optionally, disable image dimensions logging (enabled by default)
//   printDimensions: true,
// });
const getbw = async (offscreen,url, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin ) => {
    console.log('start getbw')
    console.log(widthValue, heightValue)
    const filehandle = new RemoteFile(url)
    const file =  new BigWig({
        filehandle: filehandle
    })
    // const offscreen = new OffscreenCanvas(widthValue, heightValue);
    const context = offscreen.getContext("2d");
    const results = await file.getFeatures(chromValue, startValue, endValue, { scale: scaleValue })//.then((results) => {
    const imageBitmap = drawCustomChart( results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin,context,offscreen)
    console.img(imageBitmap)
    return  imageBitmap

    // })
    // console.log(results)

    // return results
}


function drawCustomChart(results, y, chromValue, startValue, endValue, scaleValue, widthValue, heightValue, color, showSpin,context,offscreen) {
    console.log('start drawCustomChart')
    
    console.log(widthValue, heightValue)
    // Use Promise.all() to wait for all the Promises to resolve

    // const mergedData = results.reduce((acc, cur, i) => {
    //     const dataWithGroup = cur.map(d => ({ ...d, group: i }));
    //     return acc.concat(dataWithGroup);
    // }, []);

    // const mergedData = results.flatMap((innerArr, groupIndex) => {
    //     return innerArr.map((item) => {
    //         return { ...item, group: groupIndex + 1 }
    //     })
    // })

    // console.log(mergedData)
    let data = _makeInitialRequest(widthValue, results).drawData[0].data


    if (data.length > 1000) {
        console.log('>10000')
        data = largestTriangleThreeBucket(data, 1000, 'pos', 'score')
    }
    console.log(data[0])

    const maxCount = d3.max(data, function (d) { return d.score; });
    const minCount = d3.min(data, function (d) { return d.score; })

    let dotWidth = widthValue / (endValue - startValue)
    let dotHeight = heightValue / 4

    var margin = { top: 0, right: 0, bottom: 0, left: 0 }

    // var tooltip = d3.select("body").append("div")
    //     .attr("id", "tooltip")
    //     .style("opacity", 1)

    // console.log([startValue, endValue], [0, widthValue], [heightValue, 0])

    var xScale = d3.scaleLinear()
        .domain([startValue, endValue])
        .range([0, widthValue])

    // var xScaleRef = xScale.copy();
    // console.log(data)
    // const groups = new Set(data.map(item => item.group));
    // const uniqueGroups = Array.from(groups)

    // console.log(d3.extent(data.map(d => d.group)), [heightValue, 0])



   
    // console.log([zero_rgba, min_rgba, max_rgba], [0, minCount, maxCount])
    var colorScale = d3.scaleQuantize()
        .range([color.zero_rgba, color.min_rgba, color.max_rgba])
        .domain([0, minCount, maxCount])
        .nice(200);

    // var tooltip = d3.select("#canvasContainer").append("div")
    //     .attr("id", "tooltip")
    //     .style("opacity", 0);



    // var context = canvas.node().getContext("2d");
    // context.clearRect(0, 0, widthValue, heightValue);

    // console.log(uniqueGroups)
    // console.log(data)
    data.forEach(function (d) {

        var x = xScale(d.pos);
        // var y = yScale(d.group);
        var fill = colorScale(d.score);
        //  console.log(d.pos,x, y, dotWidth,dotHeight)
        // context.beginPath();
        // console.log(fill)
        context.fillStyle = 'red';
        // console.log(x, y, 1, dotHeight)
        context.fillRect(x, 50, 5, 200);
        // context.fill();
    })
    context.fillStyle = 'red'
    context.fillRect(694.643589617448, 40, 1, 40);
    context.fillRect(30, 40, 1, 40)
    console.log(offscreen.transferToImageBitmap())
    console.img(offscreen)
    const imageBitmap=offscreen.transferToImageBitmap()
    return imageBitmap
    // postMessage({imageBitmap:imageBitmap},[imageBitmap]);
 

}
// workerpool.worker({
//     getbw: getbw  });

function largestTriangleThreeBucket(data, threshold, xProperty, yProperty) {
    /**
     * This method is adapted from the 
     * "Largest Triangle Three Bucket" algorithm by Sveinn Steinarsson
     * In his 2013 Masters Thesis - "Downsampling Time Series for Visual Representation"
     * http://skemman.is/handle/1946/15343
     *
     * The MIT License
     *  
     * Copyright (c) 2013 by Sveinn Steinarsson
     *
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     * --------------------------------------------------------------------------------------------------------
     */
    yProperty = yProperty || 0;
    xProperty = xProperty || 1;

    var m = Math.floor,
        y = Math.abs,
        f = data.length;

    if (threshold >= f || 0 === threshold) {
        return data;
    }

    var n = [],
        t = 0,
        p = (f - 2) / (threshold - 2),
        c = 0,
        v,
        u,
        w;

    n[t++] = data[c];

    for (var e = 0; e < threshold - 2; e++) {
        for (var g = 0,
            h = 0,
            a = m((e + 1) * p) + 1,
            d = m((e + 2) * p) + 1,
            d = d < f ? d : f,
            k = d - a; a < d; a++) {
            g += +data[a][xProperty], h += +data[a][yProperty];
        }

        for (var g = g / k,
            h = h / k,
            a = m((e + 0) * p) + 1,
            d = m((e + 1) * p) + 1,
            k = +data[c][xProperty],
            x = +data[c][yProperty],
            c = -1; a < d; a++) {
            "undefined" != typeof data[a] &&
                (u = .5 * y((k - g) * (data[a][yProperty] - x) - (k - data[a][xProperty]) * (h - x)),
                    u > c && (c = u, v = data[a], w = a));
        }

        n[t++] = v;
        c = w;
    }

    n[t++] = data[f - 1];

    return n;
}

const _makeInitialRequest = (widthValue, xdata) => {

    var xvalues = []//,
        // l = start.value,
        // r = end.value,
        // w = widthValue,
        // step = (r - l) / w;

    const xvalues2 = xdata.map(obj => {
        const average = (obj.start + obj.end) / 2;
        const score = obj.score;
        // const group = obj.group
        return { pos: average, score: score };
        // return [average,score]
    });

    const xvalues3 = [{
        // color: props.option.series[0].areaStyle.color,
        data: xvalues2
    }]
    // console.log(xvalues3)
    //_drawPlot(canvasEle, xvalues3);
    // canvasReady.value = true;

    // const offscreen = canvasEle.transferControlToOffscreen()
    return {
        // canvasEle: canvasEle,
        drawData: xvalues3
    }

}

expose(getbw)