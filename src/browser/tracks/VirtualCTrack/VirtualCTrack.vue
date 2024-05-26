<template>
    <virtual-c-track-item
    :location="props.location"
    :option="props.config.option"
    :controllerConfig="props.config.controllerConfig"
    :style="props.style"
    @updateIsSelective="($event) => $emit('updateIsSelective', $event)"
    >
    </virtual-c-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import VirtualCTrackItem from './VirtualCTrackItem.vue'

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
