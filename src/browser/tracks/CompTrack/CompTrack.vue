<template>
    <comp-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </comp-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import CompTrackItem from './CompTrackItem.vue'

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
