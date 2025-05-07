<template>
    <n-card class="card mb-4">
        <n-collapse :default-expanded-names="['code1', 'code2']" arrow-placement="right">
            <template #header-extra>
                <Icon :name="CodeIcon"></Icon>
            </template>
            <n-collapse-item title="Code" name="code1">
                <template #header>
                    <n-tag type="success" >
                Request
            </n-tag>
            </template>
                <div class="code-container">
                    <n-scrollbar x-scrollable style="max-width: 100%; max-height: 400px">
                        <slot name="code1"  :js="js"></slot>
                        <div class="code-box" v-show="loaded.js">
                            <pre ref="refJS"></pre>
                        </div>
                    </n-scrollbar>
                </div>
            </n-collapse-item>
            <n-collapse-item title="Code" name="code2">
                <template #header>
                    <n-tag type="success" >
                Response
            </n-tag>
            </template>
                <div class="code-container">
                    <n-scrollbar x-scrollable style="max-width: 100%; max-height: 400px">
                        <slot name="code2" :js="js2"></slot>
                        <div class="code-box" v-show="loaded.js">
                            <pre ref="refJS2"></pre>
                        </div>
                    </n-scrollbar>
                </div>
            </n-collapse-item>
        </n-collapse>

    </n-card>
</template>

<script setup lang="ts">
import { hljs, resetIndent } from "@/directives/v-hl"
import { NCollapse, NCollapseItem, NCard, NScrollbar, NTag } from "naive-ui"
import { ref } from "vue"
import Icon from "@/components/common/Icon.vue"

type LangType = "html" | "js" | "css"
const CodeIcon = "carbon:code"

const refHTML = ref<HTMLElement | null>(null)
const refJS = ref<HTMLElement | null>(null)
const refJS2 = ref<HTMLElement | null>(null)
const refCSS = ref<HTMLElement | null>(null)

const loaded = ref({
    html: false,
    js: false,
    css: false
})

function codeInit(code: string, lang: LangType) {
    let el: HTMLElement | null = null
    if (lang === "html") {
        el = refHTML.value
    }
    if (lang === "js") {
        el = refJS.value
    }
    if (lang === "css") {
        el = refCSS.value
    }

    if (el) {
        el.innerHTML = hljs.highlightAuto(code).value
        resetIndent(el)
        loaded.value[lang] = true
    }
}

function codeInit2(code: string, lang: LangType) {
    let el: HTMLElement | null = null
    if (lang === "html") {
        el = refHTML.value
    }
    if (lang === "js") {
        el = refJS2.value
    }
    if (lang === "css") {
        el = refCSS.value
    }

    if (el) {
        el.innerHTML = hljs.highlightAuto(code).value
        resetIndent(el)
        loaded.value[lang] = true
    }
}

function html(code: string) {
    if (code) {
        codeInit(code, "html")
    }
}

function js(code: string) {
    if (code) {
        codeInit(code, "js")
    }
}

function js2(code: string) {
    if (code) {
        codeInit2(code, "js")
    }
}

function css(code: string) {
    if (code) {
        codeInit(code, "css")
    }
}
</script>

<style scoped lang="scss">
.card {
    .content {

        .description {
            line-height: 1.5;
            margin-bottom: 20px;
        }
    }

    .code-container {
        display: grid;
        background-color: var(--hover-010-color);

        .code-box {
            margin: 15px 0;

            .label {
                background-color: var(--hover-010-color);
                opacity: 0.5;
                display: inline-block;
                padding: 4px 6px;
                font-size: 12px;
                border-radius: var(--border-radius-small);
                margin-bottom: 5px;
                line-height: 1;
            }
        }
    }
}
</style>
