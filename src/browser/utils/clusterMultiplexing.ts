import { clusterData } from '@greenelab/hclust';
import { euclideanDistance } from '@greenelab/hclust';
import { avgDistance } from '@greenelab/hclust';
// Function to create bins
function createBins(start, end, binSize) {
    const bins = [];
    for (let pos = start; pos < end; pos += binSize) {
      bins.push({ start: pos, end: Math.min(pos + binSize, end) });
    }
    return bins;
  }

// Function to assign fragments to bins
// Function to assign fragments to bins
function assignFragmentsToBins(fragments, bins) {
    const clusterIds = [];
    const binMatrix = [];
  
    // Create a map to hold bin assignments for each clusterId
    const binAssignments = {};
  
    // Initialize bin assignment for each clusterId with all zeros
    fragments.forEach(fragment => {
      if (!binAssignments.hasOwnProperty(fragment.clusterId)) {
        binAssignments[fragment.clusterId] = new Array(bins.length).fill(0);
        clusterIds.push(fragment.clusterId);
      }
    });
  
    // Assign each fragment to the appropriate bin
    fragments.forEach(fragment => {
      const { start, end, clusterId } = fragment;
      const fragmentMidpoint = (start + end) / 2;
  
      // Find the bin that the midpoint of the fragment falls into
      for (let i = 0; i < bins.length; i++) {
        if (fragmentMidpoint >= bins[i].start && fragmentMidpoint < bins[i].end) {
          binAssignments[clusterId][i] = 1; // Assign to bin by marking it as 1
          break; // Break the loop once the correct bin is found
        }
      }
    });
  
    // Convert the binAssignments map into a matrix format
    for (const clusterId of clusterIds) {
      binMatrix.push(binAssignments[clusterId]);
    }
  
    return { clusterIds, binMatrix };
  }

  // Function to create GEM-bin matrix
function createGEMBinMatrix(binAssignments) {
    return Object.values(binAssignments);
  }

  // Function to perform hierarchical clustering
function hierarchicalClustering(matrix) {
    // Assuming a hierarchicalClustering function/library is available
    // This pseudo-function would perform the clustering and return the result matrix
    return hierarchicalClusteringFunction(matrix);
  }

  // Function to map GEM IDs to row numbers
function mapclusterIdsToRows(clusteredMatrix, binAssignments) {
    const GEMToRowMap = {};
    const clusterIds = Object.keys(binAssignments);
    
    clusteredMatrix.forEach((row, index) => {
      const originalRow = binAssignments[clusterIds[index]];
      GEMToRowMap[clusterIds[index]] = originalRow;
    });
  
    return GEMToRowMap;
  }


  function reorderNestedArray(nestedArray, orderArray) {
    // Create a new array with the items from the nestedArray in the order specified by orderArray
    const reorderedArray = orderArray.map(orderIndex => nestedArray[orderIndex]);
    console.log(reorderedArray)
    return reorderedArray;
  }

  // Main function to process the data and perform clustering
export function clusterMultiplexing(start, end, fragments, binSize) {
    // const { start, end } = currentPosition;
    const bins = createBins(start, end, binSize);
    console.log(fragments)
    const { clusterIds, binMatrix } = assignFragmentsToBins(fragments, bins);
    // const GEMBinMatrix = createGEMBinMatrix(binAssignments);
    console.log(clusterIds, binMatrix)
    console.log(clusterData)
    const {order,clustersGivenK} = clusterData({data: binMatrix});
console.log(clustersGivenK)
    var rows = {};

    if(clusterIds.length === order.length) {
      for(var i = 0; i < clusterIds.length; i++) {
        rows[clusterIds[i]] = order[i];
      }
    } else {
      console.error('The arrays must be of the same length.');
    }

    const orderedMatrix = reorderNestedArray(binMatrix, order)
return {rows:rows, matrix: orderedMatrix}
    // const GEMToRowMap = mapclusterIdsToRows(clusteredMatrix, binAssignments);
    
    // return {
    //   clusteredMatrix: clusteredMatrix,
    //   GEMToRowMap: GEMToRowMap
    // };
  }