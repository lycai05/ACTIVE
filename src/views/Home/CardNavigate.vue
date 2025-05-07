<template>
	  <n-card hoverable>
		<div class="flex items-center gap-8">
		  <!-- 左侧图片 -->
		  <div class="flex-shrink-0">
			<img 
			  src="../../assets/images/navigate_logo.png" 
			  class="circular-image"
			/>
		  </div>
		  
		  <!-- 右侧内容 -->
		  <div class="flex-grow">
			<h3 class="text-lg font-semibold mb-4">
			  Navigate the genome using MetaTrack from 1000 Hi-C datasets
			</h3>
			
			<p class="mb-4">
			  Compare the expression level of genes in A / B compartment
			  <br />
			  Identify active and inactive stripes
			  <br />
			  Identify chromatin loop enriched transcription factors
			</p>
			
			<div>
			  <n-button type="primary" @click="handleClick">
				Navigate
			  </n-button>
			</div>
		  </div>
		</div>
	  </n-card>
  </template>
  
  <script setup lang="ts">
  import { NCard, NButton, NText, NDivider } from "naive-ui"
  import Icon from "@/components/common/Icon.vue"
  import { useRouter } from "vue-router";
  const router = useRouter()
  
  const CartIcon = "tabler:shopping-cart"
  const HeartIcon = "ion:heart"
  const ShareIcon = "carbon:share"
  
  const handleClick = () => {
	router.push({path: '/browse'})
  }
  </script>
  
  <style scoped>
  .circular-image {
	width: 200px;
	height: 200px;
	border-radius: 50%;
	object-fit: cover;
  }
  </style>