<template>
    <domain-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </domain-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import DomainTrackItem from './DomainTrackItem.vue'

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
