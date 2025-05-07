(function ($) {
  var options = {
    strokeColor: null,
    opacity: 0
    // strokeColor: null,
    // opacity: 0,
    // lineWidth: null
    // curvy: true // this must be set for the plugin to take effect
  };

  const drawEllipse = (ctx, x, y, w, h, radius = 5) => {
    // console.log('rectCurev drawEllipse')
    // Ensure the radius does not exceed half the width or height
    const r = Math.min(radius, w / 2, h / 2);

    ctx.beginPath();
    // Start at the top-left corner, moving right
    ctx.moveTo(x + r, y);
    // Line to the top-right corner
    ctx.lineTo(x + w - r, y);
    // Arc to the top-right corner
    ctx.arcTo(x + w, y, x + w, y + r, r);
    // Line to the bottom-right corner
    ctx.lineTo(x + w, y + h - r);
    // Arc to the bottom-right corner
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    // Line to the bottom-left corner
    ctx.lineTo(x + r, y + h);
    // Arc to the bottom-left corner
    ctx.arcTo(x, y + h, x, y + h - r, r);
    // Line to the top-left corner
    ctx.lineTo(x, y + r);
    // Arc back to the start point
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();


  //   const r = Math.min(radius, w / 2, h / 2);

  //   ctx.beginPath();
  //   // Top-left to top-right
  //   ctx.moveTo(x + r, y);
  //   ctx.lineTo(x + w - r, y);
  //   ctx.arcTo(x + w, y, x + w, y + r, r);
  //   // Top-right to bottom-right
  //   ctx.lineTo(x + w, y + h - r);
  //   ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  //   // Bottom-right to bottom-left
  //   ctx.lineTo(x + r, y + h);
  //   ctx.arcTo(x, y + h, x, y + h - r, r);
  //   // Bottom-left back to top-left
  //   ctx.lineTo(x, y + r);
  //   ctx.arcTo(x, y, x + r, y, r);
  //   ctx.closePath();
  //   ctx.stroke();

  //  const squareSize = 20
  //   // Draw square at the bottom-left corner
  //   ctx.beginPath();
  //   ctx.rect(x, y + h - squareSize, squareSize, squareSize);
  //   ctx.stroke();

  //   // Draw square at the bottom-right corner
  //   ctx.beginPath();
  //   ctx.rect(x + w - squareSize, y + h - squareSize, squareSize, squareSize);
  //   ctx.stroke();
  }

  function init(plot) {
    plot.hooks.processRawData.push(function (plot, series, data, datapoints) {
      var c = plot.getOptions().rectCurve;
      if (!c) return;

      datapoints.format = [
        { x: true, number: true, required: true },
        { x: true, number: true, required: true },
        { y: true, number: true, required: true }
      ];
    });

    plot.hooks.processDatapoints.push(function (series, datapoints) {
      var hazGrey = false;
      for (var s in series) {
        var data = series[s].data;
        for (var i in data) {
          var val = data[i][2];
          if (val < 0) {
            hazGrey = true;
            break;
          }
        }
        if (hazGrey) break;
      }
      if (!hazGrey) {
        var yaxis = plot.getAxes().yaxis;
        yaxis.min = 0;
        yaxis.datamin = 0;
      }
    });

    plot.hooks.draw.push(function (plot, ctx) {
      var c = plot.getOptions().rectCurve;
      if (!c) return;
      var series = plot.getData(),
        plotOffset = plot.getPlotOffset(),
        defStrokeCol = plot.getOptions().strokeColor,
        opacity = plot.getOptions().opacity;

      for (var s in series) {
        var col = series[s].fillColor,
        strokeCol = series[s].strokeColor || defStrokeCol,
          lineWidth = series[s].lineWidth,
          fillColor = series[s].fillColor,
          opacity = series[s].opacity
        var data = series[s].data;

        ctx.save();
        ctx.translate(plotOffset.left, plotOffset.top);

        var xaxis = plot.getAxes().xaxis,
          yaxis = plot.getAxes().yaxis;
        // console.log('xaxis', xaxis)
        // console.log('yaixs', yaxis)
        ctx.rect(0, 0, xaxis.p2c(xaxis.max), yaxis.p2c(yaxis.min));
        ctx.clip();
        var yaxis_zero = yaxis.p2c(0);

        ctx.fillStyle = $.color.parse(fillColor).add('a', opacity - 1).toString();
        for (var i in data) {

          var l = xaxis.p2c(data[i][0]),
            r = xaxis.p2c(data[i][1]),
            x = (l + r) / 2,
            val = Math.abs(data[i][2]),
            h = yaxis.p2c(yaxis.max - val),
            w = Math.abs(x - l);
          // console.log(yaxis_zero)
          // console.log(h)
          // console.log(x)
          ctx.save();
          ctx.translate(x, yaxis_zero - h);

          var inside = (l >= 0 && r < plot.width());
          // console.log('drawEllipse')

          drawEllipse(ctx, -w, 0, w * 2, h * 2, inside);
          if (inside) {
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = strokeCol;
            // console.log(ctx.fillStyle)
            if (opacity != 0) ctx.fill();
            if (strokeCol != null) ctx.stroke();
          } else {
            ctx.strokeStyle = 'grey';
            ctx.stroke();
          }

          ctx.restore();
        }
        // console.log('ctx.strokeStyle', ctx.strokeStyle)
        // console.log('ctx.fillStyle', ctx.fillStyle)

        // console.log(ctx)
        ctx.beginPath();
        ctx.moveTo(0, yaxis_zero);
        ctx.lineTo(plot.width(), yaxis_zero);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: "rectCurve",
    version: "0.1"
  });
})(jQuery);

(function ($) {
  var options = {
    // strokeColor: null,
    // opacity: 0,
    // lineWidth: null
    // curvy: true // this must be set for the plugin to take effect
  };

  const drawEllipse = (ctx, x, y, w, h, curveUp = false) => {
    // console.log('basicCurev drawEllipse')

    var kappa = .5522848;
    let ox = (w / 2) * kappa // control point offset horizontal
    let oy = (h / 2) * kappa // control point offset vertical
    let xe = x + w          // x-end
    let ye = y + h           // y-end
    let xm = x + w / 2       // x-middle
    let ym = y + h / 2       // y-middle

    ctx.beginPath();
    if (curveUp) {
      ctx.moveTo(x, ym);
      ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
      ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    } else {
      ctx.moveTo(xe, ym);
      ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
      ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
    }
    ctx.closePath();

  }

  function init(plot) {
    plot.hooks.processRawData.push(function (plot, series, data, datapoints) {
      var c = plot.getOptions().basicCurve;
      if (!c) return;

      datapoints.format = [
        { x: true, number: true, required: true },
        { x: true, number: true, required: true },
        { y: true, number: true, required: true }
      ];
    });

    plot.hooks.processDatapoints.push(function (series, datapoints) {
      var hazGrey = false;
      for (var s in series) {
        var data = series[s].data;
        for (var i in data) {
          var val = data[i][2];
          if (val < 0) {
            hazGrey = true;
            break;
          }
        }
        if (hazGrey) break;
      }
      if (!hazGrey) {
        var yaxis = plot.getAxes().yaxis;
        yaxis.min = 0;
        yaxis.datamin = 0;
      }
    });

    plot.hooks.draw.push(function (plot, ctx) {
      var c = plot.getOptions().basicCurve;
      if (!c) return;
      var series = plot.getData(),
        plotOffset = plot.getPlotOffset(),
        defStrokeCol = plot.getOptions().strokeColor,
        opacity = plot.getOptions().opacity;

      for (var s in series) {
        var col = series[s].fillColor,
        strokeCol = series[s].strokeColor || defStrokeCol,
          lineWidth = series[s].lineWidth,
          fillColor = series[s].fillColor,
          opacity = series[s].opacity
        var data = series[s].data;

        ctx.save();
        ctx.translate(plotOffset.left, plotOffset.top);

        var xaxis = plot.getAxes().xaxis,
          yaxis = plot.getAxes().yaxis;
        // console.log('xaxis', xaxis)
        // console.log('yaixs', yaxis)
        ctx.rect(0, 0, xaxis.p2c(xaxis.max), yaxis.p2c(yaxis.min));
        ctx.clip();
        var yaxis_zero = yaxis.p2c(0);

        ctx.fillStyle = $.color.parse(fillColor).add('a', opacity - 1).toString();
        for (var i in data) {

          var l = xaxis.p2c(data[i][0]),
            r = xaxis.p2c(data[i][1]),
            x = (l + r) / 2,
            val = Math.abs(data[i][2]),
            h = yaxis.p2c(yaxis.max - val),
            w = Math.abs(x - l);
          // console.log(yaxis_zero)
          // console.log(h)
          // console.log(x)
          ctx.save();
          ctx.translate(x, yaxis_zero - h);

          var inside = (l >= 0 && r < plot.width());
          // console.log('drawEllipse')

          drawEllipse(ctx, -w, 0, w * 2, h * 2, inside);
          if (inside) {
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = strokeCol;
            // console.log(ctx.fillStyle)
            if (opacity != 0) ctx.fill();
            if (strokeCol != null) ctx.stroke();
          } else {
            ctx.strokeStyle = 'grey';
            ctx.stroke();
          }

          ctx.restore();
        }
        // console.log('ctx.strokeStyle', ctx.strokeStyle)
        // console.log('ctx.fillStyle', ctx.fillStyle)

        // console.log(ctx)
        ctx.beginPath();
        ctx.moveTo(0, yaxis_zero);
        ctx.lineTo(plot.width(), yaxis_zero);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: "basicCurve",
    version: "0.1"
  });
})(jQuery);


(function ($) {
  var options = {
    strokeColor: null,
    opacity: 0,
    // curveStyle: ''
    // curvy: true // this must be set for the plugin to take effect
  };

  const drawEllipse = (ctx, x, y, w, h, curveUp) => {
      ctx.beginPath();

      // Calculate the height to be proportional to the span between the left and right points
      // For example, if we want the height to be half of the width, we multiply by 0.5
      const proportionalHeight = w * 0.5;

      // The ellipse method creates an elliptical arc centered at (x, y) with the radii radiusX and radiusY.
      // The rotation parameter sets the rotation for the ellipse, which we set to 0 since we're not rotating the ellipse.
      // The startAngle and endAngle parameters determine the start point and end point of the arc in radians.
      // We draw a full ellipse by going from 0 to 2 * Math.PI.
      // The anticlockwise parameter is a boolean which, when true, draws the arc counter-clockwise between the start and end angles.
      // We use the curveUp boolean to decide whether to draw the ellipse above or below the midpoint (ym).
      let ym = y + h / 2; // y-middle

      if (curveUp) {
        // Draw the top half of the ellipse if curveUp is true
        ctx.ellipse(x + w / 2, ym, w / 2, proportionalHeight / 2, 0, 0, Math.PI, true);
      } else {
        // Draw the bottom half of the ellipse if curveUp is false
        ctx.ellipse(x + w / 2, ym, w / 2, proportionalHeight / 2, 0, Math.PI, 2 * Math.PI, true);
      }

      ctx.closePath();

      // Style the ellipse
      // ctx.fillStyle = 'rgba(76, 175, 80, 0.25)'; // A light green with some transparency
      // ctx.fill();
      ctx.strokeStyle = '#a0aec0'; // A matching solid green for the border
      ctx.lineWidth = 1; // Set the line width for the border
      ctx.stroke();
    }

  function init(plot) {

    plot.hooks.processRawData.push(function (plot, series, data, datapoints) {
      var c = plot.getOptions().flatCurve;
      if (!c) return;

      datapoints.format = [
        { x: true, number: true, required: true },
        { x: true, number: true, required: true },
        { y: true, number: true, required: true }
      ];
    });

    plot.hooks.processDatapoints.push(function (series, datapoints) {
      var hazGrey = false;
      for (var s in series) {
        var data = series[s].data;
        for (var i in data) {
          var val = data[i][2];
          if (val < 0) {
            hazGrey = true;
            break;
          }
        }
        if (hazGrey) break;
      }
      if (!hazGrey) {
        var yaxis = plot.getAxes().yaxis;
        yaxis.min = 0;
        yaxis.datamin = 0;
      }
    });

    plot.hooks.draw.push(function (plot, ctx) {
      var c = plot.getOptions().flatCurve;
      if (!c) return;
      var series = plot.getData(),
        plotOffset = plot.getPlotOffset(),
        defStrokeCol = plot.getOptions().strokeColor,
        opacity = plot.getOptions().opacity;
      console.log(series)
      for (var s in series) {
        var col = series[s].fillColor,
          strokeCol = series[s].strokeColor || defStrokeCol,
          lineWidth = series[s].lineWidth,
          fillColor = series[s].fillColor,
          opacity = series[s].opacity
        var data = series[s].data;

        ctx.save();
        ctx.translate(plotOffset.left, plotOffset.top);

        var xaxis = plot.getAxes().xaxis,
          yaxis = plot.getAxes().yaxis;
        // console.log('xaxis', xaxis)
        // console.log('yaixs', yaxis)
        ctx.rect(0, 0, xaxis.p2c(xaxis.max), yaxis.p2c(yaxis.min));
        ctx.clip();
        var yaxis_zero = yaxis.p2c(0);

        // ctx.fillStyle = $.color.parse(col).add('a', opacity - 1).toString();
        ctx.fillStyle = $.color.parse(fillColor).add('a', opacity - 1).toString();
        for (var i in data) {

          var l = xaxis.p2c(data[i][0]),
            r = xaxis.p2c(data[i][1]),
            x = (l + r) / 2,
            val = Math.abs(data[i][2]),
            h = yaxis.p2c(yaxis.max - val),
            w = Math.abs(x - l);
          // console.log(yaxis_zero)
          // console.log(h)
          // console.log(x)
          ctx.save();
          ctx.translate(x, yaxis_zero - h);

          var inside = (l >= 0 && r < plot.width());
          // console.log('drawEllipse')

          drawEllipse(ctx, -w, 0, w * 2, h * 2, inside);
          if (inside) {
            ctx.lineWidth = lineWidth
            ctx.strokeStyle = strokeCol;
            console.log(opacity)
            if (opacity != 0) ctx.fill();
            if (strokeCol != null) ctx.stroke();
          } else {
            ctx.strokeStyle = 'grey';
            ctx.stroke();
          }

          ctx.restore();
        }
        // console.log('ctx.strokeStyle', ctx.strokeStyle)
        // console.log('ctx.fillStyle', ctx.fillStyle)

        // console.log(ctx)
        ctx.beginPath();
        ctx.moveTo(0, yaxis_zero);
        ctx.lineTo(plot.width(), yaxis_zero);
        ctx.closePath();
        ctx.stroke();

        ctx.restore();
      }
    });
  }

  $.plot.plugins.push({
    init: init,
    options: options,
    name: "flatCurve",
    version: "0.1"
  });
})(jQuery);



var global = global || window