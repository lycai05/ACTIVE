<template>
	<div class="search-box-modal z-50">
		<n-card style="width: 100%" content-style="padding: 0;" :bordered="false" size="huge" role="dialog"
			aria-modal="true">
			<div class="search-box border border-gray-200 " @keydown.up="prevItem()" @keydown.down="nextItem()">
				<div class="search-input flex items-center">
					<Icon :name="SearchIcon" :size="16"></Icon>
					<input placeholder="GSMXXXXX" v-model="search" class="grow bg-white" @input="fetchData" />
					<!-- <n-text code>ESC</n-text> -->
					<div v-show="showSearchBox"><Icon  :name="CloseIcon" :size="20" @click="closeBox()" class="cursor-pointer"></Icon></div>
					
				</div>
				<!-- <n-divider /> -->
				<div class="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg mt-1"
					v-show="showSearchBox">
					<n-card>
						<n-scrollbar style="height: 400px" ref="scrollContent">
							<div class="conten-wrap">
								<div class="group" v-for="group of filteredGroups" :key="group.name">
							<div class="group-title">{{ group.name }}</div>
							<div class="group-list">
								<button
									v-for="item of group.items"
									:key="item.key"
									:id="item.key.toString()"
									class="item flex items-center"
									:class="{ active: item.key === activeItem }"
									@click="callAction(item.action)"
								>
									<!-- <div class="icon">
										<n-avatar v-if="item.iconImage" round :size="28" :src="item.iconImage" />
										<Icon :name="item.iconName" v-if="item.iconName" :size="18"></Icon>
									</div> -->
									<div class="title grow">
										<Highlighter
											highlightClassName="highlight"
											:searchWords="keywords"
											:autoEscape="true"
											:textToHighlight="item.label"
										/>
									</div>
									<div class="label">{{ item.title }}</div>
									<svg class="inline mb-1 w-4 h-4 text-grey-500 hover:text-blue-500 transition-colors duration-300"
										aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"
										viewBox="0 0 18 18">
										<path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
											stroke-width="2"
											d="M15 11v4.833A1.166 1.166 0 0 1 13.833 17H2.167A1.167 1.167 0 0 1 1 15.833V4.167A1.166 1.166 0 0 1 2.167 3h4.618m4.447-2H17v5.768M9.111 8.889l7.778-7.778" />
									</svg>

								</button>
							</div>
						</div>
								<!-- <ul v-if="filteredGroups.length">
									<li v-for="result in filteredGroups" :key="result">{{ result }}</li>
								</ul> -->
								 <div v-if="!genesArray.length" class="group-empty">
									We couldn't find anything matching "{{ search }}"
								</div> 
							</div>
						</n-scrollbar>
						<n-divider />
						<div class="hint-bar flex items-center justify-center">
							<div class="hint flex items-center justify-center">
								<div class="icon">
									<Icon :name="ArrowEnterIcon" :size="12"></Icon>
								</div>
								<span class="label">to select</span>
							</div>
							<div class="hint flex items-center justify-center">
								<div class="icon">
									<Icon :name="ArrowSortIcon" :size="12"></Icon>
								</div>
								<span class="label">to navigate</span>
							</div>
						</div>
					</n-card>
				</div>
			</div>
		</n-card>
	</div>
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from "vue"
import { NText, NModal, NCard, NDivider, NAvatar, NScrollbar, type ScrollbarInst } from "naive-ui"
import { useMagicKeys, whenever } from "@vueuse/core"
import Highlighter from "vue-highlight-words"
import { useThemeSwitch } from "@/composables/useThemeSwitch"
import { useFullscreenSwitch } from "@/composables/useFullscreenSwitch"
import { useSearchDialog } from "@/composables/useSearchDialog"
import { getOS } from "@/utils"
import Icon from "@/components/common/Icon.vue"
import axios from '@/plugins/axios';
import { useRouter } from 'vue-router'

const router = useRouter()

const SearchIcon = "ion:search-outline"
const TodoIcon = "fluent:task-list-square-add-20-regular"
const EmailIcon = "fluent:mail-edit-20-regular"
const NotesIcon = "fluent:chart-person-20-regular"
const ArrowEnterIcon = "fluent:arrow-enter-left-24-regular"
const ArrowSortIcon = "fluent:arrow-sort-24-regular"
const FullScreenIcon = "fluent:full-screen-maximize-24-regular"
const DarkModeIcon = "ion:moon-outline"
const CloseIcon = "ion:close"

const emit = defineEmits(['submitGene'])

