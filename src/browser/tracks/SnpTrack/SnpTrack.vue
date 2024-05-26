<template>
    <snp-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </snp-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import SnpTrackItem from './SnpTrackItem.vue'

const props = defineProps({
    config: {
        type: Object,
        required: true
    },
    location: {
        type: Object,
        required: true
    }
})
</script>
