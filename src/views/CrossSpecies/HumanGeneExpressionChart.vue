<template>
    <div class="gene-expression-view">
        <n-space vertical>
            <n-card :title="`Human Gene Expression: ${geneInfo}`">
                <!-- 添加加载状态包装 -->
                <n-spin :show="loading" description="Loading expression data...">
                    <div ref="chartRef" style="width: 100%; height: 600px" :class="{ 'opacity-50': loading }"></div>
                    
                    <!-- 添加无数据时的提示 -->
                    <n-empty v-if="!expressionData.length && !loading" description="No expression data available">
                        <template #extra>
                            <n-button size="small" @click="fetchData">
                                Retry
                            </n-button>
                        </template>
                    </n-empty>
                </n-spin>
            </n-card>
        </n-space>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import axios from 'axios'
import * as echarts from 'echarts'

const props = defineProps({
    gene: {
        type: Object,
        required: true
    }
})

// 状态变量
const chartRef = ref(null)
const chart = ref(null)
const expressionData = ref([])
const loading = ref(false)

// 计算基因信息显示
const geneInfo = computed(() => {
    if (expressionData.value && expressionData.value.length > 0) {
        const gene = expressionData.value[0].gene
        return `${gene.gene_name} (${gene.gene_id})`
    }
    return props.gene.human_gene_id
})

// 获取数据
async function fetchData() {
    loading.value = true
    try {
        const response = await axios.get(`http://47.107.91.5:8888/api/genomehub/humangtexrnaseq/`, {
            params: {
                gene_id: props.gene.human_gene_id
            }
        })
        expressionData.value = response.data
        updateChart()
    } catch (error) {
        console.error('Error fetching data:', error)
    } finally {
        loading.value = false
    }
}

// 处理数据为柱状图格式
function processDataForBarChart() {
    // 按organ_name对数据进行分组
    const organGroups = {}
    
    expressionData.value.forEach(item => {
        const organName = item.tissue_type.organ_name
        if (!organGroups[organName]) {
            organGroups[organName] = []
        }
        organGroups[organName].push({
            tissue: item.tissue_type.tissue_name,
            ntpm: item.ntpm,
            organ: organName
        })
    })

    // 排序数据：先按器官分组，每个器官内部按照NTPM值排序
    const sortedData = []
    Object.entries(organGroups).forEach(([organ, tissues]) => {
        tissues.sort((a, b) => b.ntpm - a.ntpm) // 在每个器官内部按NTPM降序排序
        sortedData.push(...tissues)
    })

    return {
        categories: sortedData.map(item => item.tissue),
        values: sortedData.map(item => item.ntpm),
        organs: sortedData.map(item => item.organ)
    }
}

// 更新图表
function updateChart() {
    if (!chart.value) return

    const { categories, values, organs } = processDataForBarChart()

    // 为不同器官创建不同的颜色
    const uniqueOrgans = [...new Set(organs)]
    const organColors = uniqueOrgans.reduce((acc, organ, index) => {
        acc[organ] = echarts.color.modifyHSL(
            '#5470c6',
            Math.round(360 * (index / uniqueOrgans.length))
        )
        return acc
    }, {})

    const option = {
        title: {
            text: `Expression Profile Across Tissues`,
            left: 'center',
            top: 20
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            },
            formatter: function (params) {
                const dataIndex = params[0].dataIndex
                return `
                    <strong>${categories[dataIndex]}</strong><br/>
                    Organ: ${organs[dataIndex]}<br/>
                    NTPM: ${values[dataIndex].toFixed(2)}
                `
            }
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
        grid: {
            left: '10%',
            right: '5%',
            bottom: '15%',
            containLabel: true
        },
        xAxis: {
            type: 'category',
            data: categories,
            axisLabel: {
                rotate: 45,
                interval: 0,
                align: 'right'
            },
            splitLine: {
                show: false
            }
        },
        yAxis: {
            type: 'value',
            name: 'NTPM',
            nameLocation: 'middle',
            nameGap: 50,
            splitLine: {
                lineStyle: {
                    type: 'dashed'
                }
            }
        },
        // dataZoom: [
        //     {
        //         type: 'slider',
        //         show: true,
        //         xAxisIndex: [0],
        //         start: 0,
        //         end: 100
        //     }
        // ],
        series: [{
            name: 'NTPM',
            type: 'bar',
            data: values,
            itemStyle: {
                color: function(param) {
                    return organColors[organs[param.dataIndex]]
                }
            },
            label: {
                show: true,
                position: 'top',
                formatter: function(param) {
                    return param.value.toFixed(1)
                },
                fontSize: 10,
                distance: 5,
                show: false  // 默认不显示数值标签
            },
            emphasis: {
                itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                },
                label: {
                    show: true  // 鼠标悬停时显示数值标签
                }
            }
        }],
        // 添加图例
        legend: {
            data: uniqueOrgans,
            top: 50,
            type: 'scroll',
            itemWidth: 15,
            itemHeight: 15,
            textStyle: {
                fontSize: 12
            }
        }
    }

    chart.value.setOption(option)
}

// 监听props变化
watch(() => props.gene, () => {
    fetchData()
}, { deep: true })

// 初始化图表
onMounted(() => {
    if (chartRef.value) {
        chart.value = echarts.init(chartRef.value, null, { renderer: 'svg' })
        window.addEventListener('resize', () => {
            chart.value?.resize()
        })
    }
    fetchData()
})

// 组件销毁时清理
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