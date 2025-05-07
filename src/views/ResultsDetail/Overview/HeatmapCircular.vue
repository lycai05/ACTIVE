<template>
    <div class="heatmap-container" ref="heatmapContainer"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as d3 from 'd3'
  
  // Props定义
  const props = defineProps({
    customRows: {
      type: Array,
      default: () => []
    },
    customColumns: {
      type: Array,
      default: () => []
    },
    customColorMap: {
      type: Object,
      default: () => ({})
    }
  })
  
  // 引用容器
  const heatmapContainer = ref(null)
  
  // 默认数据
  const defaultRows = [
    "Brain", "Eye", "Pharynx", "Lung", "Heart", "Thyroid gland", "Thymus",
    "Stomach", "Skin", "Arthritis", "Liver", "Breast", "Kidney", "Adrenal gland",
    "Pancreas", "Spleen", "Colon", "Lymph", "Vessel", "Blood", "Ovary",
    "Uterus", "Placenta", "Embryo", "Bladder", "Prostate gland", "Testis",
    "Vagina", "Esophagus", "Nerve", "Muscle tissue", "Bone", "Soft tissue", "Bronchus"
  ]
  
  const defaultColumns = [
    "Compartment", "Domain", "Stripe", "Cancer", "Non-cancer diseases",
    "Others", "Healthy", "Cell line", "iPSC/iPSC derived", "Organoids",
    "PDX", "Primary cell", "Tissue"
  ]
  
  const defaultColorMap = {
    "Brain": "#F6BBA7", "Eye": "#8D1C27", "Pharynx": "#FDE5C8",
    "Lung": "#F7D774", "Heart": "#EC6822", "Thyroid gland": "#F6B59C",
    "Thymus": "#92C976", "Stomach": "#F5AF32", "Skin": "#854922",
    "Arthritis": "#E83F19", "Liver": "#8B5241", "Breast": "#8B6679",
    "Kidney": "#697F15", "Adrenal gland": "#F6EC65", "Pancreas": "#DFDE86",
    "Spleen": "#781E4E", "Colon": "#F7C96B", "Lymph": "#06763B",
    "Vessel": "#4B83C4", "Blood": "#BD2321", "Ovary": "#B35CA0",
    "Uterus": "#EABDD7", "Placenta": "#E83F29", "Embryo": "#99D6EF",
    "Bladder": "#3C5EAA", "Prostate gland": "#ACC7E8", "Testis": "#788CA4",
    "Vagina": "#DE4E96", "Nerve": "#F5E72E", "Muscle tissue": "#F7BE92",
    "Bone": "#F2F2F3", "Soft tissue": "#DBA883", "Bronchus": "#EE7E87"
  }
  
  const initHeatmap = () => {
  const rows = props.customRows.length ? props.customRows : defaultRows
  const columns = props.customColumns.length ? props.customColumns : defaultColumns
  const colorMap = Object.keys(props.customColorMap).length ? props.customColorMap : defaultColorMap

  // 清除已存在的SVG
  d3.select(heatmapContainer.value).selectAll("svg").remove()

  // 设置环形热图的尺寸和布局
  const width = 800
  const height = 800
  const innerRadius = 200
  const outerRadius = 400
  
  // 设置间隙和圆角参数
  const padAngle = 0.02  // 扇形之间的间隙角度
  const cornerRadius = 4  // 圆角半径
  const cellPadding = 0.008 // 单元格之间的间隙

  // 创建SVG容器
  const svg = d3.select(heatmapContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/2},${height/2})`)

  // 创建角度比例尺（考虑间隙）
  const angle = d3.scaleLinear()
    .domain([0, rows.length])
    .range([0, 2 * Math.PI - (rows.length * padAngle)]) // 减去总间隙角度

  // 创建半径比例尺
  const radius = d3.scaleLinear()
    .domain([0, columns.length])
    .range([innerRadius, outerRadius])

  // 生成热图数据
  const heatmapData = []
  rows.forEach((row, i) => {
    columns.forEach((col, j) => {
      heatmapData.push({
        row: row,
        column: col,
        rowIndex: i,
        columnIndex: j,
        value: Math.random()
      })
    })
  })

  // 创建tooltip
  const tooltip = d3.select(heatmapContainer.value)
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)

  // 绘制热图单元格
  svg.selectAll("path")
    .data(heatmapData)
    .enter()
    .append("path")
    .attr("d", d => {
      // 计算每个单元格的起始和结束角度，添加间隙
      const startAngle = angle(d.rowIndex) + (d.rowIndex * padAngle)
      const endAngle = angle(d.rowIndex + 1) + (d.rowIndex * padAngle)
      
      // 计算内外半径，添加单元格间隙
      const innerRadiusCell = radius(d.columnIndex) + (radius.range()[1] - radius.range()[0]) * cellPadding
      const outerRadiusCell = radius(d.columnIndex + 1) - (radius.range()[1] - radius.range()[0]) * cellPadding

      // 创建圆角扇形
      const arc = d3.arc()
        .innerRadius(innerRadiusCell)
        .outerRadius(outerRadiusCell)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .cornerRadius(cornerRadius) // 添加圆角
        .padAngle(padAngle) // 添加间隙
        .padRadius(innerRadius)

      return arc()
    })
    .style("fill", d => colorMap[d.row])
    .style("opacity", 0.8)
    .style("transition", "all 0.3s")
    .on("mouseover", (event, d) => {
      d3.select(event.currentTarget)
        .style("opacity", 1)
        .style("stroke", "#fff")
        .style("stroke-width", "2px")

      tooltip.transition()
        .duration(200)
        .style("opacity", .9)
      
      tooltip.html(`
        <strong>${d.row}</strong><br/>
        ${d.column}<br/>
        Value: ${d.value.toFixed(2)}
      `)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
    })
    .on("mouseout", (event) => {
      d3.select(event.currentTarget)
        .style("opacity", 0.8)
        .style("stroke", "none")

      tooltip.transition()
        .duration(500)
        .style("opacity", 0)
    })

  // 添加行标签（组织名称）
  svg.append("g")
    .selectAll("text")
    .data(rows)
    .enter()
    .append("text")
    .attr("class", "row-label")
    .attr("transform", (d, i) => {
      const a = angle(i + 0.5) + (i * padAngle) - Math.PI / 2
      const r = outerRadius + 20
      return `
        rotate(${a * 180 / Math.PI})
        translate(${r},0)
        ${Math.abs(a) > Math.PI/2 ? 'rotate(180)' : ''}
      `
    })
    .style("text-anchor", d => "middle")
    .style("font-size", "12px")
    .style("font-weight", "bold")
    .text(d => d)

  // 添加列标签（环形）
  svg.append("g")
    .selectAll("text")
    .data(columns)
    .enter()
    .append("text")
    .attr("class", "column-label")
    .attr("transform", (d, i) => {
      const r = (radius(i) + radius(i + 1)) / 2
      return `translate(0,${-r})`
    })
    .style("text-anchor", "middle")
    .style("font-size", "12px")
    .style("alignment-baseline", "middle")
    .text(d => d)
}

watch(() => props.customRows, initHeatmap)
watch(() => props.customColumns, initHeatmap)
watch(() => props.customColorMap, initHeatmap)

// 组件挂载时初始化
onMounted(() => {
  initHeatmap()
})

</script>

<style scoped>
.heatmap-container {
  width: 100%;
  height: 100%;
  min-height: 800px;
  position: relative;
}

.tooltip {
  position: absolute;
  padding: 8px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #ddd;
  border-radius: 4px;
  pointer-events: none;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.row-label {
  fill: #333;
  font-family: Arial, sans-serif;
}

.column-label {
  fill: #333;
  font-family: Arial, sans-serif;
}

path {
  transition: all 0.3s ease;
}

path:hover {
  cursor: pointer;
}
</style>