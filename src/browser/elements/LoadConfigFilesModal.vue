<template>
    <div v-show="props.show" :class="{ 'bg-gray-300 bg-opacity-50': show }" aria-hidden="true"
        class="fixed inset-0 z-50 flex items-center justify-center h-screen" tabindex="-1">
        <div class="relative w-full max-w-6xl max-h-full">
            <!-- Modal content -->
            <div class="relative bg-white rounded-lg shadow">
                <!-- Modal header -->
                <div class="flex items-start justify-between p-4 border-b rounded-t ">
                    <div v-if="step === 1">
                        <h3 class="text-xl font-semibold text-gray-900">
                            Upload a config file OR paste config into the textarea
                        </h3>

                    </div>
                    <div v-else-if="step === 2 ">
                        <h3 class="text-xl font-semibold text-gray-900">Tracks to be uploaded:</h3>
                    </div>
                    <!-- <div v-else-if="step === 2 && uploadType === 'emptyBrowser'">
                        <h3 class="text-xl font-semibold text-gray-900">Please choose an assembly</h3>
                    </div>
                    <button
                        class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        data-modal-hide="staticModal" type="button" @click="closeModal">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path clip-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                fill-rule="evenodd"></path>
                        </svg>
                    </button> -->
                </div>

                <!-- Modal body -->
                <div class="p-6 h-[26rem]">
                    <!-- <div v-for="index in tabs.length" :key="index"> -->
                    <div v-if="step === 1" class="flex">
                        <!-- <slot name="modalContent"> -->
                        <!-- <button @click="ChooseJsonFile" data-modal-hide="staticModal" type="button"
            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10">JSON
            file</button> -->
                        <div class="flex items-center justify-center w-full">
                            <label ref="dropLabel"
                                class="flex flex-col items-center justify-center w-full h-96 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400"
                                for="dropzone-file">
                                <div class="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor"
                                        stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <p class="mb-2 text-lg	 text-gray-500"><span class="font-semibold">Click
                                            to upload</span> or drag and drop</p>
                                    <p class="text-base	 text-gray-500">a JSON config file
                                    </p>
                                </div>
                                <input id="dropzone-file" ref="fileInput" class="hidden" type="file"
                                    @change="ChooseJsonFile" />
                            </label>

                        </div>
                        <div class="mx-4 w-px  bg-gray-300"></div>
                        <div class="flex flex-col items-center justify-center w-full" >
                            <div
                                class="relative empty-browser flex flex-col items-center justify-center w-full h-96 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-400">
                                <!-- <div class="flex flex-col items-center justify-center p-6">
                                    <svg class="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor"
                                        stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M6 20.25h12m-7.5-3v3m3-3v3m-10.125-3h17.25c.621 0 1.125-.504 1.125-1.125V4.875c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125z"
                                            stroke-linecap="round" stroke-linejoin="round" />
                                    </svg>
                                    <p class="mb-2 text-lg	 text-gray-500"><span class="font-semibold">Start with an
                                            empty
                                            session</span></p>
                                    <p class="text-base	 text-gray-500"> and upload tracks later
                                    </p>
                                </div> -->
                                <textarea v-model="pasteConfig"  class="resize-none block p-2.5 h-full w-full text-sm text-gray-900 bg-gray-50 rounded-lg  focus:ring-blue-500  dark:bg-gray-700  dark:placeholder-gray-400 border-0 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Paste your configs here..."></textarea>
                                
                                <button type="submit" @click="submitPasteConfig" class="absolute right-4 bottom-4 inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100 dark:text-blue-500 dark:hover:bg-gray-600">
            <svg class="w-7 h-7 rotate-90 rtl:-rotate-90" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z"/>
            </svg>

        </button>
                                <!-- <input id="dropzone-file" type="file" class="hidden" /> -->
                            </div>
                            <div class="flex">
                                <a href="#" ref="loadFileExample1" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Paste config example 1</a>
                            <a href="#" ref="loadFileExample2" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Paste config example 2</a>
                            </div>


                        </div>
                        <!-- </slot> -->
                    </div>
                    <div v-else-if="step === 2 ">
                        <!-- <div id="json-modal" :style="{ display: modalDisplay }"> -->
                        <div class="modal-content">
                            <n-data-table v-if="showTable" :columns="columns" :data="jsonData" :pagination="paginationRef"></n-data-table>

                            <div v-if="showError" class="error">{{ errorMessage }}</div>
                        </div>
                        <!-- </div> -->
                    </div>

                </div>
                <!-- Modal footer -->
                <div class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
                    <div v-if="step === 2">
                        <button
                            class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                            type="button" @click="step--">
                            Back
                        </button>
                        <button
                            class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                            type="button" @click="UploadJsonFileAndCloseModal">
                            Upload
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, ref, watch, computed, onMounted } from 'vue'
import { NDataTable } from 'naive-ui'
import { useSessionStore } from '../store/SessionStore/SessionStore'
// import CurvTrack from './tracks/index.vue'
import { useLayoutStore } from '../store/LayoutStore/LayoutStore'
import { v4 as uuid } from 'uuid'
import { useTrackStore } from '../store/TrackStore/TrackStore'
import { useTrackManager } from '@/browser_new/utils/addTrack'

