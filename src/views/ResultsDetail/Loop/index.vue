<template>
    <!-- <CompartmentChart></CompartmentChart> -->
    <!-- <CompartmentBrowser></CompartmentBrowser> -->
    <LoopTable :data="props.loopData" :loading="props.loading" :region="region" :page-size="10"
        @action="handleAction" />
</template>
<script setup lang="ts">
// import CompartmentChart from './CompartmentChart.vue';
// import CompartmentBrowser from './CompartmentBrowser.vue';
import LoopTable from './LoopTable.vue';
const props = defineProps([
    'loopData',
    'loading'
])

</script>
<style></style>