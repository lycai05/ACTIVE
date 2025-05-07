<template>
	<div class="page">
		<div class="toolbar flex items-center mb-6 gap-4">
			<n-button type="primary" size="large" @click="newNote()">
				<template #icon>
					<Icon :name="AddIcon" />
				</template>
				Add notes
			</n-button>

			<n-select
				v-model:value="selectedLabels"
				multiple
				:options="options"
				size="large"
				placeholder="Labels filter..."
			/>
		</div>
		<div class="list">
			<n-image-group>
				<div class="masonry">
					<div v-for="note of filteredNotes" :key="note.id" class="note" @click="navigateTo(note.route)">
						<div v-if="note.image" class="n-image">
							<n-image :src="note.image" width="400" height="300" alt="image" lazy />
						</div>
						<div class="n-content">
							<div class="n-title">{{ note.title }}</div>
							<div class="n-body" v-html="note.body" />
						</div>
						<div class="n-footer flex justify-between items-end gap-3">
							<div class="n-labels flex flex-wrap justify-end gap-2">
								<span
									v-for="label of note.labels"
									:key="label.id"
									class="n-label custom-label"
									:style="`--label-color:${labelsColors[label.id]}`"
								>
									{{ label.title }}
								</span>
							</div>
						</div>
					</div>
				</div>
			</n-image-group>
		</div>

		<n-modal v-model:show="showModal">
			<div class="note-modal">
				<div v-if="selectedNote" class="form flex flex-col">
					<div v-if="selectedNote.id && selectedNote.image" class="mb-4">
						<img :src="selectedNote.image" />
					</div>
					<n-upload v-else class="mb-2" :max="1">
						<n-upload-dragger>
							<div class="mb-3">
								<Icon :name="ImageIcon" :size="48" :depth="3" />
							</div>
							<n-text>Click or drag a file to this area to upload</n-text>
							<n-p depth="3">
								Strictly prohibit from uploading sensitive information. For example, your bank card PIN
								or your credit card expiry date.
							</n-p>
						</n-upload-dragger>
					</n-upload>
					<n-input v-model:value="selectedNote.title" placeholder="Title" class="mb-4" />
					<n-input
						v-model:value="selectedNote.body"
						placeholder="Body"
						type="textarea"
						class="mb-4"
						:autosize="{
							minRows: 2,
							maxRows: 7
						}"
					/>
					<div class="flex item-center justify-between gap-4">
						<div class="flex item-center gap-4 grow">
							<div v-if="selectedNote.id" class="flex flex-wrap items-center gap-2">
								<span
									v-for="label of selectedNote.labels"
									:key="label.id"
									class="custom-label"
									:style="`--label-color:${labelsColors[label.id]}`"
								>
									{{ label.title }}
								</span>
							</div>
							<div v-else class="w-full">
								<n-select multiple class="w-full" :options="options" placeholder="Labels filter..." />
							</div>
						</div>
						<div class="flex item-center gap-4">
							<n-button v-if="selectedNote.id">Delete</n-button>
							<n-button
								strong
								secondary
								type="primary"
								:disabled="!noteValid"
								@click="save(selectedNote)"
							>
								Save
							</n-button>
						</div>
					</div>
				</div>
			</div>
		</n-modal>
	</div>
</template>

<script lang="ts" setup>
import { NButton, NImage, NImageGroup, NSelect, NModal, NInput, NUpload, NUploadDragger, NText, NP } from "naive-ui"
import Icon from "@/components/common/Icon.vue"
import { type Ref, ref, computed } from "vue"
import _clone from "lodash/cloneDeep"
import dayjs from "@/utils/dayjs"
import { useThemeStore } from "@/stores/theme"
import { useRouter } from "vue-router"

// Define types and mock data
type LabelId = 'cardiac' | 'oncology' | 'neurology' | 'research'

interface Label {
	id: LabelId
	title: string
}

interface Note {
	id: string
	title: string
	body: string
	image: string
	labels: Label[]
	route: string
}

const labels: Label[] = [
	{ id: 'cardiac', title: 'Cardiac' },
	{ id: 'oncology', title: 'Oncology' },
	{ id: 'neurology', title: 'Neurology' },
	{ id: 'research', title: 'Research' }
]

