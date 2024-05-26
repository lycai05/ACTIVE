<template>
    <network-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </network-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import NetworkTrackItem from './NetworkTrackItem.vue'

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
