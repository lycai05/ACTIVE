<template>
    <hic-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </hic-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import HicTrackItem from './HicTrackItem.vue'

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
