<template>
	<div class="page">
		<div class="main-grid gap-5">

			<!-- main col -->
			<div class="main-col">
				<div class="flex flex-col gap-5 h-full">


					<!-- big chart -->
					<div class="flex main-chart-wrap">
						<Intro class="h-full"></Intro>
					</div>


					<div class="flex grow">
						<div class="col-span-2 space-y-8 md:grid md:grid-cols-2 md:gap-12 md:space-y-0">
        <CellTypeSummaryChart />
        <ChromatinInteractionSummaryChart />
        <NoncodingMutationChart />
        <CloudDatasetChart />
      </div>
					</div>

<div class="flex justify-between gap-5 mt-6">
	<CardNavigate></CardNavigate>
		<CardUpload></CardUpload>
		<!-- <CardApi></CardApi> -->
</div>
				</div>
			</div>

		</div>
	</div>
</template>

<script lang="ts" setup>
import { useThemeStore } from "@/stores/theme"
import { computed } from "vue"
import Intro from "./Intro.vue"
import CardNavigate from "./CardNavigate.vue"
import CardUpload from "./CardUpload.vue"
import CardApi from "./CardApi.vue"

const SessionsIcon = "carbon:user-multiple"
const UsersIcon = "carbon:user"
const ReportsIcon = "carbon:report"
const ErrorIcon = "carbon:debug"
const ViewsIcon = "carbon:view"
const ActivityIcon = "carbon:activity"
const UploadsIcon = "carbon:cloud-upload"

const themeStore = useThemeStore()

import BodySiteBarChart from './BodySiteBarChart.vue'

const style = computed<{ [key: string]: any }>(() => themeStore.style)
const textSecondaryColor = computed<string>(() => style.value["--fg-secondary-color"])

const chartBg = computed<string>(() =>
	themeStore.isThemeDark ? style.value["--secondary1-color"] : style.value["--secondary1-color"]
)
</script>

<style lang="scss" scoped>
.page {
	.main-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		grid-template-rows: repeat(1, 1fr);
		grid-template-areas: "main main side";

		@media (max-width: 1200px) {
			display: flex;
			flex-direction: column;

			.timeline-wrap {
				min-height: 400px;
				display: flex;
				flex-direction: column;

				.n-card {
					flex-grow: 1;
				}
			}
		}
	}

	.main-col {
		grid-area: main;
		container-type: inline-size;

		// .main-chart-wrap {
		// 	height: 450px;
		// }

		.four-cards-wrap {
			display: grid;
			grid-template-columns: repeat(4, minmax(0, 1fr));
			grid-template-rows: repeat(1, minmax(0, 1fr));

			@container (max-width: 1000px) {
				grid-template-columns: repeat(2, minmax(0, 1fr));
				grid-template-rows: repeat(2, minmax(0, 1fr));
			}

			@container (max-width: 460px) {
				grid-template-columns: repeat(1, minmax(0, 1fr));
				grid-template-rows: repeat(4, minmax(0, 1fr));
			}
		}
	}

	.side-col {
		grid-area: side;
	}
}
</style>
