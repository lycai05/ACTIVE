export function BASIC_intComma(num) {
    var str = "";
    do {
        let q = "" + (num % 1000);
        num = Math.floor(num / 1000);
        if (num > 0) {
            while (q.length < 3) q = "0" + q;
            q = "," + q;
        }
        str = q + str;
    } while (num > 0);
    return str;
};

export function formatBytes(bytes) {
    const kilobytes = bytes / 1000;
    if (kilobytes < 1) {
      return bytes + " B";
    }
    const megabytes = kilobytes / 1000;
    if (megabytes < 1) {
      return kilobytes.toFixed(2) + " KB";
    }
    return megabytes.toFixed(2) + " MB";
  }

export function withThrottle(delay = 200){
    let lastTime = 0;
    
    return ((...args) => {
      const now = Date.now();
      if (now - lastTime >= delay) {
        fn(...args);
        lastTime = now;
      }
    });
  }