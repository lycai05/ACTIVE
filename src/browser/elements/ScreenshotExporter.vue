<template>
    <div class="screenshot-exporter">
      <!-- 导出按钮组 -->
      <div class="button-group">
        <button 
          :disabled="isExporting"
          @click="downloadAsSvg"
          class="export-button export-button--svg"
        >
        <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="button-icon"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
          Download SVG
        </button>
        <button 
          :disabled="isExporting"
          @click="downloadAsImage"
          class="export-button export-button--png"
        >
        <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    class="button-icon"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
          Download PNG
        </button>
        <!-- <button 
          :disabled="isExporting"
          @click="downloadAsPdf"
          class="export-button export-button--pdf"
        >
        <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
          Download PDF
        </button> -->
      </div>
  
      <!-- 导出状态提示 -->
      <div v-if="isExporting" class="export-status">
        Processing export, please wait...
      </div>
  
      <!-- 错误提示 -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue'
  import html2canvas from 'html2canvas'
  import { jsPDF } from 'jspdf'
  
  // 状态管理
  const isExporting = ref(false)
  const error = ref<string | null>(null)
  
  // 加载html2canvas库
  let html2canvasLoaded = false
  
  onMounted(async () => {
    try {
      // 检查是否已经全局加载了html2canvas
      if (typeof window.html2canvas === 'undefined' && typeof html2canvas === 'undefined') {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
        script.async = true
        script.onload = () => {
          html2canvasLoaded = true
        }
        document.head.appendChild(script)
      } else {
        html2canvasLoaded = true
      }
    } catch (err) {
      console.error('Failed to load html2canvas:', err)
    }
  })
  
  // SVG准备函数
  const prepareSvg = async (): Promise<SVGElement> => {
    try {
      // 获取目标容器
      const container = document.getElementById('screenshot-container')
      if (!container) {
        throw new Error('Container element not found')
      }
  
      // 创建SVG元素
      const xmlns = "http://www.w3.org/2000/svg"
      const svgElement = document.createElementNS(xmlns, "svg")
      
      // 设置SVG属性
      const totalWidth = container.clientWidth
      const totalHeight = container.clientHeight
      
      svgElement.setAttributeNS(null, "width", totalWidth.toString())
      svgElement.setAttributeNS(null, "height", totalHeight.toString())
      svgElement.setAttributeNS(null, "viewBox", `0 0 ${totalWidth} ${totalHeight}`)
      
      // 确保html2canvas已加载
      if (!html2canvasLoaded && typeof window.html2canvas === 'undefined') {
        throw new Error('html2canvas library is not loaded yet. Please try again in a moment.')
      }
      const h2c = html2canvas || window.html2canvas
      
      // 获取所有子元素并按照DOM顺序处理
      const childElements = Array.from(container.children)
      let currentY = 0
      
      for (const element of childElements) {
        const elementHeight = element.clientHeight
        
        // 检查是否是图表元素
        const isChartElement = element.hasAttribute('_echarts_instance_') || 
                              element.tagName.toLowerCase() === 'canvas' ||
                              element.querySelector('[_echarts_instance_]') !== null ||
                              element.querySelector('canvas') !== null
        
        if (isChartElement) {
          // 检查是否有SVG元素
          const chartSvg = element.querySelector('svg')
          
          if (chartSvg) {
            // 处理SVG图表
            const chartContent = chartSvg.cloneNode(true) as SVGElement
            const g = document.createElementNS(xmlns, "g")
            g.setAttributeNS(null, "transform", `translate(0,${currentY})`)
            g.appendChild(chartContent)
            svgElement.appendChild(g)
          } 
          // 处理Canvas元素
          else {
            const canvas = element.tagName.toLowerCase() === 'canvas' ? 
                          element as HTMLCanvasElement : 
                          element.querySelector('canvas')
                          
            if (canvas) {
              // 将Canvas转换为图像并嵌入SVG
              const imageElement = document.createElementNS(xmlns, "image")
              imageElement.setAttributeNS(null, "width", element.clientWidth.toString())
              imageElement.setAttributeNS(null, "height", elementHeight.toString())
              imageElement.setAttributeNS(null, "x", "0")
              imageElement.setAttributeNS(null, "y", currentY.toString())
              
              // 将Canvas内容转为base64图像
              const dataURL = canvas.toDataURL("image/png")
              imageElement.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", dataURL)
              
              svgElement.appendChild(imageElement)
            }
          }
        }
        
        currentY += elementHeight
      }
  
      return svgElement
    } catch (err) {
      throw new Error(`Failed to prepare SVG: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  
  // SVG下载函数
  const downloadAsSvg = async () => {
    isExporting.value = true
    error.value = null
    
    try {
      const svgElement = await prepareSvg()
      const svgData = new XMLSerializer().serializeToString(svgElement)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      
      const downloadLink = document.createElement('a')
      downloadLink.href = svgUrl
      downloadLink.download = `chart-${new Date().toISOString()}.svg`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
      URL.revokeObjectURL(svgUrl)
    } catch (err) {
      error.value = `Failed to download SVG: ${err instanceof Error ? err.message : String(err)}`
      console.error('Export failed:', err)
    } finally {
      isExporting.value = false
    }
  }
  
  // 使用html2canvas下载为图片
  const downloadAsImage = async () => {
    isExporting.value = true
    error.value = null
    
    try {
      const container = document.getElementById('screenshot-container')
      if (!container) {
        throw new Error('Container element not found')
      }
      
      // 确保html2canvas已加载
      if (!html2canvasLoaded && typeof window.html2canvas === 'undefined') {
        throw new Error('html2canvas library is not loaded yet. Please try again in a moment.')
      }
      
      // 使用html2canvas捕获容器
      const h2c = html2canvas || window.html2canvas
      const canvas = await h2c(container, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // 提高分辨率
        backgroundColor: '#ffffff'
      })
      
      // 转换为PNG并下载
      const imgData = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.href = imgData
      downloadLink.download = `chart-${new Date().toISOString()}.png`
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    } catch (err) {
      error.value = `Failed to download PNG: ${err instanceof Error ? err.message : String(err)}`
      console.error('Export failed:', err)
    } finally {
      isExporting.value = false
    }
  }
  
  const downloadAsPdf = async () => {
    isExporting.value = true
    error.value = null
    
    try {
      const container = document.getElementById('screenshot-container')
      if (!container) {
        throw new Error('Container element not found')
      }
      
      // 确保html2canvas已加载
      if (!html2canvasLoaded && typeof window.html2canvas === 'undefined') {
        throw new Error('html2canvas library is not loaded yet. Please try again in a moment.')
      }
      
      // 使用html2canvas捕获容器
      const h2c = html2canvas || window.html2canvas
      const canvas = await h2c(container, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // 提高分辨率
        backgroundColor: '#ffffff'
      })
      
      // 创建PDF
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save(`chart-${new Date().toISOString()}.pdf`)
    } catch (err) {
      error.value = `Failed to download PDF: ${err instanceof Error ? err.message : String(err)}`
      console.error('Export failed:', err)
    } finally {
      isExporting.value = false
    }
  }
  </script>
  
  <style scoped>
  .screenshot-exporter {
    padding: 1rem;
  }
  
  .button-group {
    display: flex;
    gap: 0.5rem;
  }
  
  .export-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    border-radius: 0.375rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  
  .export-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  .export-button--svg {
    background-color: var(--svg-button-bg, #2563eb);
  }
  
  .export-button--svg:hover:not(:disabled) {
    background-color: var(--svg-button-hover-bg, #1d4ed8);
  }
  
  .export-button--png {
    background-color: var(--png-button-bg, #7c3aed);
  }
  
  .export-button--png:hover:not(:disabled) {
    background-color: var(--png-button-hover-bg, #6d28d9);
  }
  
  .export-button--pdf {
    background-color: var(--pdf-button-bg, #16a34a);
  }
  
  .export-button--pdf:hover:not(:disabled) {
    background-color: var(--pdf-button-hover-bg, #15803d);
  }
  
  .icon {
    width: 1rem;
    height: 1rem;
  }
  
  .export-status {
    margin-top: 1rem;
    font-size: 0.875rem;
    color: var(--status-color, #6b7280);
  }
  
  .error-message {
    margin-top: 1rem;
    padding: 0.5rem;
    font-size: 0.875rem;
    color: var(--error-color, #dc2626);
    background-color: var(--error-bg, #fee2e2);
    border-radius: 0.375rem;
  }
  
  .button-icon {
    width: 1rem;
    height: 1rem;
  }
  </style>