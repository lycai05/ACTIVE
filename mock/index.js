import Mock from 'mockjs';
const Random = Mock.Random;

// 生成染色体位置的辅助函数
const generateGenomicPosition = () => {
  const chrom = Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]);
  const start = Random.integer(1000, 100000);
  const end = start + Random.integer(5000, 50000);
  return { chrom, start, end };
};

// 生成基础数据模板
const generateGenomicData = (pageSize, regions = null) => {
  // 检查位置是否在指定区域内
  const isPositionInRegions = (position, regions) => {
    if (!regions || regions.length === 0) return true;
    return regions.some(region => 
      position.chrom === region.chrom && 
      position.start >= region.start && 
      position.end <= region.end
    );
  };

  // 生成多条记录的辅助函数
  const generateRecords = (count, template) => {
    return Array(count).fill(null).map(() => {
      const position = generateGenomicPosition();
      return {
        sample_id: `GSM${Random.integer(10000, 99999)}`,
        tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
        health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
        ...position,
        ...template
      };
    });
  };

  // 为每种数据类型生成初始数据
  const totalCompartments = Random.integer(10000, 15000);
  const totalDomains = Random.integer(12000, 18000);
  const totalLoops = Random.integer(15000, 20000);

  const rawData = {
    'compartments': {
      total: totalCompartments,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalCompartments / pageSize),
      data: generateRecords(pageSize, {
        'E1score': Random.float(0, 1, 2, 2)
      })
    },
    
    'domains': {
      total: totalDomains,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalDomains / pageSize),
      data: generateRecords(pageSize, {
        'domain_type': Random.pick(["TAD", "LAD", "CTCF"]),
        'score': Random.float(0, 1, 2, 2)
      })
    },
    
    'loops': {
      total: totalLoops,
      page: 1,
      page_size: pageSize,
      total_pages: Math.ceil(totalLoops / pageSize),
      data: Array(pageSize).fill(null).map(() => ({
        sample_id: `GSM${Random.integer(10000, 99999)}`,
        tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
        health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
        chrom: Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]),
        start: Random.integer(1000, 100000),
        end: Random.integer(100000, 200000),
        mate_chrom: Random.pick(["chr1", "chr2", "chr3", "chr4", "chr5"]),
        mate_start: Random.integer(200000, 300000),
        mate_end: Random.integer(300000, 400000),
        strength: Random.float(0, 1, 2, 2)
      }))
    }
  };

  // 根据regions过滤数据
  if (regions && regions.length > 0) {
    Object.keys(rawData).forEach(key => {
      let filteredData;
      if (key === 'loops') {
        filteredData = rawData[key].data.filter(item => {
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
        filteredData = rawData[key].data.filter(item => 
          isPositionInRegions(item, regions)
        );
      }
      
      // 确保过滤后至少有一些数据
      if (filteredData.length === 0) {
        // 生成一些符合区域条件的数据
        const defaultCount = Math.min(pageSize, 5);
        filteredData = Array(defaultCount).fill(null).map(() => {
          const baseData = {
            sample_id: `GSM${Random.integer(10000, 99999)}`,
            tissue: Random.pick(["liver", "brain", "heart", "lung", "kidney"]),
            health_status: Random.pick(["healthy", "diseased", "normal", "cancer"]),
            chrom: regions[0].chrom,
            start: Random.integer(regions[0].start, regions[0].end - 1000),
            end: Random.integer(regions[0].start + 1000, regions[0].end)
          };

          if (key === 'compartments') {
            return { ...baseData, E1score: Random.float(0, 1, 2, 2) };
          } else if (key === 'domains') {
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

// 处理分页和过滤的函数
const processQueryResult = (dataType, page, pageSize, filters, regions) => {
  const data = generateGenomicData(pageSize, regions)[dataType];
  
  // 更新分页信息
  data.page = page;
  data.page_size = pageSize;
  
  // 计算起始和结束索引
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // 截取当前页的数据
  data.data = data.data.slice(startIndex, endIndex);
  
  return data;
};

// 解析URL查询参数的辅助函数
const parseQueryString = (url) => {
  const queryString = url.split('?')[1] || '';
  const params = new URLSearchParams(queryString);
  return Object.fromEntries(params.entries());
};

export default [
  {
    // URL示例: /api/genomic-features?data_types=compartments,domains&chrom=chr1&start=1000&end=50000
    url: '/api/genomic-features',
    method: 'get',
    response: (config) => {
      const params = parseQueryString(config.url);
      const data_types = params.data_types ? params.data_types.split(',') : [];
      const page = parseInt(params.page) || 1;
      const page_size = parseInt(params.page_size) || 10;
      const filters = params.filters ? JSON.parse(decodeURIComponent(params.filters)) : {};
      
      // 从查询参数中提取基因组位置
      let regions = null;
      if (params.chrom && params.start && params.end) {
        regions = [{
          chrom: params.chrom,
          start: parseInt(params.start),
          end: parseInt(params.end)
        }];
      }
      
      const response = {};
      
      if (data_types.includes('compartments')) {
        response.compartments = processQueryResult('compartments', page, page_size, filters, regions);
      }
      
      if (data_types.includes('domains')) {
        response.domains = processQueryResult('domains', page, page_size, filters, regions);
      }
      
      if (data_types.includes('loops')) {
        response.loops = processQueryResult('loops', page, page_size, filters, regions);
      }
      
      return {
        code: 200,
        data: response
      }
    }
  },
  {
    // URL示例: /api/region-summary?chrom=chr1&start=1000&end=50000
    url: '/api/region-summary',  // 移除正则表达式，使用简单的字符串匹配
    method: 'get',
    response: (config) => {
      // Mock.js 会自动解析 URL 参数，可以直接从 config.query 获取
      const { chrom, start, end } = config.query;
      
      // 从查询参数中提取基因组位置
      const region = {
        chrom,
        start: parseInt(start),
        end: parseInt(end)
      };

      const summary = {
        region: region,
        summary: {
          location_type: Random.pick(['gene_promoter', 'intergenic', 'gene_body']),
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