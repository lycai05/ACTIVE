<template>
    <mcls-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </mcls-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import MclsTrackItem from './MclsTrackItem.vue'

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
