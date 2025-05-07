<template>
    <div class="heatmap-container" ref="heatmapContainer"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as d3 from 'd3'
  const emit = defineEmits(['rowLabelClick'])

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
  const width = 800  // 增加宽度以容纳标签
  const height = 900
  const innerRadius = 200
  const outerRadius = 400
  
  // 设置间隙和圆角参数
  const padAngle = 0.02
  const cornerRadius = 4
  const cellPadding = 0.008

  // 创建SVG容器
  const svg = d3.select(heatmapContainer.value)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${width/4},${height/2})`) // 调整位置以显示右半圆

  // 创建角度比例尺（0度到180度，即右半圆）
  const angle = d3.scaleLinear()
    .domain([0, rows.length])
    .range([0, Math.PI]) // 从0度到180度

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
      // 计算每个单元格的起始和结束角度
      const angleRange = Math.PI / rows.length
      const startAngle = angle(d.rowIndex) + (padAngle / 2)
      const endAngle = startAngle + angleRange - padAngle

      // 计算内外半径
      const innerRadiusCell = radius(d.columnIndex) + (radius.range()[1] - radius.range()[0]) * cellPadding
      const outerRadiusCell = radius(d.columnIndex + 1) - (radius.range()[1] - radius.range()[0]) * cellPadding

      const arc = d3.arc()
        .innerRadius(innerRadiusCell)
        .outerRadius(outerRadiusCell)
        .startAngle(startAngle)
        .endAngle(endAngle)
        .cornerRadius(cornerRadius)
        .padAngle(padAngle)
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
      const a = angle(i + 0.5)
      const r = outerRadius + 20
      const x = Math.cos(a - Math.PI / 2) * r
      const y = Math.sin(a - Math.PI / 2) * r
      let rotation = (a * 180 / Math.PI) - 90
      return `translate(${x},${y}) rotate(${rotation})`
    })
    .style("text-anchor", "start")
    .style("alignment-baseline", "middle")
    .style("font-size", "11px")
    .style("font-weight", "bold")
    .style("cursor", "pointer") // 添加鼠标指针样式
    .text(d => d)
    .on("click", (event, d) => {
      emit('rowLabelClick', d)  // 发出点击事件
    })
    .on("mouseover", function() {
      d3.select(this)
        .style("font-size", "12px")
        .style("fill", "#666")
    })
    .on("mouseout", function() {
      d3.select(this)
        .style("font-size", "11px")
        .style("fill", "#333")
    })
    

  // 添加列标签（径向）
//   const columnLabelsGroup = svg.append("g")
//     .attr("class", "column-labels")

//   columns.forEach((col, i) => {
//     const y = (radius(i) + radius(i + 1)) / 2
    
//     columnLabelsGroup.append("text")
//       .attr("class", "column-label")
//       .attr("x", outerRadius + 40) // 将标签放在右侧
//       .attr("y", -y) // 垂直位置
//       .style("text-anchor", "start")
//       .style("font-size", "11px")
//       .style("alignment-baseline", "middle")
//       .text(col)
//   })

svg.append("g")
  .selectAll("text")
  .data(columns)
  .enter()
  .append("text")
  .attr("class", "column-label")
  .attr("x", -120) // 向左偏移20px
  .attr("y", (d, i) => {
    const r =(radius(i) + radius(i + 1)) / 2
    return r
  })
  .style("text-anchor", "middle")
  .style("font-size", "14px")
  .style("alignment-baseline", "middle")
  .text(d => d)


  // 可选：添加连接线
  const addConnectingLines = false
  if (addConnectingLines) {
    svg.selectAll(".connecting-line")
      .data(columns)
      .enter()
      .append("line")
      .attr("class", "connecting-line")
      .attr("x1", outerRadius)
      .attr("y1", (d, i) => -(radius(i) + radius(i + 1)) / 2)
      .attr("x2", outerRadius + 35)
      .attr("y2", (d, i) => -(radius(i) + radius(i + 1)) / 2)
      .style("stroke", "#999")
      .style("stroke-width", "1px")
      .style("stroke-dasharray", "2,2")
  }
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
  /* width: 100%;
  height: 100%; */
  /* min-height: 300px; */
  /* position: relative; */
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

.connecting-line {
  opacity: 0.5;
}

.row-label {
  fill: #333;
  font-family: Arial, sans-serif;
  transition: all 0.3s ease;
}

.row-label:hover {
  cursor: pointer;
}
</style>