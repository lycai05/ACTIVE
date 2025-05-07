import { defineStore } from 'pinia';

export const useNavStore = defineStore('useNavStore', {
  state: () => ({
    location: []
  }),
  actions: {
    setInitialLocations(id, locations) {
      this.location.push({id: id, locations: locations});
    },
    setNavigation(id, chrom, start, end) {
      const locIndex = this.location.findIndex(loc => loc.id === id);

      if (locIndex !== -1) {
        this.location[locIndex]['locations'].initPos.chrom = chrom;
        this.location[locIndex]['locations'].initPos.start = start;
        this.location[locIndex]['locations'].initPos.end = end;
      }
    },
    zoomTo(id, chrom, start, end) {
      const locIndex = this.location.findIndex(loc => loc.id === id);

      if (locIndex !== -1 ) {
        if (chrom == null) {
          chrom = this.location[locIndex]['locations'].initPos.chrom;
        }

        const size = this.location[locIndex]['locations'].initPos.size;
        const s = Math.max(start, 1) || 1;
        const e = Math.min(end, size) || size;

        start = Math.round(s);
        end = Math.round(e);

        if (end - start < 50) {
          console.log('Region size too small');
          return;
        }
        this.setNavigation(id, chrom, start, end);
      }
    },
    zoomIn(id) {
      const locIndex = this.location.findIndex(loc => loc.id === id);

      if (locIndex !== -1 ) {
        const mid = (this.location[locIndex]['locations'].initPos.start + this.location[locIndex]['locations'].initPos.end) / 2;
        const quarter = (this.location[locIndex]['locations'].initPos.end - this.location[locIndex]['locations'].initPos.start + 1) / 4;
        this.zoomTo(id, this.location[locIndex]['locations'].initPos.chrom, Math.round(mid - quarter), Math.round(mid + quarter) - 1);
      }
    },
    zoomOut(id) {
      const locIndex = this.location.findIndex(loc => loc.id === id);

      if (locIndex !== -1 ) {
        const mid = (this.location[locIndex]['locations'].initPos.start + this.location[locIndex]['locations'].initPos.end) / 2;
        const double = Math.max(1, this.location[locIndex]['locations'].initPos.end - this.location[locIndex]['locations'].initPos.start);
        this.zoomTo(id, this.location[locIndex]['locations'].initPos.chrom, Math.round(mid - double), Math.round(mid + double) + 1);
      }
    },
    shift(id, ev, direction) {
      const locIndex = this.location.findIndex(loc => loc.id === id);

      if (locIndex !== -1) {
        const span = this.location[locIndex]['locations'].initPos.end - this.location[locIndex]['locations'].initPos.start;
        let delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1;
        delta *= direction * span;
        this.zoomTo(id, this.location[locIndex]['locations'].initPos.chrom, this.location[locIndex]['locations'].initPos.start + delta, this.location[locIndex]['locations'].initPos.end + delta);
      }
    }
  }
});
// // // corenavStore.js

// // import { defineStore } from 'pinia';

// // export const useNavStore = defineStore('useNavStore', {
// //   state: () => ({
// //     chrom: 'chr1',
// //     start: 1000000,
// //     end: 1500000,
// //     max: 0,
// //     min: 0,
// //     size: 0
// //   }),
// //   actions: {
// //     setNavigation(chrom, start, end) {
// //       this.chrom = chrom;
// //       this.start = start;
// //       this.end = end;
// //     },
// //     zoomTo(chrom, start, end) {
// //           if (chrom == null) {
// //         chrom = this.chrom
// //       } else {
// //        chrom = chrom
// //       }

// //     var size = this.size,
// //         s = Math.max(start, 1) || 1,
// //         e = Math.min(end, size) || size;
// //     // console.log(end, size, chrom, chromSizes)
// //     start = Math.round(s)
// //     end = Math.round(e)

// //       if (end - start < 50) {
// //         console.log('Region size too small');
// //         return;
// //       }
// //       this.setNavigation(chrom, start, end);
// //     },
// //     zoomIn() {
// //       const mid = (this.start + this.end) / 2;
// //       const quarter = (this.end - this.start + 1) / 4;
// //       this.zoomTo(this.chrom, Math.round(mid - quarter), Math.round(mid + quarter) - 1);
// //     },
// //     zoomOut() {
// //       const mid = (this.start + this.end) / 2;
// //       const double = Math.max(1, this.end - this.start);
// //       this.zoomTo(this.chrom, Math.round(mid - double), Math.round(mid + double) + 1);
// //     },
// //     shift(delta) {
// //       this.zoomTo(this.chrom, this.start + delta, this.end + delta);
// //     }
// //   }
// // });


// // corenavStore.js

// // corenavStore.js

// import { defineStore } from 'pinia';

// export const useNavStore = defineStore('useNavStore', {
//   state: () => ({
//     location: []
//   }),
//   actions: {
//     setInitialLocations(locations) {
//       this.location.push(locations);
//     },
//     setNavigation(index, chrom, start, end) {
//       console.log(end)

//       if (index >= 0 && index < this.location.length) {
//         this.location[index].initPos.chrom = chrom;
//         this.location[index].initPos.start = start;
//         this.location[index].initPos.end = end;
//       }
//     },
//     zoomTo(index, chrom, start, end) {
//       if (index >= 0 && index < this.location.length) {
//         if (chrom == null) {
//           chrom = this.location[index].initPos.chrom;
//         }

//         var size = this.location[index].initPos.size,
//           s = Math.max(start, 1) || 1,
//           e = Math.min(end, size) || size;

//         start = Math.round(s);
//         end = Math.round(e);

//         if (end - start < 50) {
//           console.log('Region size too small');
//           return;
//         }
//         this.setNavigation(index, chrom, start, end);
//       }
//     },
//     zoomIn(index) {
//       if (index >= 0 && index < this.location.length) {
//         const mid = (this.location[index].initPos.start + this.location[index].initPos.end) / 2;
//         const quarter = (this.location[index].initPos.end - this.location[index].initPos.start + 1) / 4;
//         this.zoomTo(index, this.location[index].initPos.chrom, Math.round(mid - quarter), Math.round(mid + quarter) - 1);
//       }
//     },
//     zoomOut(index) {
//       if (index >= 0 && index < this.location.length) {
//         const mid = (this.location[index].initPos.start + this.location[index].initPos.end) / 2;
//         const double = Math.max(1, this.location[index].initPos.end - this.location[index].initPos.start);
//         this.zoomTo(index, this.location[index].initPos.chrom, Math.round(mid - double), Math.round(mid + double) + 1);
//       }
//     },
//     shift(index, ev, direction) {
//       const span = this.location[index].initPos.end - this.location[index].initPos.start
//       let delta = ev.ctrlKey ? (ev.shiftKey ? 0.95 : 0.475) : 0.1;
//       delta *= direction * span;
//       if (index >= 0 && index < this.location.length) {
//         this.zoomTo(index, this.location[index].initPos.chrom, this.location[index].initPos.start + delta, this.location[index].initPos.end + delta);
//       }
//     }
//   }
// });