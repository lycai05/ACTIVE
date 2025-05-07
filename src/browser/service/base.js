import axios from 'axios'

const ERR_OK = 0
const baseURL = process.env.NODE_ENV === 'production' ? '' : ''

axios.defaults.baseURL = baseURL


// axios get from server
export function get(url, params) {
  console.log(url)
  return axios.get(url, {
    params
  }).then((res) => {
    const serverData = res.data
    console.log(serverData)
    // if (serverData.code < 300 ) {
    //   // return serverData.result
    //   return serverData
    // }
    return serverData
  }).catch((e) => {
    console.log(e)
  })
}


// export async function readTsvFile(url) {
//   try {
//     const response =  await axios.get(url);
//     const rows = response.data.trim().split('\n');
//     // const data = rows.map(row => row.split('\t'));
//     return rows;
//   } catch (error) {
//     console.error(error);
//   }
// }


export function fetchBedFileData(url) {
  return axios({
    url: url,
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    const text = response.data;
    const lines = text.split('\n');
    const data = lines.map(line => {
      const fields = line.split('\t');
      const obj = {
        chrom: fields[0],
        start: parseInt(fields[1]),
        end: parseInt(fields[2])
      };
      // Check if additional fields exist and add them to the output object
      if (fields.length > 3) {
        obj.name = fields[3];
        obj.score = fields[4] ? parseInt(fields[4]) : null;
        obj.strand = fields[5];
        obj.thickStart = fields[6] ? parseInt(fields[6]) : null;
        obj.thickEnd = fields[7] ? parseInt(fields[7]) : null;
        obj.itemRgb = fields[8];
        obj.blockCount = fields[9] ? parseInt(fields[9]) : null;
        obj.blockSizes = fields[10] ? fields[10].split(',').map(size => parseInt(size)) : null;
        obj.blockStarts = fields[11] ? fields[11].split(',').map(start => parseInt(start)) : null;
      }
      return obj;
    });
    return data;
  });
}


export function fetchBedpeFileData(url) {
  return axios({
    url: url,
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    const text = response.data;
    const lines = text.split('\n');
    const data = lines.map(line => {
      const fields = line.split('\t');
      const obj = {
        chrom1: fields[0],
        start1: parseInt(fields[1]),
        end1: parseInt(fields[2]),
        chrom2: fields[3],
        start2: parseInt(fields[4]),
        end2: parseInt(fields[5]),
        name: fields[6],
        score: parseInt(fields[7]),
        strand1: fields[8],
        strand2: fields[9]
      };
      return obj;
    });
    return data;
  });

}

export function fetchCytoBandFileData(url) {
  return axios({
    url: url,
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    const text = response.data;
    const lines = text.split('\n');
    const data = lines.map(line => {
      const fields = line.split('\t');
      const obj = {
        chrom: fields[0],
        start: parseInt(fields[1]),
        end: parseInt(fields[2]),
        band: fields[3],
        stain: fields[4]
      };
      return obj;
    });
    return data;
  });
}

export function fetchGeneAnnoFileData(url) {
  return axios({
    url: url,
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    const text = response.data;
    const lines = text.split('\n');
    const data = lines.map(line => {
      const fields = line.split('\t');
      const obj = {
        ucsc_name: fields[4],
        chrom: fields[0],
        strand: fields[4],
        start: parseInt(fields[1]),
        end: parseInt(fields[2]),
        cds_start: fields[5],
        cds_end: fields[6],
        name: fields[7],
        sym: fields[8],
        exons: fields[9]
      };
      return obj;
    });
    return data;
  });
}

export function fetchCurvFileData(url) {
  return axios({
    url: url,
    method: 'GET',
    responseType: 'text'
  }).then(response => {
    const text = response.data;
    const lines = text.split('\n');
    const data = lines.map(line => {
      const fields = line.split('\t');
      const obj = {
        chrom: fields[0],
        start: parseInt(fields[1]),
        end: parseInt(fields[2]),
        chrom2: fields[3],
        start2: parseInt(fields[4]),
        end2: parseInt(fields[5]),
        score: parseInt(fields[6])
      };
      return obj;
    });
    return data;
  });
}