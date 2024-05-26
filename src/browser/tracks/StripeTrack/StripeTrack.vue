<template>
    <stripe-track-item
    :location="props.location"
    :option="props.config.option"
    >
    </stripe-track-item> 
  </template>
  
<script setup lang="ts">
import { defineProps } from 'vue'
import StripeTrackItem from './StripeTrackItem.vue'

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
