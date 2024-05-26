<template>
    <scls-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </scls-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import SclsTrackItem from './SclsTrackItem.vue'

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
