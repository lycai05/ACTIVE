<template>
    <!-- <CompartmentChart></CompartmentChart> -->
    <!-- <CompartmentBrowser></CompartmentBrowser> -->
    <DomainTable :data="props.domainData" :loading="props.loading" :region="region" :page-size="10"
        @action="handleAction" />
</template>
<script setup lang="ts">
// import CompartmentChart from './CompartmentChart.vue';
// import CompartmentBrowser from './CompartmentBrowser.vue';
import DomainTable from './DomainTable.vue';
const props = defineProps([
    'domainData',
    'loading'
])

</script>
<style></style>