const {AddTracksToSession} = useTrackManager('default-genome-browser-view')

const paginationRef = computed(() => ({
      pageSize: 6
    }))

const props = defineProps({
    show: Boolean,
})
const emit = defineEmits(['closeModal'])
const show = ref(props.show)


const closeModal = () => {
    step.value = 1
    modalDisplay.value = "none"
    jsonData.value = null
    showTable.value = false
    showError.value = false
    errorMessage.value = ''
    emit('closeModal')
}


const UploadJsonFileAndCloseModal = () => {
    AddTracksToSession(jsonData.value)
    closeModal()
}

// const emit = defineEmits(['close'])
// const props = defineProps({
//     show: Boolean
// })
const LayoutStore = useLayoutStore()

const toggleSessionInitModal = () => {
    // props.show.value = false
    showTable.value = false
    // LayoutStore.toggleSessionInitModal()
    step.value = 1
}

const step = ref(1)
const uploadType = ref('uploadFile')

const tabs = reactive([
    {
        step: 1,
        slotModalHeader: 'Choose a method to initialize your session'
    },
    {
        step: 2,
        uploadType: 'uploadFile',
        slotModalHeader: 'Validate your data'
    },
    {
        step: 2,
        uploadType: 'emptyBrowser',
        slotModalHeader: 'Choose your genome assembly'
    }
])

watch(props, newValue => {
    show.value = newValue.show
    console.log(show.value)
})


const fileInput = ref(null)
const ChooseJsonFile = (event) => {
    // const input = document.createElement("input");
    // input.type = "file";
    // input.accept = ".json";
    // input.addEventListener("change", (event) => {
    const file = event.target.files[0];
    validateJsonFile(file);
    // });
    fileInput.value.click();
}

const jsonData = ref(null)
const showError = ref(false)
const errorMessage = ref('')
const showTable = ref(false)
const modalDisplay = ref('')


const pasteConfig = ref('')
const submitPasteConfig = () => {

    try {
            let data = JSON.parse(pasteConfig.value)
            // perform validations on jsonData
            // if (validateUrls(data.tracks) && validateFields(data.tracks)) {
                console.log(data)
                if(validateFields(data)){
                jsonData.value = data
                console.log('validated: ', jsonData.value)

                // showJsonTable(jsonData);
                showTable.value = true
                modalDisplay.value = "block"
            } else {
                showError.value = true
                errorMessage.value = 'Invalid JSON file'
            }
        } catch (error) {
            // report error message and stop validation
            showError.value = true
            errorMessage.value = "Invalid JSON syntax: " + error.message
            // console.error("Invalid JSON syntax:", error.message);
        }
        step.value = 2
        pasteConfig.value = ''
}

const validateJsonFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            // perform validations on jsonData
            // if (validateUrls(data.tracks) && validateFields(data.tracks)) {
                console.log(data)
                if(validateFields(data)){
                jsonData.value = data
                console.log('validated: ', jsonData.value)

                // showJsonTable(jsonData);
                showTable.value = true
                modalDisplay.value = "block"
            } else {
                showError.value = true
                errorMessage.value = 'Invalid JSON file'
            }
        } catch (error) {
            // report error message and stop validation
            showError.value = true
            errorMessage.value = "Invalid JSON syntax: " + error.message
            // console.error("Invalid JSON syntax:", error.message);
        }
    };
    reader.readAsText(file);
    step.value = 2
    uploadType.value = 'uploadFile'
}

// const validateUrls = (jsonData) => {
//     for (const file of jsonData) {
//         if (!file.url) {
//             console.error("URL is a required field:", file);
//             return false;
//         } else {
//             fetch(file.url)
//                 .then((response) => {
//                     if (!response.ok) {
//                         console.error("Invalid URL:", file.url);
//                         return false;
//                     }
//                 })
//                 .catch((error) => {
//                     console.error("Error fetching URL:", error);
//                     return false;
//                 });
//         }
//     }
//     return true;
// }

