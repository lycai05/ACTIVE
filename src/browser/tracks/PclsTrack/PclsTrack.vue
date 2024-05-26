<template>
    <pcls-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </pcls-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import PclsTrackItem from './PclsTrackItem.vue'

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