interface GroupItem {
	iconName: string | null
	iconImage: string | null
	key: number | string
	title: string
	label: string
	tags?: string
	action: () => void
}

interface Group {
	name: string
	items: GroupItem[]
}
type Groups = Group[]


const showSearchBox = ref(false)
const search = ref("")
const activeItem = ref<null | string | number>(null)
const commandIcon = ref("⌘")
const scrollContent = ref<(ScrollbarInst & { $el: any }) | null>(null)

// const groups = ref<Groups>([
// 	{
// 		name: "Applications",
// 		items: [
// 			{
// 				iconName: TodoIcon,
// 				iconImage: null,
// 				key: 1,
// 				title: "Add todo list",
// 				label: "Shortcut",
// 				action() {
// 					router.push({ name: "Apps-Kanban" })
// 				}
// 			},
// 			{
// 				iconName: EmailIcon,
// 				iconImage: null,
// 				key: 2,
// 				title: "Compose new email",
// 				label: "Shortcut",
// 				action() {
// 					router.push({ name: "Apps-Mailbox" })
// 				}
// 			},
// 			{
// 				iconName: NotesIcon,
// 				iconImage: null,
// 				key: 3,
// 				title: "View Notes",
// 				label: "Shortcut",
// 				action() {
// 					router.push({ name: "Apps-Notes" })
// 				}
// 			}
// 		]
// 	},
// 	{
// 		name: "Contacts",
// 		items: [
// 			{
// 				iconName: null,
// 				iconImage: "https://i.pravatar.cc/56?_=" + Math.random(),
// 				key: 4,
// 				title: "Antoinette Klocko",
// 				label: "ilene37@gmail.com",
// 				action() {
// 					router.push({ name: "Apps-Chat" })
// 				}
// 			},
// 			{
// 				iconName: null,
// 				iconImage: "https://i.pravatar.cc/56?_=" + Math.random(),
// 				key: 5,
// 				title: "Randall Graham",
// 				label: "nya_koss47@hotmail.com",
// 				action() {
// 					router.push({ name: "Apps-Chat" })
// 				}
// 			},
// 			{
// 				iconName: null,
// 				iconImage: "https://i.pravatar.cc/56?_=" + Math.random(),
// 				key: 6,
// 				title: "Maurice Moen",
// 				label: "adriel.torp@hotmail.com",
// 				action() {
// 					router.push({ name: "Apps-Chat" })
// 				}
// 			}
// 		]
// 	},
// 	{
// 		name: "Actions",
// 		items: [
// 			{
// 				iconName: FullScreenIcon,
// 				iconImage: null,
// 				key: 7,
// 				title: "Toggle fullscreen",
// 				label: "Action",
// 				action() {
// 					useFullscreenSwitch().toggle()
// 				}
// 			},
// 			{
// 				iconName: DarkModeIcon,
// 				iconImage: null,
// 				key: 8,
// 				title: "Toggle dark mode",
// 				label: "Action",
// 				action() {
// 					useThemeSwitch().toggle()
// 				}
// 			}
// 		]
// 	}
// ])

const keywords = computed<string[]>(() => {
	if (search.value.length > 1) {
		return search.value.split(" ").filter(k => k)
	} else {
		return []
	}
})
// const filteredGroups = computed<Groups>(() => {
// 	if (keywords.value.length === 0) {
// 		return groups.value
// 	}
// 	const newGroups: Groups = []
// 	for (const group of groups.value) {
// 		const items = group.items.filter(item => {
// 			if (keywords.value.filter(k => item.title.toLowerCase().indexOf(k.toLowerCase()) !== -1).length !== 0) {
// 				return true
// 			}
// 			if (
// 				item.tags &&
// 				keywords.value.filter(k => item.tags?.toLowerCase().indexOf(k.toLowerCase()) !== -1).length !== 0
// 			) {
// 				return true
// 			}
// 			return false
// 		})
// 		if (items.length) {
// 			newGroups.push({
// 				name: group.name,
// 				items
// 			})
// 		}
// 	}
// 	return newGroups
// })


const filteredGroups = ref('')
/*eslint  @typescript-eslint/no-unused-vars: "off"*/
const filteredFlattenItems = computed<GroupItem[]>(() => {
	const items = []

	for (const group of filteredGroups.value) {
		items.push(...group.items)
	}

	return items
})

function openBox(e?: MouseEvent) {
	if (!showSearchBox.value) {
		showSearchBox.value = true
		setTimeout(() => {
			// search.value = ""
			activeItem.value = null
		}, 100)
	}
	return e
}
function closeBox() {
	showSearchBox.value = false
	search.value = ""
	activeItem.value = null
}
function callAction(action: () => void) {
	action()
	closeBox()
}

