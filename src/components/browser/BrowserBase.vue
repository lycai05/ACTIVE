<template>
  <div class="flex grow mb-6">
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
      <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full" :segmented="{
        content: true,
        footer: true
      }">
        <template #header>
          <slot name="header">
            <n-h3 align-text>Browse Navigation</n-h3>
          </slot>
        </template>
        <template #default>
          <slot></slot>
        </template>
        <template #header-extra>
          <slot name="header-extra"></slot>
        </template>
      </CardActions>
    </CardWrapper>
  </div>
</template>

<script setup>
import { NButton } from 'naive-ui'
</script> 