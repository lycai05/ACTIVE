<template>
    <!-- <div style="height:600px">
        <h1>cytoscape-cose-bilkent demo (compound)</h1>
        <button id="randomize" type="button">Randomize</button>
        <button id="layoutButton" type="button">CoSE-Bilkent</button>
        <div id="cy"></div>
        <n-alert title="可以没有边框" type="info" :bordered="true">
      {{ selectedInfo }}
    </n-alert>
    </div> -->
    <div v-if="isVisible">

    <div ref="canvasContainer"  :style="props.style" >
        <!-- <n-spin v-show="showSpin" class="absolute left-1/2 top-1/2"></n-spin> -->
        <div id="cy"></div>
            <div v-if="selectedInfo">
                <n-alert title="" type="default" :bordered="true">

                {{ selectedInfo }}
            </n-alert>

            </div>
      
    </div>
</div>
<div v-else>

<div ref="canvasContainer" class="basic-canvas">
    <n-alert title="" type="warning">
    Too many items. Zoom in to see features
</n-alert>
</div>
</div>
</template>
  
<script setup lang="ts">
// You might need to adjust these imports depending on your build setup
import cytoscape from 'cytoscape';
import coseBilkent from 'cytoscape-cose-bilkent';
import { onMounted, watch, ref, computed } from 'vue'
import { TabixIndexedFile } from '@gmod/tabix'
import { RemoteFile } from 'generic-filehandle'
import { useMessage } from 'naive-ui'
const message = useMessage()

const props = defineProps({
    location: {
        type: Object,
        required: true
    },
    option: {
        type: Object,
        required: true
    },
    style: {
        type: Object,
        required: true
    },
    dataLoaded: {
        type: Boolean,
        required: false
    }
})

const chrom = computed(
    () => props.location.chrom
)

const start = computed(
    () => props.location.start
)

const end = computed(
    () => props.location.end
)
const option = computed(() => {
    return props.option
})
// const trackId = ref(props.trackId)
const isVisible = ref(false)
const selectedInfo = ref('')
let visibilityWidth = 1000000

const showSpin = ref(false)
cytoscape.use(coseBilkent);
const url = props.option.url

const file = new TabixIndexedFile({
    filehandle: new RemoteFile(url),
    tbiFilehandle: new RemoteFile(url + '.tbi')
})
const canvasReady = ref(false)


onMounted(() => {
    const cy = cytoscape({
        container: document.getElementById('cy'),

        ready: function () {
            this.nodes().forEach(function (node) {
                let width = [30, 70, 110];
                let size = width[Math.floor(Math.random() * 3)];
                node.css("width", size);
                node.css("height", size);
            });
            this.layout({ name: 'cose-bilkent' }).run();
        },

        style: [
            {
                selector: 'node',
                style: {
                    'background-color': option.value.series[0].nodeStyle.fill || "black"
                }
            },

            {
                selector: ':parent',
                style: {
                    'background-opacity': 0.333
                }
            },

            {
                selector: 'edge',
                style: {
                    'width': option.value.series[0].edgeStyle.width || 3,
                    'line-color': option.value.series[0].edgeStyle.fill || "black"
                }
            }
        ],

        elements: [
        ]
    });

    cy.on('click', 'node', function(evt){
      console.log( 'clicked ' + evt.target.id() );
      selectedInfo.value = `Selected interaction anchor ${evt.target.id()}`

});

cy.on('click', 'edge', function(event){
    // console.log( 'clicked ' +evt.target.source() + ' --- ' + evt.target.target() );
    console.log(event.target.connectedNodes())
    // selectedInfo.value 
    const connectedNodes= event.target.connectedNodes();
    const connectedAnchor1 = connectedNodes[0]
    const connectedAnchor2 = connectedNodes[1]
    console.log(connectedAnchor1.id())
    selectedInfo.value = `Selected interaction between ${connectedAnchor1.id()} and ${connectedAnchor2.id()}` 

});





    watch([() => option.value.series, () => chrom.value, () => start.value, () => end.value], async (newStart, newEnd) => {
        selectedInfo.value = null
        if (end.value - start.value < visibilityWidth) {
            showSpin.value = true
            // colors = option.value.series[0].itemStyle.color || "black"
            // lineColor = option.value.series[0].lineStyle.color || "black"
            // isVisible.value = true
            // canvasReady.value = false
            // console.log("start or end value changes, drawPlotX")
            let lines = []
            let edgeIdCounter = 0;

            await file.getLines(chrom.value, start.value, end.value, function (line, fileOffset) {
                const splitData = line.split(/;/)
                const arr = splitData[0].split(/[\s,:-]+/)
                const chrom = arr[0]
                const start = Number(arr[1])
                const end = Number(arr[2])
                const chrom2 = arr[3]
                const start2 = Number(arr[4])
                const end2 = Number(arr[5])

                let anchor1
                let anchor2
                if (splitData.length === 1) {
                     anchor1 = `${chrom}:${start}-${end}`;
                     anchor2 = `${chrom2}:${start2}-${end2}`;
                } else if (splitData.length === 2) {
                    if (splitData[1].split('|')) {
                        const anchor = splitData[1].split('|')
                    // Check and assign anchor1 and anchor2 based on conditions
                     anchor1 = (anchor[0] === '.' || anchor[0] === 'N' || anchor[0].trim() === '') ? `${chrom}:${start}-${end}` : anchor[0];
                     anchor2 = (anchor[1] === '.' || anchor[1] === 'N' || anchor[1].trim() === '') ? `${chrom2}:${start2}-${end2}` : anchor[1];

                    } else {
                        message.error(`Delimiter '|' not found in the second part of the line: "${line}"`)
                    }
                }

                // Check if anchors already exist
                let anchor1Exists = lines.some(item => item.data.id === anchor1);
                let anchor2Exists = lines.some(item => item.data.id === anchor2);

                // If they don't exist, add them as nodes
                if (!anchor1Exists) {
                    lines.push({ group: 'nodes', data: { id: anchor1 } });
                }
                if (!anchor2Exists) {
                    lines.push({ group: 'nodes', data: { id: anchor2 } });
                }
                // lines.push(addedData)
                // Create an edge between anchor1 and anchor2
                let edgeId = `e${edgeIdCounter++}`;
                lines.push({ group: 'edges', data: { id: edgeId, source: anchor1, target: anchor2 } });
            })
            // console.log(lines)
            cy.elements().remove(); cy.add(lines);
            cy.style().selector('node').style({'background-color': option.value.series[0].nodeStyle.fill})
            cy.style().selector('edge').style({'width': option.value.series[0].edgeStyle.width})
            console.log(option.value.series[0].edgeStyle.fill)
            cy.style().selector('edge').style({'line-color': option.value.series[0].edgeStyle.fill})
            
            const layout = cy.layout({
                name: 'cose-bilkent',
                // animate: 'end',
                // animationEasing: 'ease-out',
                // animationDuration: 1000,
                randomize: true
            });

            layout.run();
            showSpin.value = false;
            isVisible.value = true

        } else {
            isVisible.value = false
            canvasReady.value = true
        }


    }, { immediate: true, deep: true });

})

</script>
  
<style scoped>
#cy {
    width: 100%;
    height: 90%;
    z-index: 999;
}

h1 {
    opacity: 0.5;
    font-size: 1em;
}

button {
    margin-right: 10px;
}
</style>