function nextItem() {
	const currentIndex = filteredFlattenItems.value.findIndex(item => item.key === activeItem.value)
	if (currentIndex === filteredFlattenItems.value.length - 1 || activeItem.value === null) {
		activeItem.value = filteredFlattenItems.value[0].key
	} else {
		activeItem.value = filteredFlattenItems.value[currentIndex + 1].key
	}
	centerItem()
}
function prevItem() {
	const currentIndex = filteredFlattenItems.value.findIndex(item => item.key === activeItem.value)
	if (currentIndex === 0 || activeItem.value === null) {
		activeItem.value = filteredFlattenItems.value[filteredFlattenItems.value.length - 1].key
	} else {
		activeItem.value = filteredFlattenItems.value[currentIndex - 1].key
	}
	centerItem()
}
function performAction() {
	const item = filteredFlattenItems.value.find(item => item.key === activeItem.value)
	if (item) {
		callAction(item.action)
	}
}
function centerItem() {
	const element = document.getElementById(activeItem.value?.toString() || "")
	if (element && scrollContent.value) {
		element.scrollIntoView({ block: "nearest" })
	}
}

// const showSearchedGene
const genesArray = ref([])
const fetchData = () => {

	axios.get('/autocompletebiosample', {
		params: { query: search.value }
	})
		.then(response => {
			console.log(response)
		    genesArray.value = response.data;
			filteredGroups.value = [
				{
					names: 'biosamples',
					items: genesArray.value.map((gene, index) => ({
						key: index + 1,
						title: "Search",
						label: gene,
						action() {
							// search.value = gene
							emit('submitGene', gene)
							// Define the action logic here
							// console.log(`Action for ${gene}`);
							// router.push({ path: `/gene/${gene}` });
							// fetchGeneExpressionData(`${gene}`)
							// fetchGeneCompartment(`${gene}`)
						}
					}))
				}
			];
			if(filteredGroups.value[0].items.length>0){
				openBox()
			} 
			console.log(filteredGroups.value)
		})
		.catch(error => {
			console.error('There was an error!', error);
		});
}




onMounted(() => {
	const isWindows = getOS() === "Windows"
	commandIcon.value = isWindows ? "CTRL" : "⌘"

	const keys = useMagicKeys()
	const ActiveCMD = isWindows ? keys["ctrl+k"] : keys["cmd+k"]
	const Enter = keys["enter"]

	useSearchDialog().trigger(openBox)

	whenever(ActiveCMD, () => {
		openBox()
	})

	whenever(Enter, () => {
		if (showSearchBox.value) {
			performAction()
		}
	})
})
</script>

<style lang="scss" scoped>
.search-box-modal {
	.search-box {
		border-radius: 4px;

		.search-input {
			height: 36px;
			gap: 10px;
			padding: 12px;

			input {
				background: transparent;
				outline: none;
				border: none;
				min-width: 100px;
			}

			.n-text--code {
				white-space: nowrap;
			}
		}

		.n-divider {
			margin-top: 0;
			margin-bottom: 0;
		}

		.conten-wrap {
			padding-bottom: 30px;

			.group-empty {
				text-align: center;
				padding: 30px 0 40px 0;
			}

			.group {
				padding: 0 10px;

				.group-title {
					opacity: 0.6;
					margin-bottom: 5px;
					padding: 5px 10px;
					padding-top: 20px;
				}

				.group-list {
					.item {
						padding: 7px 10px;
						gap: 10px;
						cursor: pointer;
						border-radius: 10px;
						width: 100%;
						text-align: left;

						.icon {
							width: 28px;
							height: 28px;
							border-radius: 50%;
							background-color: var(--primary-005-color);
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.title {
							font-weight: bold;
						}

						.label {
							opacity: 0.8;
							font-size: 0.9em;
						}

						&.active {
							background-color: var(--hover-005-color);
						}

						&:hover {
							box-shadow: 0px 0px 0px 1px var(--primary-color) inset;
						}
					}
				}
			}
		}

		.hint-bar {
			font-size: 12px;
			gap: 20px;
			padding: 10px 0;

			.icon {
				background-color: var(--code-color);
				width: 18px;
				height: 18px;
				padding-top: 1px;
				text-align: center;
				border-radius: 4px;
				margin-right: 5px;
				display: flex;
				align-items: center;
				justify-content: center;
			}

			.label {
				opacity: 0.7;
			}
		}
	}
}</style>
