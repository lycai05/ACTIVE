<template>
    <inter-chrom-curv-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </inter-chrom-curv-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import InterChromCurvTrackItem from './InterChromCurvTrackItem.vue'

const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    location: {
        type: Object,
        required: true
    },
    style: {
        type: Object,
        required: true
    }
})
</script>
