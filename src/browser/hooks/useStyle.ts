export const useSizeStyle = (attr, scale?: number) => {
    if(!attr) return {}
    return {
      width: `${scale ? scale * attr.w : attr.w}px`,
      height: `${scale ? scale * attr.h : attr.h}px`
    }
  }

  export const useHeightStyle = (attr) => {
    if(!attr) return {}
    return {
      height: `${attr.h}px`
    }
  }
  