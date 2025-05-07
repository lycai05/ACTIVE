<!-- HeatMap.vue -->
<template>
    <div class="heatmap-container" ref="heatmapContainer"></div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import * as d3 from 'd3'
  
  // 定义 props
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
    "Bone": "#F2F2F3", "Soft tissue": "#DBA883", "Bronchus": "#EE7E87",
    "Cancer": "#074150", "Non-cancer diseases": "#2B7186", "Others": "#4096B1",
    "Healthy": "#9CC6D4", "Cell line": "#543184", "iPSC/iPSC derived": "#475FAA",
    "Organoids": "#D05116", "PDX": "#7175B2", "Primary cell": "#7A7200",
    "Tissue": "#2C58A7"
  }
  
  // 初始化热图的函数
  const initHeatmap = () => {
    // 使用传入的数据或默认数据
    const rows = props.customRows.length ? props.customRows : defaultRows
    const columns = props.customColumns.length ? props.customColumns : defaultColumns
    const colorMap = Object.keys(props.customColorMap).length ? props.customColorMap : defaultColorMap
  
    // 计算尺寸
    const margin = { top: 100, right: 50, bottom: 100, left: 150 }
    const cellSize = 25
    const width = cellSize * columns.length
    const height = cellSize * rows.length
  
    // 清除已存在的SVG
    d3.select(heatmapContainer.value).selectAll("svg").remove()
  
    // 创建SVG容器
    const svg = d3.select(heatmapContainer.value)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
  
    // 创建比例尺
    const x = d3.scaleBand()
      .range([0, width])
      .domain(columns)
      .padding(0.05)
  
    const y = d3.scaleBand()
      .range([height, 0])
      .domain(rows)
      .padding(0.05)
  
    // 添加X轴
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickSize(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
  
    // 添加Y轴
    svg.append("g")
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll("text")
      .style("font-size", "12px")
  
    // 移除轴线
    svg.selectAll(".domain").remove()
  
    // 创建tooltip
    const tooltip = d3.select(heatmapContainer.value)
      .append("div")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px")
      .style("pointer-events", "none")
  
    // 生成热图数据
    const heatmapData = []
    rows.forEach(row => {
      columns.forEach(col => {
        heatmapData.push({
          row: row,
          column: col,
          value: Math.random()
        })
      })
    })
  
    // 鼠标事件处理函数
    const mouseover = function(event, d) {
      tooltip.style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1)
    }
  
    const mousemove = function(event, d) {
      tooltip
        .html(`${d.row}<br>${d.column}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 10) + "px")
    }
  
    const mouseleave = function(event, d) {
      tooltip.style("opacity", 0)
      d3.select(this)
        .style("stroke", "none")
        .style("opacity", 0.8)
    }
  
    // 绘制热图单元格
    svg.selectAll("rect")
      .data(heatmapData)
      .enter()
      .append("rect")
      .attr("x", d => x(d.column))
      .attr("y", d => y(d.row))
      .attr("rx", 3)
      .attr("ry", 3)
      .attr("width", x.bandwidth())
      .attr("height", y.bandwidth())
      .style("fill", d => colorMap[d.row])
      .style("opacity", 0.8)
      .on("mouseover", mouseover)
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
  
    // 添加标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -60)
      .attr("text-anchor", "middle")
      .style("font-size", "24px")
      .text("Tissue Type Heatmap")
  
    // 添加副标题
    svg.append("text")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("fill", "grey")
      .text("Distribution of different tissue types across various categories")
  }
  
  // 监听属性变化
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
    position: relative;
    width: 100%;
    height: 100%;
  }
  </style>