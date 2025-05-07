<template>
	<div class="page">
	  <div class="flex grow">
		<CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
		  <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full"
			title="Search genes or genomic regions" :segmented="{
			  content: true,
			  footer: true
			}">
			<template #header-extra></template>
			<template #default>
			  <ul>
				<li class="flex space-x-3 items-center mb-2">
				  <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500"
					fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd"
					  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					  clip-rule="evenodd"></path>
				  </svg>
				  <p class="text-xl font-light text-gray-500">Search gene name or filter by genomic regions</p>
				</li>
				<li class="flex space-x-3 items-center">
				  <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500"
					fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
					<path fill-rule="evenodd"
					  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
					  clip-rule="evenodd"></path>
				  </svg>
				  <p class="text-xl font-light text-gray-500">
					Or Click the example gene list below
				  </p>
				</li>
			  </ul>
			  <div class="mt-6">
				<button type="button"
				  class="mr-4 text-white bg-blue-600 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				  @click="handleSPP2Click">
				  Try Example: SPP2
				</button>
				<button type="button"
				  class="text-white bg-blue-600 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				  @click="handleACTBClick">
				  Try Example: ACTB
				</button>
			  </div>
			</template>
		  </CardActions>
		</CardWrapper>
	  </div>
  
	  <div class="mt-6">
		<BrowserView ref="browserViewRef" />
		
		
		<n-card title="Human-Mouse Gene and CRE homology" style="margin-bottom: 16px">
    <n-tabs type="line" animated>
      <n-tab-pane name="ortholog" tab="Ortholog genes">
        <GeneTableView @update-regions="handleUpdateRegions" />
      </n-tab-pane>
      <n-tab-pane name="cre_homology" tab="CRE homology">
        <TableView @update-regions="handleUpdateRegions" />
      </n-tab-pane>
    </n-tabs>
  </n-card>
	  </div>
	</div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue'
  import { NButton } from "naive-ui"
  import { useRouter } from 'vue-router'
  import DemoList from "./List.vue"
  import BrowserView from './BrowserView.vue'
  import TableView from './TableView.vue'
  import GeneTableView from './GeneTableView.vue'

  const router = useRouter()
  const browserViewRef = ref()
  
  const handleUpdateRegions = (regions) => {
	if (browserViewRef.value) {
	  browserViewRef.value.updateRegions(regions)
	}
  }
  
  const handleSPP2Click = () => {
	if (browserViewRef.value) {
	  browserViewRef.value.updateRegions({
		human: {
		  chrom: 'chr2',
		  start: 234050679,
		  end: 234077134
		},
		mouse: {
		  chrom: 'chr1',
		  start: 88406743,
		  end: 88429321
		}
	  })
	}
  }
  
  const handleACTBClick = () => {
	if (browserViewRef.value) {
	  browserViewRef.value.updateRegions({
		human: {
		  chrom: 'chr7',
		  start: 5525477,
		  end: 5534850
		},
		mouse: {
		  chrom: 'chr5',
		  start: 142901297,
		  end: 142908576
		}
	  })
	}
  }
  </script>
  
  <style lang="scss" scoped>
  .page {
	.list {
	  container-type: inline-size;
  
	  .masonry {
		--notes-gap: 1.25em;
		column-count: 3;
		column-gap: var(--notes-gap);
  
		@container (max-width: 1500px) {
		  column-count: 3;
		}
  
		@container (max-width: 800px) {
		  column-count: 2;
		}
  
		.card-wrapper {
		  overflow: hidden;
		  margin-bottom: var(--notes-gap);
		}
	  }
	}
  }
  </style>