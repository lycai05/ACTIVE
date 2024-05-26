<template>
    <dot-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </dot-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import DotTrackItem from './DotTrackItem.vue'

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
