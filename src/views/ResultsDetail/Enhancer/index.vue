<template>
    <!-- <CompartmentChart></CompartmentChart> -->
    <!-- <CompartmentBrowser></CompartmentBrowser> -->
    <EnhancerTable :data="props.enhancerData" :loading="props.loading" :region="region" :page-size="10"
        @action="handleAction" />
</template>
<script setup lang="ts">
// import CompartmentChart from './CompartmentChart.vue';
// import CompartmentBrowser from './CompartmentBrowser.vue';
import EnhancerTable from './EnhancerTable.vue';
const props = defineProps([
    'enhancerData',
    'loading'
])

</script>
<style></style>