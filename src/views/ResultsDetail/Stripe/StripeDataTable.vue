<template>
    <div class="card data-table-card">
      <n-data-table
        :columns="columns"
        :data="data"
        :loading="loading"
        :pagination="pagination"
        @update:page="handlePageChange"
        @update:sorter="handleSorterChange"
      />
    </div>
  </template>
  
  <script setup lang="ts">
  import { defineProps, emit } from "vue";
  import { DataTableColumn } from "naive-ui";
  
  // Props
  defineProps({
    columns: {
      type: Array as () => DataTableColumn[],
      required: true,
    },
    data: {
      type: Array,
      required: true,
    },
    loading: {
      type: Boolean,
      required: true,
    },
    pagination: {
      type: Object,
      required: true,
    },
  });
  
  // Emit functions
  const emit = defineEmits(["update-page", "update-sorter"]);
  
  // Handlers
  const handlePageChange = (page: number) => emit("update-page", page);
  const handleSorterChange = (sorter: any) => emit("update-sorter", sorter);
  </script>
  
  <style scoped>
  .data-table-card {
    background-color: #ffffff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  </style>