const notes: Ref<Note[]> = ref([
	{
		id: '1',
		title: 'Dilated Cardiomyopathy (DCM)',
		body: 'Dilated cardiomyopathy is a condition characterized by the enlargement and weakening of the heart\'s main pumping chamber. Common symptoms include shortness of breath, fatigue, and swelling.',
		image: '/images/dcm.jpg',
		labels: [labels[0], labels[3]],
		route: '/gallery/dcm'
	},
	{
		id: '2',
		title: 'Pancreatic Ductal Adenocarcinoma (PDAC)',
		body: 'Pancreatic ductal adenocarcinoma is the most common type of pancreatic cancer, known for its aggressive nature and poor prognosis. Early diagnosis is challenging and treatment options are limited.',
		image: '/images/pdac.jpg',
		labels: [labels[1], labels[3]],
		route: '/gallery/pdac'
	},
	{
		id: '3',
		title: 'Alzheimer\'s Disease (AD)',
		body: 'Alzheimer\'s disease is a progressive neurodegenerative disorder characterized by memory loss and cognitive decline. It is the most common cause of dementia in older adults.',
		image: '/images/ad.jpg',
		labels: [labels[2], labels[3]],
		route: '/gallery/ad'
	}
])

const AddIcon = "fluent:notebook-add-24-regular"
const ImageIcon = "carbon:image"

const options = labels.map(l => ({
	label: l.title,
	value: l.id
}))

const themeStore = useThemeStore()
const router = useRouter()

const secondaryColors = computed(() => themeStore.secondaryColors)

const selectedLabels = ref<LabelId[]>([])
const selectedNote = ref<Note | null>(null)
const filteredNotes = computed(() =>
	notes.value.filter(n => {
		if (!selectedLabels.value.length) {
			return true
		}
		return n.labels.some(label => selectedLabels.value.includes(label.id))
	})
)
const noteValid = computed(() => !!selectedNote.value?.title || !!selectedNote.value?.body)

const showModal = computed({ get: () => selectedNote.value !== null, set: () => (selectedNote.value = null) })

const labelsColors: Record<LabelId, string> = {
	cardiac: '#FF6B6B',
	oncology: '#4ECDC4',
	neurology: '#45B7D1',
	research: '#96CEB4'
}

function newNote() {
	selectedNote.value = {
		id: "",
		title: "",
		body: "",
		image: "",
		labels: [],
		route: ""
	}
}
function selectNote(note: Note) {
	selectedNote.value = { ..._clone(note), body: note.body.replace(/<br\/>/gim, "\n") }
}
function save(note: Note) {
	const index = notes.value.findIndex(n => n.id === note.id)
	note.body = note.body.replace(/\n/gim, "<br/>")

	if (index !== -1) {
		notes.value[index] = note
	} else {
		note.id = new Date().getTime() + ""
		notes.value = [note, ...notes.value]
	}

	selectedNote.value = null
}
function navigateTo(route: string) {
	router.push(route)
}
</script>

<style lang="scss" scoped>
.page {
	padding: 1rem;
	
	.toolbar {
		max-width: 600px;
		margin-bottom: 1rem;

		.n-select {
			:deep(.n-base-selection__border) {
				border-color: var(--divider-020-color);
			}
			:deep(.n-base-selection-tags) {
				background-color: var(--bg-secondary-color);
			}
		}
	}
	.list {
		container-type: inline-size;

		.masonry {
			--notes-gap: 1.5rem;
			display: grid;
			grid-template-columns: repeat(3, 1fr);
			gap: var(--notes-gap);

			@container (max-width: 1200px) {
				grid-template-columns: repeat(2, 1fr);
			}

			@container (max-width: 600px) {
				grid-template-columns: 1fr;
			}

			.note {
				margin-bottom: var(--notes-gap);
				transition: all 0.25s;
				box-sizing: border-box;
				width: 100%;
				background-color: var(--bg-color);
				border-radius: var(--border-radius);
				border: 1px solid var(--border-color);
				overflow: hidden;
				cursor: pointer;

				.n-content {
					padding: 1.25rem;

					.n-title {
						font-size: 18px;
						line-height: 1.3;
						font-weight: bold;
						margin-bottom: 0.75rem;
						font-family: var(--font-family-display);
					}

					.n-body {
						font-size: 14px;
						color: var(--fg-secondary-color);
					}
				}

				.n-footer {
					padding: 1.25rem;
					font-size: 14px;

					.n-labels {
						.n-label {
							font-size: 14px;
							padding: 4px 8px;
						}
					}
				}

				&:hover {
					transform: translateY(-3px);
					box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
				}
			}
		}
	}

	.custom-label::before {
		z-index: 0;
	}
}
</style>
<style lang="scss">
.note-modal {
	background-color: var(--bg-body);
	border-radius: var(--border-radius);
	width: 90vw;
	max-width: 500px;

	.form {
		background-color: var(--bg-color);
		padding: 20px;

		img {
			border-radius: var(--border-radius-small);
		}
	}

	.custom-label::before {
		z-index: 0;
	}
}
</style>
