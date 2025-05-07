<template>
	<n-card content-style="padding:0" hoverable>
		<div class="card-wrap flex flex-col">
			<n-spin :show="!loaded" class="chart grow flex flex-col">
				<div class="flex justify-center items-center mb-6">
					<img alt="Expresso Logo" class="h-24 mx-auto" src="../../assets/images/logo.png">
				</div>
				<div class="flex justify-center items-center mb-6 ">
					<!-- <MultiGenomeChart></MultiGenomeChart> -->
					<img alt="multi-genome organization" class="justify-center"
						src="../../assets/images/CREscope_graphical_abstract.png" style="width: 1000px; height: auto;">
				</div>
				<div class="w-full px-14 md:px-14 xl:px-14 py-4 lg:py-4 ">

					<p class="mb-3 text-xl text-gray-500 dark:text-gray-400 leading-10 text-justify">
						<span class="font-semibold text-gray-900 dark:text-white">CREScope: A comparative 3D genomic analysis web server. Key features of CRSScope include:</span>
					</p>

					<ul class="space-y-4 text-left text-gray-500 dark:text-gray-400 text-xl leading-10 text-justify">
						<li class="flex items-center space-x-3 rtl:space-x-reverse">
							<svg class="-mt-10 flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
									stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
							</svg>
							<span><span class="font-semibold text-gray-900 dark:text-white">Unique data sources:
								</span>
								Annotation of genomic regions using over 1300 3D genomic datasets in human and 400 3D genomic datasets in mouse
							</span>
						</li>
						<li class="flex items-center space-x-3 rtl:space-x-reverse">
							<svg class="-mt-10 flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
									stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
							</svg>
							<span><span class="font-semibold text-gray-900 dark:text-white">Interactive navigation:
								</span>
								Selection of genomic regions using interactive browser or upload a file
							</span>
						</li>
						<li class="flex items-center space-x-3 rtl:space-x-reverse">
							<svg class="-mt-10 flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
									stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
							</svg>
							<span><span class="font-semibold text-gray-900 dark:text-white">Meta Tracks:</span>
							Access Meta 3D genomic tracks ensembled from over 1000 Hi-C datasets, as well as over 5000 individual data tracks 
						</span>
						</li>
						<li class="flex items-center space-x-3 rtl:space-x-reverse">
							<svg class="-mt-10 flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400" aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
								<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
									stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5" />
							</svg>
							<span><span class="font-semibold text-gray-900 dark:text-white">Easy API access: </span>
							Access of our annotation resources through command line tools</span>
						</li>

					</ul>

				</div>
			</n-spin>
		</div>
	</n-card>
</template>

<script setup lang="ts">
import { NCard, NSpin } from "naive-ui"
import { useThemeStore } from "@/stores/theme"
import dayjs from "@/utils/dayjs"
import { computed, ref, toRefs, onMounted } from "vue"
// import MultiGenomeChart from "./MultiGenomeChart.vue"
interface ChartSeries {
	active: boolean
	name: string
	color: string
}
type ChartSeriesList = ChartSeries[]

const props = withDefaults(
	defineProps<{
		oneSeries?: boolean
	}>(),
	{ oneSeries: false }
)
const { oneSeries } = toRefs(props)

const themeStore = useThemeStore()

const twoSeries = computed(() => !oneSeries.value)
const style = computed<{ [key: string]: any }>(() => themeStore.style)
const textSecondaryColor = computed<string>(() => style.value["--fg-secondary-color"])
const loaded = ref(false)

const updateTime = ref(dayjs().format("DD-MM-YYYY HH:mm"))
const chartTypeValue = ref<DataType>("years")

const chartCTX = ref<VueApexChartsComponent | null>(null)
const chartSeries = ref<ChartSeriesList>([])

function setChartContext(ctx: VueApexChartsComponent) {
	chartCTX.value = ctx
	getSeries()
}

function toggleSeries(series: ChartSeries) {
	if (chartCTX.value) {
		series.active = !series.active
		chartCTX.value.toggleSeries(series.name)
	}
}

function getSeries() {
	const chartColors: string[] = chartCTX.value?.options?.colors || []
	chartSeries.value = (chartCTX.value?.series || []).map((s: any, index: number) => {
		return {
			active: true,
			name: s.name,
			color: chartColors[index % chartColors.length]
		}
	})
}

function capitalized(text: string) {
	const capitalizedFirst = text[0].toUpperCase()
	const rest = text.slice(1)

	return capitalizedFirst + rest
}

onMounted(() => {
	setTimeout(() => {
		loaded.value = true
	}, 1000)
})
</script>

<style scoped lang="scss">
.n-card {
	.card-wrap {
		position: relative;
		height: 100%;
		container-type: inline-size;

		.chart {
			overflow: hidden;
			width: 100%;
			padding-top: 40px;
			padding-bottom: 24px;

			:deep() {
				.n-spin-content {
					height: 100%;
					min-height: 300px;
				}
			}
		}

		.overlay {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			z-index: 1;
			padding: 26px;
			overflow: hidden;
			display: flex;
			justify-content: space-between;

			.info {
				width: fit-content;

				.title {
					color: var(--fg-secondary-color);
					letter-spacing: 0.1em;
					text-transform: uppercase;
					font-size: 10px;
					font-weight: bold;
				}

				.box-wrapper {
					gap: 40px;
				}
			}

			&.twoSeries {
				.info {
					.box-wrapper {
						margin-top: 20px;
					}
				}
			}
		}

		@container (max-width: 650px) {
			.overlay {
				&.twoSeries {
					flex-direction: column-reverse;
				}

				.info {
					.title {
						display: none;
					}
				}
			}
		}

		@container (max-width: 280px) {
			.overlay {
				flex-direction: column-reverse;

				.info {
					.box-wrapper {
						margin-top: 20px;
					}
				}
			}
		}
	}
}
</style>
