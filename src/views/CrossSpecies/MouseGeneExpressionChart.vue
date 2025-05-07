<template>
    <div class="gene-expression-view">
        <n-space vertical>
            <!-- 选择器区域 -->
            <!-- <n-card title="Filter Options">
                <n-space vertical>
                    <n-space>
                        <n-select v-model:value="selectedTissues" multiple :options="tissueOptions"
                            placeholder="Select tissues" style="min-width: 200px" />
                        <n-select v-model:value="selectedAges" multiple :options="ageOptions" placeholder="Select ages"
                            style="min-width: 200px" />
                        <n-select v-model:value="selectedSexes" multiple :options="sexOptions"
                            placeholder="Select sexes" style="min-width: 200px" />
                    </n-space>
                </n-space>
                <n-space>
                    <n-button type="primary" @click="fetchData">
                        Query Data
                    </n-button>
                </n-space>
            </n-card> -->

            <!-- 加载状态 -->
            <n-spin :show="loading" description="Loading expression data...">
                <!-- 图表区域 -->
                <n-card title="Gene Expression Boxplot">
                    <div ref="chartRef" style="width: 100%; height: 600px"></div>
                </n-card>
            </n-spin>
        </n-space>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed, h } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

const props = defineProps({
    gene: {
        type: Object,
        required: true
    }
})

// 状态变量
const loading = ref(false)
const chartRef = ref(null)
const chart = ref(null)
const expressionData = ref([])

// 选择器选项
const selectedTissues = ref([])
const selectedAges = ref([])
const selectedSexes = ref([])

// 选项数据
const tissueOptions = ref([])
const ageOptions = ref([])
const sexOptions = ref([
    { label: 'Male', value: 'm' },
    { label: 'Female', value: 'f' }
])

// 计算API URL
const apiUrl = computed(() => {
    return props.gene?.type === 'human'
        ? 'http://47.107.91.5:8888/api/genomehub/humangtexrnaseq'
        : 'http://47.107.91.5:8888/api/genomehub/mousernaseq'
})

// 获取数据
async function fetchData() {
    loading.value = true
    try {
        const params = new URLSearchParams()
        if (selectedTissues.value.length) {
            params.append('tissue', selectedTissues.value.join(','))
        }
        if (selectedAges.value.length) {
            params.append('age', selectedAges.value.join(','))
        }
        if (selectedSexes.value.length) {
            params.append('sex', selectedSexes.value.join(','))
        }

        const geneIdKey = props.gene.type === 'human' ? 'human_gene_id' : 'mouse_gene_id'
        params.append('gene_id', props.gene[geneIdKey])

        const response = await axios.get(`${apiUrl.value}?${params.toString()}`)
        expressionData.value = response.data
        updateChart()
    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        loading.value = false
    }
}

// 处理数据为箱线图格式
function processDataForBoxplot() {
    const tissueData = {}

    expressionData.value.forEach(item => {
        const tissue = item.sample_id.tissue
        if (!tissueData[tissue]) {
            tissueData[tissue] = []
        }
        tissueData[tissue].push(item.cpm)
    })

    const categories = Object.keys(tissueData)
    const boxData = categories.map(tissue => {
        const values = tissueData[tissue].sort((a, b) => a - b)
        const len = values.length
        if (len === 0) return []

        const q1 = values[Math.floor(len * 0.25)]
        const median = values[Math.floor(len * 0.5)]
        const q3 = values[Math.floor(len * 0.75)]
        const iqr = q3 - q1
        const lower = Math.max(values[0], q1 - 1.5 * iqr)
        const upper = Math.min(values[len - 1], q3 + 1.5 * iqr)

        // 计算异常值
        const outliers = values.filter(v => v < lower || v > upper)

        return [lower, q1, median, q3, upper, ...outliers]
    })

    return { categories, boxData }
}

// 更新图表
function updateChart() {
    if (!chart.value) return

    const { categories, boxData } = processDataForBoxplot()

    const option = {
        title: {
            text: `Gene Expression (${props.gene[props.gene.type === 'human' ? 'human_gene_id' : 'mouse_gene_id']})`,
            left: 'center'
        },
        toolbox: {
            feature: {
                saveAsImage: {
                    title: 'Save as Image',
                    pixelRatio: 2,
                    type: 'svg', // 默认 PNG 格式
                    excludeComponents: ['toolbox']
                }
            }
        },
        tooltip: {
            trigger: 'item',
            axisPointer: {
                type: 'shadow'
            },

        },
        grid: {
            left: '10%',
            right: '10%',
            bottom: '15%'
        },
        xAxis: {
            type: 'category',
            data: categories,
            boundaryGap: true,
            nameGap: 30,
            splitArea: {
                show: false
            },
            axisLabel: {
                rotate: 45
            }
        },
        yAxis: {
            type: 'value',
            name: 'CPM',
            splitArea: {
                show: true
            }
        },
        series: [{
            name: 'Gene Expression',
            type: 'boxplot',
            data: boxData,
            tooltip: {
                formatter: function (param) {
                    return [
                        `Tissue: ${param.name}`,
                        `Upper: ${param.data[4].toFixed(2)}`,
                        `Q3: ${param.data[3].toFixed(2)}`,
                        `Median: ${param.data[2].toFixed(2)}`,
                        `Q1: ${param.data[1].toFixed(2)}`,
                        `Lower: ${param.data[0].toFixed(2)}`
                    ].join('<br/>')
                }
            }
        }]
    }

    chart.value.setOption(option)
}


// 初始化图表
onMounted(() => {
    if (chartRef.value) {
        chart.value = echarts.init(chartRef.value, null, { renderer: 'svg' })
        window.addEventListener('resize', () => {
            chart.value.resize()
        })
    }

    // 初始加载数据
    fetchData()
})

// 监听选择器变化
watch([selectedTissues, selectedAges, selectedSexes], () => {
    fetchData()
}, { deep: true })

// 在组件销毁时清理
onUnmounted(() => {
    if (chart.value) {
        chart.value.dispose()
        window.removeEventListener('resize', chart.value.resize)
    }
})
</script>

<style scoped>
.gene-expression-view {
    padding: 20px;
}
</style>