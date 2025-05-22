<script>
// Importing track components and their configuration components
import CurvTrack from '../tracks/CurvTrack/CurvTrack.vue'
import CurvTrackConfig from '../tracks/CurvTrack/config.vue'
import PclsTrack from '../tracks/PclsTrack/PclsTrack.vue'
import PclsTrackConfig from '../tracks/PclsTrack/config.vue'
import GeneTrack from '../tracks/GeneTrack/GeneTrack.vue'
import GeneTrackConfig from '../tracks/GeneTrack/config.vue'
import HicTrack from '../tracks/HicTrack/HicTrack.vue'
import HicTrackConfig from '../tracks/HicTrack/config.vue'
import MrhicTrack from '../tracks/MrhicTrack/MrhicTrack.vue'
import MrhicTrackConfig from '../tracks/MrhicTrack/config.vue'
// import HicSquareTrack from '../tracks/HicSquareTrack/HicSquareTrack.vue'
// import HicSquareTrackConfig from '../tracks/HicSquareTrack/config.vue'
// import InterChromCurvTrack from '../tracks/InterChromCurvTrack/InterChromCurvTrack.vue'
// import InterChromCurvTrackConfig from '../tracks/InterChromCurvTrack/config.vue'
import SclsTrack from '../tracks/SclsTrack/SclsTrack.vue'
import SclsTrackConfig from '../tracks/SclsTrack/config.vue'
// import VirtualCTrack from '../tracks/VirtualCTrack/VirtualCTrack.vue'
// import VirtualCTrackConfig from '../tracks/VirtualCTrack/config.vue'
// import VirtualCTrackController from '../tracks/VirtualCTrack/controller.vue'
// import LineGTrack from '../tracks/LineGTrack/LineGTrack.vue'
// import LineGTrackConfig from '../tracks/LineGTrack/config.vue'
// import HeatmapGTrack from '../tracks/HeatmapGTrack/HeatmapGTrack.vue'
// import HeatmapGTrackConfig from '../tracks/HeatmapGTrack/config.vue'
// import SeqTrack from '../tracks/SeqTrack/SeqTrack.vue'
// import SeqTrackConfig from '../tracks/SeqTrack/config.vue'
// import NetworkTrack from '../tracks/NetworkTrack/NetworkTrack.vue'
// import NetworkTrackConfig from '../tracks/NetworkTrack/config.vue'
import MclsTrack from '../tracks/MclsTrack/MclsTrack.vue'
import MclsTrackConfig from '../tracks/MclsTrack/config.vue'
// import DomainTrack from '../tracks/DomainTrack/DomainTrack.vue'
// import DomainTrackConfig from '../tracks/DomainTrack/config.vue'
// import SnpTrack from '../tracks/SnpTrack/SnpTrack.vue'
// import SnpTrackConfig from '../tracks/SnpTrack/config.vue'
// import DotTrack from '../tracks/DotTrack/DotTrack.vue'
// import DotTrackConfig from '../tracks/DotTrack/config.vue'
// import StripeTrack from '../tracks/StripeTrack/StripeTrack.vue'
// import StripeTrackConfig from '../tracks/StripeTrack/config.vue'
// import CnvTrack from '../tracks/CnvTrack/CnvTrack.vue'
// import CnvTrackConfig from '../tracks/CnvTrack/config.vue'
import CompTrack from '../tracks/CompTrack/CompTrack.vue'
import CompTrackConfig from '../tracks/CompTrack/config.vue'
import ChromTrack from '../tracks/ChromTrack/ChromTrack.vue'
import ChromTrackConfig from '../tracks/ChromTrack/config.vue'
// import MetaDomainTrack from '../tracks/MetaDomainTrack/MetaDomainTrack.vue'
// import MetaDomainTrackConfig from '../tracks/MetaDomainTrack/config.vue'
// import MetaCompartmentTrack from '../tracks/MetaCompartmentTrack/MetaCompartmentTrack.vue'
// import MetaCompartmentTrackConfig from '../tracks/MetaCompartmentTrack/config.vue'
export default {
	props: {
		componentKey: String,
		props: Object
	},
	computed: {
		currentComponent() {
			switch (this.componentKey) {
				case 'CurvTrack':
					return CurvTrack
				case 'CurvTrackConfig':
					return CurvTrackConfig
				case 'PclsTrack':
					return PclsTrack
				case 'PclsTrackConfig':
					return PclsTrackConfig
				case 'GeneTrack':
					return GeneTrack
				case 'GeneTrackConfig':
					return GeneTrackConfig
				case 'HicTrack':
					return HicTrack
				case 'HicTrackConfig':
					return HicTrackConfig
				case 'MrhicTrack':
					return MrhicTrack
				case 'MrhicTrackConfig':
					return MrhicTrackConfig
				// case 'HicSquareTrack': return HicSquareTrack;
				// case 'HicSquareTrackConfig': return HicSquareTrackConfig;
				// case 'InterChromCurvTrack': return InterChromCurvTrack;
				// case 'InterChromCurvTrackConfig': return InterChromCurvTrackConfig;
				case 'SclsTrack':
					return SclsTrack
				case 'SclsTrackConfig':
					return SclsTrackConfig
				// case 'VirtualCTrack': return VirtualCTrack;
				// case 'VirtualCTrackConfig': return VirtualCTrackConfig;
				// case 'VirtualCTrackController': return VirtualCTrackController;
				// case 'LineGTrack': return LineGTrack;
				// case 'LineGTrackConfig': return LineGTrackConfig;
				// case 'HeatmapGTrack': return HeatmapGTrack;
				// case 'HeatmapGTrackConfig': return HeatmapGTrackConfig;
				// case 'SeqTrack': return SeqTrack;
				// case 'SeqTrackConfig': return SeqTrackConfig;
				// case 'NetworkTrack': return NetworkTrack;
				// case 'NetworkTrackConfig': return NetworkTrackConfig;
				case 'MclsTrack':
					return MclsTrack
				case 'MclsTrackConfig':
					return MclsTrackConfig
				// case 'DomainTrack': return DomainTrack;
				// case 'DomainTrackConfig': return DomainTrackConfig;
				case 'ChromTrack':
					return ChromTrack
				case 'ChromTrackConfig':
					return ChromTrackConfig
				// case 'SnpTrack': return SnpTrack;
				// case 'SnpTrackConfig': return SnpTrackConfig;
				// case 'DotTrack': return DotTrack;
				// case 'DotTrackConfig': return DotTrackConfig;
				// case 'StripeTrack': return StripeTrack;
				// case 'StripeTrackConfig': return StripeTrackConfig;
				// case 'CnvTrack': return CnvTrack;
				// case 'CnvTrackConfig': return CnvTrackConfig;
				case 'CompTrack':
					return CompTrack
				case 'CompTrackConfig':
					return CompTrackConfig
				// case 'MetaDomainTrack': return MetaDomainTrack;
				// case 'MetaDomainTrackConfig': return MetaDomainTrackConfig;
				// case 'MetaCompartmentTrack': return MetaCompartmentTrack;
				// case 'MetaCompartmentTrackConfig': return MetaCompartmentTrackConfig;
				default:
					return 'div' // default fallback or a specific error component
			}
		}
	}
}
</script>

<template>
	<component :is="currentComponent" v-bind="props"></component>
</template>
