var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// mock/index.js
var mock_exports = {};
__export(mock_exports, {
  default: () => mock_default
});
module.exports = __toCommonJS(mock_exports);
var import_mockjs = __toESM(require("mockjs"));
var Random = import_mockjs.default.Random;
var generateGenomicPosition = () => {
  const chrom = Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]);
  const start = Random.integer(1e3, 1e5);
  const end = start + Random.integer(5e3, 5e4);
  return { chrom, start, end };
};
var generateGenomicData = (pageSize, regions = null) => {
  const isPositionInRegions = (position, regions2) => {
    if (!regions2 || regions2.length === 0)
      return true;
    return regions2.some(
      (region) => position.chrom === region.chrom && position.start >= region.start && position.end <= region.end
    );
  };
  const generateRecords = (count, template) => {
    return Array(count).fill(null).map(() => {
      const position = generateGenomicPosition();
      return {
        sample_id: `GSM${Random.integer(1e4, 99999)}`,
        tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
        health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
        ...position,
        ...template
      };
    });
  };
  const totalCompartments = Random.integer(1e4, 15e3);
  const totalDomains = Random.integer(12e3, 18e3);
  const totalLoops = Random.integer(15e3, 2e4);
  const rawData = {
    "compartments": {
      total: totalCompartments,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalCompartments / pageSize),
      data: generateRecords(pageSize, {
        "E1score": Random.float(0, 1, 2, 2)
      })
    },
    "domains": {
      total: totalDomains,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalDomains / pageSize),
      data: generateRecords(pageSize, {
        "domain_type": Random.pick(["TAD", "LAD", "CTCF"]),
        "score": Random.float(0, 1, 2, 2)
      })
    },
    "loops": {
      total: totalLoops,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalLoops / pageSize),
      data: Array(pageSize).fill(null).map(() => ({
        sample_id: `GSM${Random.integer(1e4, 99999)}`,
        tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
        health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
        chrom: Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]),
        start: Random.integer(1e3, 1e5),
        end: Random.integer(1e5, 2e5),
        mate_chrom: Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]),
        mate_start: Random.integer(2e5, 3e5),
        mate_end: Random.integer(3e5, 4e5),
        strength: Random.float(0, 1, 2, 2)
      }))
    }
  };
  if (regions && regions.length > 0) {
    Object.keys(rawData).forEach((key) => {
      let filteredData;
      if (key === "loops") {
        filteredData = rawData[key].data.filter((item) => {
          const pos1InRegion = isPositionInRegions(
            { chrom: item.chrom, start: item.start, end: item.end },
            regions
          );
          const pos2InRegion = isPositionInRegions(
            { chrom: item.mate_chrom, start: item.mate_start, end: item.mate_end },
            regions
          );
          return pos1InRegion || pos2InRegion;
        });
      } else {
        filteredData = rawData[key].data.filter(
          (item) => isPositionInRegions(item, regions)
        );
      }
      if (filteredData.length === 0) {
        const defaultCount = Math.min(pageSize, 5);
        filteredData = Array(defaultCount).fill(null).map(() => {
          const baseData = {
            sample_id: `GSM${Random.integer(1e4, 99999)}`,
            tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
            health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
            chrom: regions[0].chrom,
            start: Random.integer(regions[0].start, regions[0].end - 1e3),
            end: Random.integer(regions[0].start + 1e3, regions[0].end)
          };
          if (key === "compartments") {
            return { ...baseData, E1score: Random.float(0, 1, 2, 2) };
          } else if (key === "domains") {
            return {
              ...baseData,
              domain_type: Random.pick(["TAD", "LAD", "CTCF"]),
              score: Random.float(0, 1, 2, 2)
            };
          }
          return baseData;
        });
      }
      rawData[key].data = filteredData;
      rawData[key].total = filteredData.length;
      rawData[key].total_pages = Math.ceil(filteredData.length / pageSize);
    });
  }
  return rawData;
};
var processQueryResult = (dataType, page, pageSize, filters, regions) => {
  const data = generateGenomicData(pageSize, regions)[dataType];
  data.page = page;
  data.page_size = pageSize;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  data.data = data.data.slice(startIndex, endIndex);
  return data;
};
var parseQueryString = (url) => {
  const queryString = url.split("?")[1] || "";
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
};
var mock_default = [
  {
    // URL示例: /api/genomic-features?data_types=compartments,domains&chrom=chr1&start=1000&end=50000
    url: "/api/genomic-features",
    method: "get",
    response: (config) => {
      const params = parseQueryString(config.url);
      const data_types = params.data_types ? params.data_types.split(",") : [];
      const page = parseInt(params.page) || 1;
      const page_size = parseInt(params.page_size) || 10;
      const filters = params.filters ? JSON.parse(decodeURIComponent(params.filters)) : {};
      let regions = null;
      if (params.chrom && params.start && params.end) {
        regions = [{
          chrom: params.chrom,
          start: parseInt(params.start),
          end: parseInt(params.end)
        }];
      }
      const response = {};
      if (data_types.includes("compartments")) {
        response.compartments = processQueryResult("compartments", page, page_size, filters, regions);
      }
      if (data_types.includes("domains")) {
        response.domains = processQueryResult("domains", page, page_size, filters, regions);
      }
      if (data_types.includes("loops")) {
        response.loops = processQueryResult("loops", page, page_size, filters, regions);
      }
      return {
        code: 200,
        data: response
      };
    }
  },
  {
    // URL示例: /api/region-summary?chrom=chr1&start=1000&end=50000
    url: "/api/region-summary",
    // 移除正则表达式，使用简单的字符串匹配
    method: "get",
    response: (config) => {
      const { chrom, start, end } = config.query;
      const region = {
        chrom,
        start: parseInt(start),
        end: parseInt(end)
      };
      const summary = {
        region,
        summary: {
          location_type: Random.pick(["gene_promoter", "intergenic", "gene_body"]),
          portions: {
            a_compartment: Random.float(0, 1, 2, 2),
            contact_domains: Random.float(0, 1, 2, 2),
            loops: Random.float(0, 1, 2, 2),
            enhancer: Random.float(0, 1, 2, 2)
          }
        }
      };
      return {
        code: 200,
        data: summary
      };
    }
  }
];
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay9pbmRleC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCIvbW50L1VzZXJzL2pybGl1LzNER2Vub21lSHViL2Zyb250X2VuZC9tb2NrL2luZGV4LmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIi9tbnQvVXNlcnMvanJsaXUvM0RHZW5vbWVIdWIvZnJvbnRfZW5kL21vY2tcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL21udC9Vc2Vycy9qcmxpdS8zREdlbm9tZUh1Yi9mcm9udF9lbmQvbW9jay9pbmRleC5qc1wiO2ltcG9ydCBNb2NrIGZyb20gJ21vY2tqcyc7XG5jb25zdCBSYW5kb20gPSBNb2NrLlJhbmRvbTtcblxuLy8gXHU3NTFGXHU2MjEwXHU2N0QzXHU4MjcyXHU0RjUzXHU0RjREXHU3RjZFXHU3Njg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG5jb25zdCBnZW5lcmF0ZUdlbm9taWNQb3NpdGlvbiA9ICgpID0+IHtcbiAgY29uc3QgY2hyb20gPSBSYW5kb20ucGljayhbXCJjaHIxXCIsIFwiY2hyMlwiLCBcImNocjNcIiwgXCJjaHI0XCIsIFwiY2hyNVwiXSk7XG4gIGNvbnN0IHN0YXJ0ID0gUmFuZG9tLmludGVnZXIoMTAwMCwgMTAwMDAwKTtcbiAgY29uc3QgZW5kID0gc3RhcnQgKyBSYW5kb20uaW50ZWdlcig1MDAwLCA1MDAwMCk7XG4gIHJldHVybiB7IGNocm9tLCBzdGFydCwgZW5kIH07XG59O1xuXG4vLyBcdTc1MUZcdTYyMTBcdTU3RkFcdTc4NDBcdTY1NzBcdTYzNkVcdTZBMjFcdTY3N0ZcbmNvbnN0IGdlbmVyYXRlR2Vub21pY0RhdGEgPSAocGFnZVNpemUsIHJlZ2lvbnMgPSBudWxsKSA9PiB7XG4gIC8vIFx1NjhDMFx1NjdFNVx1NEY0RFx1N0Y2RVx1NjYyRlx1NTQyNlx1NTcyOFx1NjMwN1x1NUI5QVx1NTMzQVx1NTdERlx1NTE4NVxuICBjb25zdCBpc1Bvc2l0aW9uSW5SZWdpb25zID0gKHBvc2l0aW9uLCByZWdpb25zKSA9PiB7XG4gICAgaWYgKCFyZWdpb25zIHx8IHJlZ2lvbnMubGVuZ3RoID09PSAwKSByZXR1cm4gdHJ1ZTtcbiAgICByZXR1cm4gcmVnaW9ucy5zb21lKHJlZ2lvbiA9PiBcbiAgICAgIHBvc2l0aW9uLmNocm9tID09PSByZWdpb24uY2hyb20gJiYgXG4gICAgICBwb3NpdGlvbi5zdGFydCA+PSByZWdpb24uc3RhcnQgJiYgXG4gICAgICBwb3NpdGlvbi5lbmQgPD0gcmVnaW9uLmVuZFxuICAgICk7XG4gIH07XG5cbiAgLy8gXHU3NTFGXHU2MjEwXHU1OTFBXHU2NzYxXHU4QkIwXHU1RjU1XHU3Njg0XHU4Rjg1XHU1MkE5XHU1MUZEXHU2NTcwXG4gIGNvbnN0IGdlbmVyYXRlUmVjb3JkcyA9IChjb3VudCwgdGVtcGxhdGUpID0+IHtcbiAgICByZXR1cm4gQXJyYXkoY291bnQpLmZpbGwobnVsbCkubWFwKCgpID0+IHtcbiAgICAgIGNvbnN0IHBvc2l0aW9uID0gZ2VuZXJhdGVHZW5vbWljUG9zaXRpb24oKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHNhbXBsZV9pZDogYEdTTSR7UmFuZG9tLmludGVnZXIoMTAwMDAsIDk5OTk5KX1gLFxuICAgICAgICB0aXNzdWU6IFJhbmRvbS5waWNrKFtcImxpdmVyXCIsIFwiYnJhaW5cIiwgXCJoZWFydFwiLCBcImx1bmdcIiwgXCJraWRuZXlcIl0pLFxuICAgICAgICBoZWFsdGhfc3RhdHVzOiBSYW5kb20ucGljayhbXCJoZWFsdGh5XCIsIFwiZGlzZWFzZWRcIiwgXCJub3JtYWxcIiwgXCJjYW5jZXJcIl0pLFxuICAgICAgICAuLi5wb3NpdGlvbixcbiAgICAgICAgLi4udGVtcGxhdGVcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gXHU0RTNBXHU2QkNGXHU3OUNEXHU2NTcwXHU2MzZFXHU3QzdCXHU1NzhCXHU3NTFGXHU2MjEwXHU1MjFEXHU1OUNCXHU2NTcwXHU2MzZFXG4gIGNvbnN0IHRvdGFsQ29tcGFydG1lbnRzID0gUmFuZG9tLmludGVnZXIoMTAwMDAsIDE1MDAwKTtcbiAgY29uc3QgdG90YWxEb21haW5zID0gUmFuZG9tLmludGVnZXIoMTIwMDAsIDE4MDAwKTtcbiAgY29uc3QgdG90YWxMb29wcyA9IFJhbmRvbS5pbnRlZ2VyKDE1MDAwLCAyMDAwMCk7XG5cbiAgY29uc3QgcmF3RGF0YSA9IHtcbiAgICAnY29tcGFydG1lbnRzJzoge1xuICAgICAgdG90YWw6IHRvdGFsQ29tcGFydG1lbnRzLFxuICAgICAgcGFnZTogMSxcbiAgICAgIHBhZ2Vfc2l6ZTogcGFnZVNpemUsXG4gICAgICB0b3RhbF9wYWdlczogTWF0aC5jZWlsKHRvdGFsQ29tcGFydG1lbnRzIC8gcGFnZVNpemUpLFxuICAgICAgZGF0YTogZ2VuZXJhdGVSZWNvcmRzKHBhZ2VTaXplLCB7XG4gICAgICAgICdFMXNjb3JlJzogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpXG4gICAgICB9KVxuICAgIH0sXG4gICAgXG4gICAgJ2RvbWFpbnMnOiB7XG4gICAgICB0b3RhbDogdG90YWxEb21haW5zLFxuICAgICAgcGFnZTogMSxcbiAgICAgIHBhZ2Vfc2l6ZTogcGFnZVNpemUsXG4gICAgICB0b3RhbF9wYWdlczogTWF0aC5jZWlsKHRvdGFsRG9tYWlucyAvIHBhZ2VTaXplKSxcbiAgICAgIGRhdGE6IGdlbmVyYXRlUmVjb3JkcyhwYWdlU2l6ZSwge1xuICAgICAgICAnZG9tYWluX3R5cGUnOiBSYW5kb20ucGljayhbXCJUQURcIiwgXCJMQURcIiwgXCJDVENGXCJdKSxcbiAgICAgICAgJ3Njb3JlJzogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpXG4gICAgICB9KVxuICAgIH0sXG4gICAgXG4gICAgJ2xvb3BzJzoge1xuICAgICAgdG90YWw6IHRvdGFsTG9vcHMsXG4gICAgICBwYWdlOiAxLFxuICAgICAgcGFnZV9zaXplOiBwYWdlU2l6ZSxcbiAgICAgIHRvdGFsX3BhZ2VzOiBNYXRoLmNlaWwodG90YWxMb29wcyAvIHBhZ2VTaXplKSxcbiAgICAgIGRhdGE6IEFycmF5KHBhZ2VTaXplKS5maWxsKG51bGwpLm1hcCgoKSA9PiAoe1xuICAgICAgICBzYW1wbGVfaWQ6IGBHU00ke1JhbmRvbS5pbnRlZ2VyKDEwMDAwLCA5OTk5OSl9YCxcbiAgICAgICAgdGlzc3VlOiBSYW5kb20ucGljayhbXCJsaXZlclwiLCBcImJyYWluXCIsIFwiaGVhcnRcIiwgXCJsdW5nXCIsIFwia2lkbmV5XCJdKSxcbiAgICAgICAgaGVhbHRoX3N0YXR1czogUmFuZG9tLnBpY2soW1wiaGVhbHRoeVwiLCBcImRpc2Vhc2VkXCIsIFwibm9ybWFsXCIsIFwiY2FuY2VyXCJdKSxcbiAgICAgICAgY2hyb206IFJhbmRvbS5waWNrKFtcImNocjFcIiwgXCJjaHIyXCIsIFwiY2hyM1wiLCBcImNocjRcIiwgXCJjaHI1XCJdKSxcbiAgICAgICAgc3RhcnQ6IFJhbmRvbS5pbnRlZ2VyKDEwMDAsIDEwMDAwMCksXG4gICAgICAgIGVuZDogUmFuZG9tLmludGVnZXIoMTAwMDAwLCAyMDAwMDApLFxuICAgICAgICBtYXRlX2Nocm9tOiBSYW5kb20ucGljayhbXCJjaHIxXCIsIFwiY2hyMlwiLCBcImNocjNcIiwgXCJjaHI0XCIsIFwiY2hyNVwiXSksXG4gICAgICAgIG1hdGVfc3RhcnQ6IFJhbmRvbS5pbnRlZ2VyKDIwMDAwMCwgMzAwMDAwKSxcbiAgICAgICAgbWF0ZV9lbmQ6IFJhbmRvbS5pbnRlZ2VyKDMwMDAwMCwgNDAwMDAwKSxcbiAgICAgICAgc3RyZW5ndGg6IFJhbmRvbS5mbG9hdCgwLCAxLCAyLCAyKVxuICAgICAgfSkpXG4gICAgfVxuICB9O1xuXG4gIC8vIFx1NjgzOVx1NjM2RXJlZ2lvbnNcdThGQzdcdTZFRTRcdTY1NzBcdTYzNkVcbiAgaWYgKHJlZ2lvbnMgJiYgcmVnaW9ucy5sZW5ndGggPiAwKSB7XG4gICAgT2JqZWN0LmtleXMocmF3RGF0YSkuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgbGV0IGZpbHRlcmVkRGF0YTtcbiAgICAgIGlmIChrZXkgPT09ICdsb29wcycpIHtcbiAgICAgICAgZmlsdGVyZWREYXRhID0gcmF3RGF0YVtrZXldLmRhdGEuZmlsdGVyKGl0ZW0gPT4ge1xuICAgICAgICAgIGNvbnN0IHBvczFJblJlZ2lvbiA9IGlzUG9zaXRpb25JblJlZ2lvbnMoXG4gICAgICAgICAgICB7IGNocm9tOiBpdGVtLmNocm9tLCBzdGFydDogaXRlbS5zdGFydCwgZW5kOiBpdGVtLmVuZCB9LCBcbiAgICAgICAgICAgIHJlZ2lvbnNcbiAgICAgICAgICApO1xuICAgICAgICAgIGNvbnN0IHBvczJJblJlZ2lvbiA9IGlzUG9zaXRpb25JblJlZ2lvbnMoXG4gICAgICAgICAgICB7IGNocm9tOiBpdGVtLm1hdGVfY2hyb20sIHN0YXJ0OiBpdGVtLm1hdGVfc3RhcnQsIGVuZDogaXRlbS5tYXRlX2VuZCB9LCBcbiAgICAgICAgICAgIHJlZ2lvbnNcbiAgICAgICAgICApO1xuICAgICAgICAgIHJldHVybiBwb3MxSW5SZWdpb24gfHwgcG9zMkluUmVnaW9uO1xuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbHRlcmVkRGF0YSA9IHJhd0RhdGFba2V5XS5kYXRhLmZpbHRlcihpdGVtID0+IFxuICAgICAgICAgIGlzUG9zaXRpb25JblJlZ2lvbnMoaXRlbSwgcmVnaW9ucylcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIFxuICAgICAgLy8gXHU3ODZFXHU0RkREXHU4RkM3XHU2RUU0XHU1NDBFXHU4MUYzXHU1QzExXHU2NzA5XHU0RTAwXHU0RTlCXHU2NTcwXHU2MzZFXG4gICAgICBpZiAoZmlsdGVyZWREYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBcdTc1MUZcdTYyMTBcdTRFMDBcdTRFOUJcdTdCMjZcdTU0MDhcdTUzM0FcdTU3REZcdTY3NjFcdTRFRjZcdTc2ODRcdTY1NzBcdTYzNkVcbiAgICAgICAgY29uc3QgZGVmYXVsdENvdW50ID0gTWF0aC5taW4ocGFnZVNpemUsIDUpO1xuICAgICAgICBmaWx0ZXJlZERhdGEgPSBBcnJheShkZWZhdWx0Q291bnQpLmZpbGwobnVsbCkubWFwKCgpID0+IHtcbiAgICAgICAgICBjb25zdCBiYXNlRGF0YSA9IHtcbiAgICAgICAgICAgIHNhbXBsZV9pZDogYEdTTSR7UmFuZG9tLmludGVnZXIoMTAwMDAsIDk5OTk5KX1gLFxuICAgICAgICAgICAgdGlzc3VlOiBSYW5kb20ucGljayhbXCJsaXZlclwiLCBcImJyYWluXCIsIFwiaGVhcnRcIiwgXCJsdW5nXCIsIFwia2lkbmV5XCJdKSxcbiAgICAgICAgICAgIGhlYWx0aF9zdGF0dXM6IFJhbmRvbS5waWNrKFtcImhlYWx0aHlcIiwgXCJkaXNlYXNlZFwiLCBcIm5vcm1hbFwiLCBcImNhbmNlclwiXSksXG4gICAgICAgICAgICBjaHJvbTogcmVnaW9uc1swXS5jaHJvbSxcbiAgICAgICAgICAgIHN0YXJ0OiBSYW5kb20uaW50ZWdlcihyZWdpb25zWzBdLnN0YXJ0LCByZWdpb25zWzBdLmVuZCAtIDEwMDApLFxuICAgICAgICAgICAgZW5kOiBSYW5kb20uaW50ZWdlcihyZWdpb25zWzBdLnN0YXJ0ICsgMTAwMCwgcmVnaW9uc1swXS5lbmQpXG4gICAgICAgICAgfTtcblxuICAgICAgICAgIGlmIChrZXkgPT09ICdjb21wYXJ0bWVudHMnKSB7XG4gICAgICAgICAgICByZXR1cm4geyAuLi5iYXNlRGF0YSwgRTFzY29yZTogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpIH07XG4gICAgICAgICAgfSBlbHNlIGlmIChrZXkgPT09ICdkb21haW5zJykge1xuICAgICAgICAgICAgcmV0dXJuIHsgXG4gICAgICAgICAgICAgIC4uLmJhc2VEYXRhLCBcbiAgICAgICAgICAgICAgZG9tYWluX3R5cGU6IFJhbmRvbS5waWNrKFtcIlRBRFwiLCBcIkxBRFwiLCBcIkNUQ0ZcIl0pLFxuICAgICAgICAgICAgICBzY29yZTogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gYmFzZURhdGE7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgXG4gICAgICByYXdEYXRhW2tleV0uZGF0YSA9IGZpbHRlcmVkRGF0YTtcbiAgICAgIHJhd0RhdGFba2V5XS50b3RhbCA9IGZpbHRlcmVkRGF0YS5sZW5ndGg7XG4gICAgICByYXdEYXRhW2tleV0udG90YWxfcGFnZXMgPSBNYXRoLmNlaWwoZmlsdGVyZWREYXRhLmxlbmd0aCAvIHBhZ2VTaXplKTtcbiAgICB9KTtcbiAgfVxuXG4gIHJldHVybiByYXdEYXRhO1xufTtcblxuLy8gXHU1OTA0XHU3NDA2XHU1MjA2XHU5ODc1XHU1NDhDXHU4RkM3XHU2RUU0XHU3Njg0XHU1MUZEXHU2NTcwXG5jb25zdCBwcm9jZXNzUXVlcnlSZXN1bHQgPSAoZGF0YVR5cGUsIHBhZ2UsIHBhZ2VTaXplLCBmaWx0ZXJzLCByZWdpb25zKSA9PiB7XG4gIGNvbnN0IGRhdGEgPSBnZW5lcmF0ZUdlbm9taWNEYXRhKHBhZ2VTaXplLCByZWdpb25zKVtkYXRhVHlwZV07XG4gIFxuICAvLyBcdTY2RjRcdTY1QjBcdTUyMDZcdTk4NzVcdTRGRTFcdTYwNkZcbiAgZGF0YS5wYWdlID0gcGFnZTtcbiAgZGF0YS5wYWdlX3NpemUgPSBwYWdlU2l6ZTtcbiAgXG4gIC8vIFx1OEJBMVx1N0I5N1x1OEQ3N1x1NTlDQlx1NTQ4Q1x1N0VEM1x1Njc1Rlx1N0QyMlx1NUYxNVxuICBjb25zdCBzdGFydEluZGV4ID0gKHBhZ2UgLSAxKSAqIHBhZ2VTaXplO1xuICBjb25zdCBlbmRJbmRleCA9IHN0YXJ0SW5kZXggKyBwYWdlU2l6ZTtcbiAgXG4gIC8vIFx1NjIyQVx1NTNENlx1NUY1M1x1NTI0RFx1OTg3NVx1NzY4NFx1NjU3MFx1NjM2RVxuICBkYXRhLmRhdGEgPSBkYXRhLmRhdGEuc2xpY2Uoc3RhcnRJbmRleCwgZW5kSW5kZXgpO1xuICBcbiAgcmV0dXJuIGRhdGE7XG59O1xuXG4vLyBcdTg5RTNcdTY3OTBVUkxcdTY3RTVcdThCRTJcdTUzQzJcdTY1NzBcdTc2ODRcdThGODVcdTUyQTlcdTUxRkRcdTY1NzBcbmNvbnN0IHBhcnNlUXVlcnlTdHJpbmcgPSAodXJsKSA9PiB7XG4gIGNvbnN0IHF1ZXJ5U3RyaW5nID0gdXJsLnNwbGl0KCc/JylbMV0gfHwgJyc7XG4gIGNvbnN0IHBhcmFtcyA9IG5ldyBVUkxTZWFyY2hQYXJhbXMocXVlcnlTdHJpbmcpO1xuICByZXR1cm4gT2JqZWN0LmZyb21FbnRyaWVzKHBhcmFtcy5lbnRyaWVzKCkpO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgW1xuICB7XG4gICAgLy8gVVJMXHU3OTNBXHU0RjhCOiAvYXBpL2dlbm9taWMtZmVhdHVyZXM/ZGF0YV90eXBlcz1jb21wYXJ0bWVudHMsZG9tYWlucyZjaHJvbT1jaHIxJnN0YXJ0PTEwMDAmZW5kPTUwMDAwXG4gICAgdXJsOiAnL2FwaS9nZW5vbWljLWZlYXR1cmVzJyxcbiAgICBtZXRob2Q6ICdnZXQnLFxuICAgIHJlc3BvbnNlOiAoY29uZmlnKSA9PiB7XG4gICAgICBjb25zdCBwYXJhbXMgPSBwYXJzZVF1ZXJ5U3RyaW5nKGNvbmZpZy51cmwpO1xuICAgICAgY29uc3QgZGF0YV90eXBlcyA9IHBhcmFtcy5kYXRhX3R5cGVzID8gcGFyYW1zLmRhdGFfdHlwZXMuc3BsaXQoJywnKSA6IFtdO1xuICAgICAgY29uc3QgcGFnZSA9IHBhcnNlSW50KHBhcmFtcy5wYWdlKSB8fCAxO1xuICAgICAgY29uc3QgcGFnZV9zaXplID0gcGFyc2VJbnQocGFyYW1zLnBhZ2Vfc2l6ZSkgfHwgMTA7XG4gICAgICBjb25zdCBmaWx0ZXJzID0gcGFyYW1zLmZpbHRlcnMgPyBKU09OLnBhcnNlKGRlY29kZVVSSUNvbXBvbmVudChwYXJhbXMuZmlsdGVycykpIDoge307XG4gICAgICBcbiAgICAgIC8vIFx1NEVDRVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NEUyRFx1NjNEMFx1NTNENlx1NTdGQVx1NTZFMFx1N0VDNFx1NEY0RFx1N0Y2RVxuICAgICAgbGV0IHJlZ2lvbnMgPSBudWxsO1xuICAgICAgaWYgKHBhcmFtcy5jaHJvbSAmJiBwYXJhbXMuc3RhcnQgJiYgcGFyYW1zLmVuZCkge1xuICAgICAgICByZWdpb25zID0gW3tcbiAgICAgICAgICBjaHJvbTogcGFyYW1zLmNocm9tLFxuICAgICAgICAgIHN0YXJ0OiBwYXJzZUludChwYXJhbXMuc3RhcnQpLFxuICAgICAgICAgIGVuZDogcGFyc2VJbnQocGFyYW1zLmVuZClcbiAgICAgICAgfV07XG4gICAgICB9XG4gICAgICBcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0ge307XG4gICAgICBcbiAgICAgIGlmIChkYXRhX3R5cGVzLmluY2x1ZGVzKCdjb21wYXJ0bWVudHMnKSkge1xuICAgICAgICByZXNwb25zZS5jb21wYXJ0bWVudHMgPSBwcm9jZXNzUXVlcnlSZXN1bHQoJ2NvbXBhcnRtZW50cycsIHBhZ2UsIHBhZ2Vfc2l6ZSwgZmlsdGVycywgcmVnaW9ucyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChkYXRhX3R5cGVzLmluY2x1ZGVzKCdkb21haW5zJykpIHtcbiAgICAgICAgcmVzcG9uc2UuZG9tYWlucyA9IHByb2Nlc3NRdWVyeVJlc3VsdCgnZG9tYWlucycsIHBhZ2UsIHBhZ2Vfc2l6ZSwgZmlsdGVycywgcmVnaW9ucyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIGlmIChkYXRhX3R5cGVzLmluY2x1ZGVzKCdsb29wcycpKSB7XG4gICAgICAgIHJlc3BvbnNlLmxvb3BzID0gcHJvY2Vzc1F1ZXJ5UmVzdWx0KCdsb29wcycsIHBhZ2UsIHBhZ2Vfc2l6ZSwgZmlsdGVycywgcmVnaW9ucyk7XG4gICAgICB9XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGNvZGU6IDIwMCxcbiAgICAgICAgZGF0YTogcmVzcG9uc2VcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHtcbiAgICAvLyBVUkxcdTc5M0FcdTRGOEI6IC9hcGkvcmVnaW9uLXN1bW1hcnk/Y2hyb209Y2hyMSZzdGFydD0xMDAwJmVuZD01MDAwMFxuICAgIHVybDogJy9hcGkvcmVnaW9uLXN1bW1hcnknLCAgLy8gXHU3OUZCXHU5NjY0XHU2QjYzXHU1MjE5XHU4ODY4XHU4RkJFXHU1RjBGXHVGRjBDXHU0RjdGXHU3NTI4XHU3QjgwXHU1MzU1XHU3Njg0XHU1QjU3XHU3QjI2XHU0RTMyXHU1MzM5XHU5MTREXG4gICAgbWV0aG9kOiAnZ2V0JyxcbiAgICByZXNwb25zZTogKGNvbmZpZykgPT4ge1xuICAgICAgLy8gTW9jay5qcyBcdTRGMUFcdTgxRUFcdTUyQThcdTg5RTNcdTY3OTAgVVJMIFx1NTNDMlx1NjU3MFx1RkYwQ1x1NTNFRlx1NEVFNVx1NzZGNFx1NjNBNVx1NEVDRSBjb25maWcucXVlcnkgXHU4M0I3XHU1M0Q2XG4gICAgICBjb25zdCB7IGNocm9tLCBzdGFydCwgZW5kIH0gPSBjb25maWcucXVlcnk7XG4gICAgICBcbiAgICAgIC8vIFx1NEVDRVx1NjdFNVx1OEJFMlx1NTNDMlx1NjU3MFx1NEUyRFx1NjNEMFx1NTNENlx1NTdGQVx1NTZFMFx1N0VDNFx1NEY0RFx1N0Y2RVxuICAgICAgY29uc3QgcmVnaW9uID0ge1xuICAgICAgICBjaHJvbSxcbiAgICAgICAgc3RhcnQ6IHBhcnNlSW50KHN0YXJ0KSxcbiAgICAgICAgZW5kOiBwYXJzZUludChlbmQpXG4gICAgICB9O1xuXG4gICAgICBjb25zdCBzdW1tYXJ5ID0ge1xuICAgICAgICByZWdpb246IHJlZ2lvbixcbiAgICAgICAgc3VtbWFyeToge1xuICAgICAgICAgIGxvY2F0aW9uX3R5cGU6IFJhbmRvbS5waWNrKFsnZ2VuZV9wcm9tb3RlcicsICdpbnRlcmdlbmljJywgJ2dlbmVfYm9keSddKSxcbiAgICAgICAgICBwb3J0aW9uczoge1xuICAgICAgICAgICAgYV9jb21wYXJ0bWVudDogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpLFxuICAgICAgICAgICAgY29udGFjdF9kb21haW5zOiBSYW5kb20uZmxvYXQoMCwgMSwgMiwgMiksXG4gICAgICAgICAgICBsb29wczogUmFuZG9tLmZsb2F0KDAsIDEsIDIsIDIpLFxuICAgICAgICAgICAgZW5oYW5jZXI6IFJhbmRvbS5mbG9hdCgwLCAxLCAyLCAyKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY29kZTogMjAwLFxuICAgICAgICBkYXRhOiBzdW1tYXJ5XG4gICAgICB9O1xuICAgIH1cbn1cbl07Il0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQW1RLG9CQUFpQjtBQUNwUixJQUFNLFNBQVMsY0FBQUEsUUFBSztBQUdwQixJQUFNLDBCQUEwQixNQUFNO0FBQ3BDLFFBQU0sUUFBUSxPQUFPLEtBQUssQ0FBQyxRQUFRLFFBQVEsUUFBUSxRQUFRLE1BQU0sQ0FBQztBQUNsRSxRQUFNLFFBQVEsT0FBTyxRQUFRLEtBQU0sR0FBTTtBQUN6QyxRQUFNLE1BQU0sUUFBUSxPQUFPLFFBQVEsS0FBTSxHQUFLO0FBQzlDLFNBQU8sRUFBRSxPQUFPLE9BQU8sSUFBSTtBQUM3QjtBQUdBLElBQU0sc0JBQXNCLENBQUMsVUFBVSxVQUFVLFNBQVM7QUFFeEQsUUFBTSxzQkFBc0IsQ0FBQyxVQUFVQyxhQUFZO0FBQ2pELFFBQUksQ0FBQ0EsWUFBV0EsU0FBUSxXQUFXO0FBQUcsYUFBTztBQUM3QyxXQUFPQSxTQUFRO0FBQUEsTUFBSyxZQUNsQixTQUFTLFVBQVUsT0FBTyxTQUMxQixTQUFTLFNBQVMsT0FBTyxTQUN6QixTQUFTLE9BQU8sT0FBTztBQUFBLElBQ3pCO0FBQUEsRUFDRjtBQUdBLFFBQU0sa0JBQWtCLENBQUMsT0FBTyxhQUFhO0FBQzNDLFdBQU8sTUFBTSxLQUFLLEVBQUUsS0FBSyxJQUFJLEVBQUUsSUFBSSxNQUFNO0FBQ3ZDLFlBQU0sV0FBVyx3QkFBd0I7QUFDekMsYUFBTztBQUFBLFFBQ0wsV0FBVyxNQUFNLE9BQU8sUUFBUSxLQUFPLEtBQUssQ0FBQztBQUFBLFFBQzdDLFFBQVEsT0FBTyxLQUFLLENBQUMsU0FBUyxTQUFTLFNBQVMsUUFBUSxRQUFRLENBQUM7QUFBQSxRQUNqRSxlQUFlLE9BQU8sS0FBSyxDQUFDLFdBQVcsWUFBWSxVQUFVLFFBQVEsQ0FBQztBQUFBLFFBQ3RFLEdBQUc7QUFBQSxRQUNILEdBQUc7QUFBQSxNQUNMO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUdBLFFBQU0sb0JBQW9CLE9BQU8sUUFBUSxLQUFPLElBQUs7QUFDckQsUUFBTSxlQUFlLE9BQU8sUUFBUSxNQUFPLElBQUs7QUFDaEQsUUFBTSxhQUFhLE9BQU8sUUFBUSxNQUFPLEdBQUs7QUFFOUMsUUFBTSxVQUFVO0FBQUEsSUFDZCxnQkFBZ0I7QUFBQSxNQUNkLE9BQU87QUFBQSxNQUNQLE1BQU07QUFBQSxNQUNOLFdBQVc7QUFBQSxNQUNYLGFBQWEsS0FBSyxLQUFLLG9CQUFvQixRQUFRO0FBQUEsTUFDbkQsTUFBTSxnQkFBZ0IsVUFBVTtBQUFBLFFBQzlCLFdBQVcsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFBQSxNQUNwQyxDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsV0FBVztBQUFBLE1BQ1QsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsYUFBYSxLQUFLLEtBQUssZUFBZSxRQUFRO0FBQUEsTUFDOUMsTUFBTSxnQkFBZ0IsVUFBVTtBQUFBLFFBQzlCLGVBQWUsT0FBTyxLQUFLLENBQUMsT0FBTyxPQUFPLE1BQU0sQ0FBQztBQUFBLFFBQ2pELFNBQVMsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFBQSxNQUNsQyxDQUFDO0FBQUEsSUFDSDtBQUFBLElBRUEsU0FBUztBQUFBLE1BQ1AsT0FBTztBQUFBLE1BQ1AsTUFBTTtBQUFBLE1BQ04sV0FBVztBQUFBLE1BQ1gsYUFBYSxLQUFLLEtBQUssYUFBYSxRQUFRO0FBQUEsTUFDNUMsTUFBTSxNQUFNLFFBQVEsRUFBRSxLQUFLLElBQUksRUFBRSxJQUFJLE9BQU87QUFBQSxRQUMxQyxXQUFXLE1BQU0sT0FBTyxRQUFRLEtBQU8sS0FBSyxDQUFDO0FBQUEsUUFDN0MsUUFBUSxPQUFPLEtBQUssQ0FBQyxTQUFTLFNBQVMsU0FBUyxRQUFRLFFBQVEsQ0FBQztBQUFBLFFBQ2pFLGVBQWUsT0FBTyxLQUFLLENBQUMsV0FBVyxZQUFZLFVBQVUsUUFBUSxDQUFDO0FBQUEsUUFDdEUsT0FBTyxPQUFPLEtBQUssQ0FBQyxRQUFRLFFBQVEsUUFBUSxRQUFRLE1BQU0sQ0FBQztBQUFBLFFBQzNELE9BQU8sT0FBTyxRQUFRLEtBQU0sR0FBTTtBQUFBLFFBQ2xDLEtBQUssT0FBTyxRQUFRLEtBQVEsR0FBTTtBQUFBLFFBQ2xDLFlBQVksT0FBTyxLQUFLLENBQUMsUUFBUSxRQUFRLFFBQVEsUUFBUSxNQUFNLENBQUM7QUFBQSxRQUNoRSxZQUFZLE9BQU8sUUFBUSxLQUFRLEdBQU07QUFBQSxRQUN6QyxVQUFVLE9BQU8sUUFBUSxLQUFRLEdBQU07QUFBQSxRQUN2QyxVQUFVLE9BQU8sTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsTUFDbkMsRUFBRTtBQUFBLElBQ0o7QUFBQSxFQUNGO0FBR0EsTUFBSSxXQUFXLFFBQVEsU0FBUyxHQUFHO0FBQ2pDLFdBQU8sS0FBSyxPQUFPLEVBQUUsUUFBUSxTQUFPO0FBQ2xDLFVBQUk7QUFDSixVQUFJLFFBQVEsU0FBUztBQUNuQix1QkFBZSxRQUFRLEdBQUcsRUFBRSxLQUFLLE9BQU8sVUFBUTtBQUM5QyxnQkFBTSxlQUFlO0FBQUEsWUFDbkIsRUFBRSxPQUFPLEtBQUssT0FBTyxPQUFPLEtBQUssT0FBTyxLQUFLLEtBQUssSUFBSTtBQUFBLFlBQ3REO0FBQUEsVUFDRjtBQUNBLGdCQUFNLGVBQWU7QUFBQSxZQUNuQixFQUFFLE9BQU8sS0FBSyxZQUFZLE9BQU8sS0FBSyxZQUFZLEtBQUssS0FBSyxTQUFTO0FBQUEsWUFDckU7QUFBQSxVQUNGO0FBQ0EsaUJBQU8sZ0JBQWdCO0FBQUEsUUFDekIsQ0FBQztBQUFBLE1BQ0gsT0FBTztBQUNMLHVCQUFlLFFBQVEsR0FBRyxFQUFFLEtBQUs7QUFBQSxVQUFPLFVBQ3RDLG9CQUFvQixNQUFNLE9BQU87QUFBQSxRQUNuQztBQUFBLE1BQ0Y7QUFHQSxVQUFJLGFBQWEsV0FBVyxHQUFHO0FBRTdCLGNBQU0sZUFBZSxLQUFLLElBQUksVUFBVSxDQUFDO0FBQ3pDLHVCQUFlLE1BQU0sWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFLElBQUksTUFBTTtBQUN0RCxnQkFBTSxXQUFXO0FBQUEsWUFDZixXQUFXLE1BQU0sT0FBTyxRQUFRLEtBQU8sS0FBSyxDQUFDO0FBQUEsWUFDN0MsUUFBUSxPQUFPLEtBQUssQ0FBQyxTQUFTLFNBQVMsU0FBUyxRQUFRLFFBQVEsQ0FBQztBQUFBLFlBQ2pFLGVBQWUsT0FBTyxLQUFLLENBQUMsV0FBVyxZQUFZLFVBQVUsUUFBUSxDQUFDO0FBQUEsWUFDdEUsT0FBTyxRQUFRLENBQUMsRUFBRTtBQUFBLFlBQ2xCLE9BQU8sT0FBTyxRQUFRLFFBQVEsQ0FBQyxFQUFFLE9BQU8sUUFBUSxDQUFDLEVBQUUsTUFBTSxHQUFJO0FBQUEsWUFDN0QsS0FBSyxPQUFPLFFBQVEsUUFBUSxDQUFDLEVBQUUsUUFBUSxLQUFNLFFBQVEsQ0FBQyxFQUFFLEdBQUc7QUFBQSxVQUM3RDtBQUVBLGNBQUksUUFBUSxnQkFBZ0I7QUFDMUIsbUJBQU8sRUFBRSxHQUFHLFVBQVUsU0FBUyxPQUFPLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFO0FBQUEsVUFDMUQsV0FBVyxRQUFRLFdBQVc7QUFDNUIsbUJBQU87QUFBQSxjQUNMLEdBQUc7QUFBQSxjQUNILGFBQWEsT0FBTyxLQUFLLENBQUMsT0FBTyxPQUFPLE1BQU0sQ0FBQztBQUFBLGNBQy9DLE9BQU8sT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFBQSxZQUNoQztBQUFBLFVBQ0Y7QUFDQSxpQkFBTztBQUFBLFFBQ1QsQ0FBQztBQUFBLE1BQ0g7QUFFQSxjQUFRLEdBQUcsRUFBRSxPQUFPO0FBQ3BCLGNBQVEsR0FBRyxFQUFFLFFBQVEsYUFBYTtBQUNsQyxjQUFRLEdBQUcsRUFBRSxjQUFjLEtBQUssS0FBSyxhQUFhLFNBQVMsUUFBUTtBQUFBLElBQ3JFLENBQUM7QUFBQSxFQUNIO0FBRUEsU0FBTztBQUNUO0FBR0EsSUFBTSxxQkFBcUIsQ0FBQyxVQUFVLE1BQU0sVUFBVSxTQUFTLFlBQVk7QUFDekUsUUFBTSxPQUFPLG9CQUFvQixVQUFVLE9BQU8sRUFBRSxRQUFRO0FBRzVELE9BQUssT0FBTztBQUNaLE9BQUssWUFBWTtBQUdqQixRQUFNLGNBQWMsT0FBTyxLQUFLO0FBQ2hDLFFBQU0sV0FBVyxhQUFhO0FBRzlCLE9BQUssT0FBTyxLQUFLLEtBQUssTUFBTSxZQUFZLFFBQVE7QUFFaEQsU0FBTztBQUNUO0FBR0EsSUFBTSxtQkFBbUIsQ0FBQyxRQUFRO0FBQ2hDLFFBQU0sY0FBYyxJQUFJLE1BQU0sR0FBRyxFQUFFLENBQUMsS0FBSztBQUN6QyxRQUFNLFNBQVMsSUFBSSxnQkFBZ0IsV0FBVztBQUM5QyxTQUFPLE9BQU8sWUFBWSxPQUFPLFFBQVEsQ0FBQztBQUM1QztBQUVBLElBQU8sZUFBUTtBQUFBLEVBQ2I7QUFBQTtBQUFBLElBRUUsS0FBSztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsVUFBVSxDQUFDLFdBQVc7QUFDcEIsWUFBTSxTQUFTLGlCQUFpQixPQUFPLEdBQUc7QUFDMUMsWUFBTSxhQUFhLE9BQU8sYUFBYSxPQUFPLFdBQVcsTUFBTSxHQUFHLElBQUksQ0FBQztBQUN2RSxZQUFNLE9BQU8sU0FBUyxPQUFPLElBQUksS0FBSztBQUN0QyxZQUFNLFlBQVksU0FBUyxPQUFPLFNBQVMsS0FBSztBQUNoRCxZQUFNLFVBQVUsT0FBTyxVQUFVLEtBQUssTUFBTSxtQkFBbUIsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDO0FBR25GLFVBQUksVUFBVTtBQUNkLFVBQUksT0FBTyxTQUFTLE9BQU8sU0FBUyxPQUFPLEtBQUs7QUFDOUMsa0JBQVUsQ0FBQztBQUFBLFVBQ1QsT0FBTyxPQUFPO0FBQUEsVUFDZCxPQUFPLFNBQVMsT0FBTyxLQUFLO0FBQUEsVUFDNUIsS0FBSyxTQUFTLE9BQU8sR0FBRztBQUFBLFFBQzFCLENBQUM7QUFBQSxNQUNIO0FBRUEsWUFBTSxXQUFXLENBQUM7QUFFbEIsVUFBSSxXQUFXLFNBQVMsY0FBYyxHQUFHO0FBQ3ZDLGlCQUFTLGVBQWUsbUJBQW1CLGdCQUFnQixNQUFNLFdBQVcsU0FBUyxPQUFPO0FBQUEsTUFDOUY7QUFFQSxVQUFJLFdBQVcsU0FBUyxTQUFTLEdBQUc7QUFDbEMsaUJBQVMsVUFBVSxtQkFBbUIsV0FBVyxNQUFNLFdBQVcsU0FBUyxPQUFPO0FBQUEsTUFDcEY7QUFFQSxVQUFJLFdBQVcsU0FBUyxPQUFPLEdBQUc7QUFDaEMsaUJBQVMsUUFBUSxtQkFBbUIsU0FBUyxNQUFNLFdBQVcsU0FBUyxPQUFPO0FBQUEsTUFDaEY7QUFFQSxhQUFPO0FBQUEsUUFDTCxNQUFNO0FBQUEsUUFDTixNQUFNO0FBQUEsTUFDUjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQTtBQUFBO0FBQUEsSUFFRSxLQUFLO0FBQUE7QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLFVBQVUsQ0FBQyxXQUFXO0FBRXBCLFlBQU0sRUFBRSxPQUFPLE9BQU8sSUFBSSxJQUFJLE9BQU87QUFHckMsWUFBTSxTQUFTO0FBQUEsUUFDYjtBQUFBLFFBQ0EsT0FBTyxTQUFTLEtBQUs7QUFBQSxRQUNyQixLQUFLLFNBQVMsR0FBRztBQUFBLE1BQ25CO0FBRUEsWUFBTSxVQUFVO0FBQUEsUUFDZDtBQUFBLFFBQ0EsU0FBUztBQUFBLFVBQ1AsZUFBZSxPQUFPLEtBQUssQ0FBQyxpQkFBaUIsY0FBYyxXQUFXLENBQUM7QUFBQSxVQUN2RSxVQUFVO0FBQUEsWUFDUixlQUFlLE9BQU8sTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsWUFDdEMsaUJBQWlCLE9BQU8sTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQUEsWUFDeEMsT0FBTyxPQUFPLE1BQU0sR0FBRyxHQUFHLEdBQUcsQ0FBQztBQUFBLFlBQzlCLFVBQVUsT0FBTyxNQUFNLEdBQUcsR0FBRyxHQUFHLENBQUM7QUFBQSxVQUNuQztBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBRUEsYUFBTztBQUFBLFFBQ0wsTUFBTTtBQUFBLFFBQ04sTUFBTTtBQUFBLE1BQ1I7QUFBQSxJQUNGO0FBQUEsRUFDSjtBQUNBOyIsCiAgIm5hbWVzIjogWyJNb2NrIiwgInJlZ2lvbnMiXQp9Cg==
