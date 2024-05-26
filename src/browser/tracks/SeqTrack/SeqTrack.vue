<template>
    <seq-track-item
    :location="props.location"
    :option="props.config.option"
    :style="props.style"
    >
    </seq-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import SeqTrackItem from './SeqTrackItem.vue'

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
        required: true,
    }
})
console.log(props.style)
</script>
