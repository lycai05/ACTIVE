<template>
               <n-card >
                    <template #header>
                        <div class="text-2xl">
                            Download files by sample id and file type
                        </div>
                    </template>
                    <div class="mb-4">
                        <n-space align="center">
                            <n-tag type="info">
                                GET
                            </n-tag>
                            <n-code :code="` /download/{sample_name}/{file_type}`" language="shell" inline />
                        </n-space>
                    </div>
                    <APICodeExample title="Example 1: Download chromatin loop file for sample GSM4072698 ">
                        <template #code1="{ js }">
                            {{ js(`
                            https://expresso.sustech.edu.cn/api/download/GSM4072698/loop
                            `) }}
                        </template>
                        <template #code2="{ js }">
                            {{ js(`
                            The file will be downloaded in the browser
                            `) }}
                        </template>
                    </APICodeExample>
                    <APICodeExample title="Example 2: Download stripe file for GSM4072698 ">
                        <template #code1="{ js }">
                            {{ js(`
                            https://expresso.sustech.edu.cn/api/download/GSM4072698/stripe
                            `) }}
                        </template>
                        <template #code2="{ js }">
                            {{ js(`
                            The file will be downloaded in the browser
                            `) }}
                        </template>
                    </APICodeExample>
                    <APICodeExample title="Example 3: Download contact domain file for GSM4072698 ">
                        <template #code1="{ js }">
                            {{ js(`
                            https://expresso.sustech.edu.cn/api/download/GSM4072698/domain
                            `) }}
                        </template>
                        <template #code2="{ js }">
                            {{ js(`
                            The file will be downloaded in the browser
                            `) }}
                        </template>
                    </APICodeExample>
                    <APICodeExample title="Example 4: Download compartment file for GSM4072698 ">
                        <template #code1="{ js }">
                            {{ js(`
                            https://expresso.sustech.edu.cn/api/download/GSM4072698/compartment
                            `) }}
                        </template>
                        <template #code2="{ js }">
                            {{ js(`
                            The file will be downloaded in the browser
                            `) }}
                        </template>
                    </APICodeExample>
                    <APICodeExample title="Example 5: Download contact matrix file in .hic format for GSM4072698 ">
                        <template #code1="{ js }">
                            {{ js(`
                            https://expresso.sustech.edu.cn/api/download/GSM4072698/matrix
                            `) }}
                        </template>
                        <template #code2="{ js }">
                            {{ js(`
                            The file will be downloaded in the browser
                            `) }}
                        </template>
                    </APICodeExample>
                </n-card>
</template>

<script lang="ts" setup>
import { NCard, NSpace, NText, NCode, NTag } from "naive-ui"
import Icon from "@/components/common/Icon.vue"
const ExternalIcon = "tabler:external-link"
const LinkIcon = "carbon:link"
import { RouterLink } from "vue-router"
import APICodeExample from "./APICodeExample.vue";
</script>
