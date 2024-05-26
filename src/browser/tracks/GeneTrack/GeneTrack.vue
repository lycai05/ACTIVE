<template>
    <gene-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </gene-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import GeneTrackItem from './GeneTrackItem.vue'

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
