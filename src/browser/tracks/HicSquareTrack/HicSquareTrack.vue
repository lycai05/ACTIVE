<template>
    <hic-square-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </hic-square-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import HicSquareTrackItem from './HicSquareTrackItem.vue'

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
