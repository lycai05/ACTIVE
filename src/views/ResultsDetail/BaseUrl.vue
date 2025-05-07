<template>
    <CardWrapper v-slot="{ expand, isExpand, reload }" class="h-full grow w-full">
        <CardActions :expand="expand" :isExpand="isExpand" :reload="reload" class="h-full" title="Search samples"
            :segmented="{
                content: true,
                footer: true
            }">
            <template #header>
                Overview of the API usage in EXPRESSO database
            </template>
            <template #default>
                <ul>
                    <li class="flex space-x-3 items-center mb-3">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500"
									fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"></path>
								</svg>
                        <p class="text-xl font-light text-gray-500">
                            Welcome to our API. Most of the data can be accessed via the website as well as the API.
                        </p>
                    </li>
                    <li class="flex space-x-3 items-center mb-3">
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500"
									fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"></path>
								</svg>
                        <p class="text-xl font-light text-gray-500">
                            Base URL: <n-tag type="info">https://expresso.sustech.edu.cn/api</n-tag>
                        </p>
                    </li>
                    <li class="flex space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-primary-600 dark:text-primary-500"
									fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
									<path fill-rule="evenodd"
										d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
										clip-rule="evenodd"></path>
								</svg>
                        <p class="text-xl font-light text-gray-500">
                            With this set of APIs, you can:
                        </p>
                    </li>
                    <li class="ml-8 mt-2 mb-3 flex space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-green-600 dark:text-green-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Look up metadata.
                        </p>
                    </li>
                    <li class="ml-8 flex mb-3 space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-green-600 dark:text-green-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Search 3D genomic features, including compartments, stripes, contact domains, and chromatin
                            loops.
                        </p>
                    </li>
                    <li class="ml-8 flex mb-3 space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-green-600 dark:text-green-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Search for genes and identify associations between genes and 3D genomic features.
                        </p>
                    </li>
                    <li class="ml-8 flex mb-3 space-x-3 items-center">
                        <!-- Icon -->
                        <svg class="flex-shrink-0 w-5 h-5 text-green-600 dark:text-green-500" fill="currentColor"
                            viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd"></path>
                        </svg>
                        <p class="text-xl font-light text-gray-500">
                            Additionally, you can download files such as contact matrices, compartments, contact domains,
                            stripes, and chromatin loops for each sample.
                        </p>
                    </li>
                </ul>
            </template>
            <template #header-extra>
            </template>
        </CardActions>
    </CardWrapper>
</template>

<script lang="ts" setup>
import { NTag } from "naive-ui"
</script>