const validateFields = (jsonData) => {
    console.log('jsonData', jsonData)
    const nameMap = new Map();
    for (let i = 0; i < jsonData.length; i++) {
        const file = jsonData[i];
        if (!file.type) {
            console.error("Type is a required field:", file);
            return false;
        } else if (![ "CurvTrack",  'SclsTrack', "VirtualCTrack","CovTrack", "PclsTrack", "InterChromCurvTrack", "GeneTrack", 'HicTrack', 'LineGTrack', 'HeatmapGTrack','NetworkTrack','DomainTrack', 'HicSquareTrack'].includes(file.type)) {
            console.error("Invalid type:", file.type);
            return false;
        }
        if (!file.label) {
            file.label = file.name || "";
        }
        if (!file.name) {
            const fileName = file.url.split("/").pop();
            file.name = fileName.substring(0, Math.min(fileName.length, 30));
        }
        if (nameMap.has(file.name)) {
            let suffix = 2;
            while (nameMap.has(file.name + "_" + suffix)) {
                suffix++;
            }
            file.name = file.name + "_" + suffix;
        }
        nameMap.set(file.name, i);
    }
    return true;
}

// const showJsonTable = (jsonData) => {
//     const table = document.createElement("table");
//     const headerRow = document.createElement("tr");
//     const headers = ["Name", "Type", "Label", "URL"];
//     for (const header of headers) {
//         const th = document.createElement("th");
//         th.innerText = header;
//         headerRow.appendChild(th);
//     }
//     table.appendChild(headerRow);
//     for (const file of jsonData) {
//         const row = document.createElement("tr");
//         const data = [file.name, file.type, file.label, file.url];
//         for (const datum of data) {
//             const td = document.createElement("td");
//             td.innerText = datum;
//             row.appendChild(td);
//         }
//         table.appendChild(row);
//     }
//     // display table in modal
// }

// const hideModal = () => {
//     modalDisplay.value = "none"
//     jsonData.value = null
//     showTable.value = false
//     showError.value = false
//     errorMessage.value = ''
// }

const createColumns = () => {
    return [
        {
            title: "Name",
            key: "name"
        },
        {
            title: "Id",
            key: "id"
        },
        {
            title: "Type",
            key: "type"
        },
        {
            title: "URL",
            key: "url"
        }
    ];
};

const columns = createColumns();


const handleEmptySession = () => {
    step.value = 2
    uploadType.value = 'emptyBrowser'
}
 const dropLabel = ref(null)
import configFileExample1 from '@/data/configFileExample1.json'

// Function to fetch and copy JSON content
// const copyJSONToTextarea = ()=> {
//     // Fetch the JSON file content
//     fetch('../../../data/configFileExample1.json')
//         .then(response => {
//             // Check if the fetch was successful
//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             // Convert JSON object to JSON string with indentation
//             const jsonString = JSON.stringify(data, null, 2);
            
//             // Get the textarea element
//             // const textarea = pasteConfig
            
//             // Set the text of the textarea to the JSON string
//             pasteConfig.value= jsonString;
            
//             // Optional: Select the text of the textarea
//             textarea.select();
//         })
//         .catch(error => {
//             console.error('There was a problem with the fetch operation:', error);
//         });
// }

const loadFileExample1 = ref(null)

onMounted(() => {

    // Add click event listener to the link
    loadFileExample1.value.addEventListener('click', function(event) {
        // Prevent the default link behavior
        event.preventDefault();
        
        // Call the function to copy JSON to the textarea
        // copyJSONToTextarea();
        const jsonString = JSON.stringify(configFileExample1, null, 2);
            
            // Get the textarea element
            // const textarea = pasteConfig
            
            // Set the text of the textarea to the JSON string
            pasteConfig.value= jsonString;
            
            // Optional: Select the text of the textarea
            // textarea.select();
    });


  function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // fileInput.value.files = e.dataTransfer.files;
        const file = e.dataTransfer.files[0]
    validateJsonFile(file);
    // });
    // fileInput.value.click();
    //   ChooseJsonFile(e); // Assuming ChooseJsonFile is a function you've defined to handle the file
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    dropLabel.value.classList.add('bg-gray-100', 'border-blue-400');
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    dropLabel.value.classList.remove('bg-gray-100', 'border-blue-400');
  }

  // Add event listeners for drag & drop events
  dropLabel.value.addEventListener('dragover', handleDragOver);
  dropLabel.value.addEventListener('dragleave', handleDragLeave);
  dropLabel.value.addEventListener('drop', handleDrop);

  // Optional: Add event listeners for click events if you want to reset styles or do something when the user clicks the label
  dropLabel.value.addEventListener('click', function () {
    dropLabel.value.classList.remove('bg-gray-100', 'border-blue-400');
  });
})

</script>
<style scoped>
  #message::placeholder {
    font-size: 30px; /* Example size for placeholder text */
    /* Additional styles for placeholder text */
  }

  #message {
    /* Adjust padding to move the placeholder text */
    padding-top: 1rem; 
    padding-right: 1rem;
    padding-bottom: 1rem;
    padding-left: 1rem;

    /* Other styles for the textarea */
  }
</style>@/browser2/utils/addTrack