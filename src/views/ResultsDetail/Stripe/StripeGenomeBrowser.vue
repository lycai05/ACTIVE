<template>
    <div class="card genome-browser-card">
      <!-- Genome Browser Header -->
      <div class="mb-4">
        <h2 class="text-lg font-bold">Genome Browser</h2>
        <p class="text-gray-500">
          Visualize chromatin interactions and genomic features.
        </p>
      </div>
  
      <!-- Genome Browser Content -->
      <div v-if="viewingStripes.length > 0">
        <component
          :is="vueActiveBrowser"
          :viewing-stripes="viewingStripes"
          :key="vueActiveBrowserKey"
          :id="id"
          :assembly="assembly"
          :tracks-info="tracksInfo"
        />
      </div>
      <div v-else class="text-gray-500 text-center">
        No data to display. Please select a gene or biosample.
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps } from "vue";
  
  // Props
  defineProps({
    viewingStripes: {
      type: Array,
      required: true,
    },
    vueActiveBrowser: {
      type: Object,
      required: true,
    },
    vueActiveBrowserKey: {
      type: Number,
      required: true,
    },
    id: {
      type: String,
      required: true,
    },
    assembly: {
      type: String,
      required: true,
    },
    tracksInfo: {
      type: Array,
      required: true,
    },
  });
  </script>
  
  <style scoped>
  .genome-browser-card {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>