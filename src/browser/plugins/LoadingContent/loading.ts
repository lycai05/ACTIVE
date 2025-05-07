export const loadingStart = () => {
  console.log('loadingStart')
    window['$loading'].start()
  }
  
  // * 加载结束
  export const loadingFinish = () => {
    console.log('loadingFinish')
    setTimeout(() => {
      window['$loading'].finish()
    })
  }
  
  // * 加载错误
  export const loadingError = () => {
    setTimeout(() => {
      window['$loading'].error()
    })
  }