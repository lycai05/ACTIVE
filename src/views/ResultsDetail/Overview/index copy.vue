<template>
    <div class="visualization-container">
      <div class="body-map">
        <human-body-map 
          :highlightedOrgans="highlightedOrgans"
          @organClick="handleOrganClick"
        />
      </div>
      <div class="heatmap">
        <heat-map 
          :customRows="orderedTissues"
          :customColumns="columns"
          :customColorMap="colorMap"
          @rowLabelClick="handleRowLabelClick" 
        />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue'
  import HumanBodyMap from './HumanBodyMap.vue'
  import HeatMap from './HeatmapHalfCircle.vue'
  
const props = defineProps(
  ['data']
)

  // 按照人体图的组织顺序定义组织列表
  const orderedTissues = [
    "Brain", "Eye", "Pharynx", "Lung", "Heart", "Thyroid gland", "Thymus",
    "Stomach", "Skin", "Arthritis", "Liver", "Breast", "Kidney", "Adrenal gland",
    "Pancreas", "Spleen", "Colon", "Lymph", "Vessel", "Blood", "Ovary",
    "Uterus", "Placenta", "Embryo", "Bladder", "Prostate gland", "Testis",
    "Vagina", "Esophagus", "Nerve", "Muscle tissue", "Bone", "Soft tissue", "Bronchus"
  ]
  
  // 定义列
  const columns = [
    "Compartment", "Domain", "Stripe", "Cancer", "Non-cancer diseases",
    "Others", "Healthy", "Cell line", "iPSC/iPSC derived", "Organoids",
    "PDX", "Primary cell", "Tissue"
  ]
  
  // 定义颜色映射
  const colorMap = {
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
  
  // 默认高亮的组织
  const highlightedOrgans = ref([])
  
// 处理人体图点击事件
const handleOrganClick = (organName) => {
  // 如果已经高亮，则取消高亮
  if (highlightedOrgans.value.includes(organName)) {
    highlightedOrgans.value = highlightedOrgans.value.filter(organ => organ !== organName)
  } else {
    // 如果未高亮，则添加到高亮列表
    highlightedOrgans.value = [...highlightedOrgans.value, organName]
  }
}

  // 处理热图行标签点击事件
const handleRowLabelClick = (rowName) => {
  // 如果已经高亮，则取消高亮
  if (highlightedOrgans.value.includes(rowName)) {
    highlightedOrgans.value = highlightedOrgans.value.filter(organ => organ !== rowName)
  } else {
    // 如果未高亮，则添加到高亮列表
    highlightedOrgans.value = [...highlightedOrgans.value, rowName]
  }
}
console.log(props.data)
  
  </script>
  
  <style scoped>
  .visualization-container {
    display: flex;
    align-items: flex-start;
    /* /* gap: 20px; */
    padding-left: 110px; 
    /* height: 1000px */
    margin: 0px auto
  }
  
  .body-map {
    /* flex: 0 0 auto; */
    margin-top: 40px;
    margin-right: 10px;
    width: 120px;
  }
  
  .heatmap {
    /* flex: 1; */
    /* height: 800px;  */
  }
  </style>