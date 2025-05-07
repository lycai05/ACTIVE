<template>
    <!-- <n-card class="mb-8">
        <template #header>
            <div class="text-2xl">
                Below is a series of interactive slides to try example API usage.
            </div>
        </template>
<div>
    <iframe src="http://47.107.91.5:8090" style="width: 100%; height: 60vh; border: none;"></iframe>
</div>
</n-card> -->

    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
        <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full" title="Search samples"
            :segmented="{
                content: true,
                footer: true
            }">
            <template #header>
                Interactive exploration of EXPRESSO APIs
            </template>
            <template #default>
                <ul>
                    <li class="flex space-x-3 items-center mb-3">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Below is a series of interactive slides to try example API usage.
                        </p>
                    </li>
                    <li class="flex space-x-3 items-center mb-3">
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Click the arrow
                            <svg class="inline-block w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"
                                viewBox="0 0 24 24">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="2" d="M19 12H5m14 0-4 4m4-4-4-4" />
                            </svg>

                            to navigate to next slides
                        </p>
                    </li>
                    <li class="flex space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            CLick the run button
                            <svg class="inline-block w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                                viewBox="0 0 24 24">
                                <path fill-rule="evenodd"
                                    d="M8.6 5.2A1 1 0 0 0 7 6v12a1 1 0 0 0 1.6.8l8-6a1 1 0 0 0 0-1.6l-8-6Z"
                                    clip-rule="evenodd" />
                            </svg>
                            on each page to test the API and get the response data
                        </p>
                    </li>
                </ul>
                <div class="mt-6">
                    <iframe src="http://47.107.91.5:8090" style="width: 100%; height: 60vh; border: none;"></iframe>
                </div>
            </template>
            <template #header-extra>
            </template>
        </CardActions>
    </CardWrapper>
</template>

<script setup>
// No additional setup needed
</script>

<style scoped>
/* Add any styles you need */
</style>