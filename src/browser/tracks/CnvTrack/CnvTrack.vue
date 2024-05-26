<template>
    <cnv-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </cnv-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import CnvTrackItem from './CnvTrackItem.vue'

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
