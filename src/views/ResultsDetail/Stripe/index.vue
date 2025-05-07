<template>
  <div class="mx-auto max-w-8xl">
    <div class="flex grow mt-6">
      <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
        <CardActions
          :expand="expand"
          :isExpand="isExpand"
          :reload="reload"
          class="h-full"
          title="Search the Stripe Atlas"
          :segmented="{ content: true, footer: true }"
        >
          <template #header>
            <n-h3 prefix="bar" align-text>Search the Stripe Atlas</n-h3>
          </template>
          <template #default>
            <div class="gap-3">
              <n-data-table
                :bordered="true"
                size="small"
                :columns="columns"
                :loading="props.loading"
                :data="currentPageData"
                :pagination="{
                  page: currentPage,
                  pageSize: itemsPerPage,
                  showSizePicker: true,
                  pageSizes: [10, 20, 50, 100],
                  total: props.stripeData.length
                }"
                @update:page="handlePageChange"
              />
            </div>
          </template>
        </CardActions>
      </CardWrapper>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, h } from "vue";

// 接收父组件的 props
const props = defineProps(["stripeData", "loading"]);

// 分页逻辑
const currentPage = ref(1); // 当前页
const itemsPerPage = ref(10); // 每页条数

const totalPages = props.stripeData.total_pages;
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value;
  const end = start + itemsPerPage.value;
  return props.stripeData.slice(start, end);
});

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

// 定义列和样式
const columns = [
  { title: "Chrom1", key: "chrom1" },
  { title: "Pos1", key: "pos1" },
  { title: "Pos2", key: "pos2" },
  { title: "Chrom2", key: "chrom2" },
  { title: "Pos3", key: "pos3" },
  { title: "Pos4", key: "pos4" },
  {
    title: "Sample ID",
    key: "sample_id",
    render: (row) =>
      h(
        "a",
        { href: `#/sample/${row.sample_id}`, style: "color: #1d4ed8;" },
        row.sample_id
      ),
  },
  {
    title: "P-value",
    key: "pvalue",
    render: (row) =>
      h(
        "span",
        {
          style: `color: ${row.pvalue < 0.05 ? "red" : "green"}; font-weight: bold;`,
        },
        row.pvalue.toFixed(3)
      ),
  },
];
</script>
<style scoped>
.active {
  background-color: #e2e9ec;
  color: white;
}
</style>
