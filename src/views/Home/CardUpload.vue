<template>
	<n-card hoverable>
	  <div class="flex items-center gap-8">
		<!-- 左侧图片 -->
		<div class="flex-shrink-0">
		  <img 
		  src="../../assets/images/upload_logo.png" 
		  class="circular-image"
		  />
		</div>
		
		<!-- 右侧内容 -->
		<div class="flex-grow">
		  <h3 class="text-lg font-semibold mb-4">
			Copy and paste multiple genomic regions
		  </h3>
		  
		  <p class="mb-4">
			Visualize various 3D genomic features
			<br />
			<br />
			Visualize contact matrix, compartments, contac domains, stripes, chromatin loops
		  </p>
		  
		  <div>
			<n-button type="primary" @click="handleClick">
			  Copy & Paste
			</n-button>
		  </div>
		</div>
	  </div>
	</n-card>
  </template>
  
  <script setup lang="ts">
  import { NCard, NButton, NText } from "naive-ui"
  import Icon from "@/components/common/Icon.vue"
  import { useRouter } from "vue-router";
  const router = useRouter()
  
  const CartIcon = "tabler:shopping-cart"
  const HeartIcon = "ion:heart"
  const ShareIcon = "carbon:share"
  
  const handleClick = () => {
	router.push({path: '/annotation'})
  }
  </script>
  
  <style scoped>
  .circular-image {
	width: 200px;
	height: 200px;
	border: 1px;
	border-radius: 50%;
	object-fit: cover;
  }
  </style>