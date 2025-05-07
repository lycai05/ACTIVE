import { renderIcon } from "@/utils"
import { h } from "vue"
import { RouterLink } from "vue-router"
import { type MenuMixedOption } from "naive-ui/es/menu/src/interface"

const DocsIcon = "ion:book-outline"
const HomeIcon = "carbon:home"
const BrowseIcon = "carbon:content-view"
const HumanIcon = "mdi:head-outline"
const MouseIcon = "mingcute:mickeymouse-line"
const MoreIcon = "material-symbols:more-horiz"
const MonkeyIcon = "simple-icons:surveymonkey"
const AnnotateIcon = "clarity:process-on-vm-line"
const CrossSpecies = "tabler:binary-tree"

export default function getItems(mode: "vertical" | "horizontal", collapsed: boolean): MenuMixedOption[] {
	return [
		{
			key: "divider-1",
			type: "divider",
			props: {
				style: {
					//marginLeft: "32px"
				}
			}
		},
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "home"
						}
					},
					{ default: () => "Home" }
				),
			key: "home",
			icon: renderIcon(HomeIcon)
		},
		// {
		// 	label: () =>
		// 		h(
		// 			RouterLink,
		// 			{
		// 				to: {
		// 					name: "demo"
		// 				}
		// 			},
		// 			{ default: () => "Demo" }
		// 		),
		// 	key: "demo",
		// 	icon: renderIcon(HomeIcon)
		// },
		{
			path: "/gallery",
			name: "gallery",
			redirect: { name: "gallery-home" },
			meta: { title: "Gallery" },
			children: [
				{
					path: "",
					name: "gallery-home",
					component: () => import("@/views/Gallery/index.vue"),
					meta: { title: "Gallery" }
				},
				{
					path: "multiview",
					name: "multiview",
					component: () => import("@/views/Gallery/multiview.vue"),
					meta: { title: "multiview" }
				},
				{
					path: "singlecell",
					name: "singlecell",
					component: () => import("@/views/Gallery/singlecell.vue"),
					meta: { title: "singlecell" }
				},
			]
		},
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "browse"
						}
					},
					{ default: () => "Browse" }
				),
			key: "browse",
			icon: renderIcon(BrowseIcon),
			children: [
				{
					icon: renderIcon(HumanIcon),
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "Human"
								}
							},
							{ default: () => "Human" }
						),
					key: "Human"
				},
				{
					icon: renderIcon(MouseIcon),
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "Mouse"
								}
							},
							{ default: () => "Mouse" }
						),
					key: "Mouse"
				},
				{
					icon: renderIcon(MoreIcon),
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "More"
								}
							},
							{ default: () => "More" }
						),
					key: "More"
				}
			]
		},
		{
			label: () =>
				h(
					RouterLink,
					{
						to: {
							name: "humanvsmouse"
						}
					},
					{ default: () => "Cross-species" }
				),
			key: "CrossSpecies",
			icon: renderIcon(CrossSpecies),
			children: [
				{
					icon: renderIcon(HumanIcon),
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "humanvsmouse"
								}
							},
							{ default: () => "Human vs Mouse" }
						),
					key: "Human"
				},
				{
					icon: renderIcon(MouseIcon),
					label: () =>
						h(
							RouterLink,
							{
								to: {
									name: "humanvsmonkey"
								}
							},
							{ default: () => "Human vs Monkey" }
						),
					key: "Mouse"
				},
			]
		}

		// {
		// 	label: () =>
		// 		h(
		// 			RouterLink,
		// 			{
		// 				to: {
		// 					name: "api"
		// 				}
		// 			},
		// 			{ default: () => "REST API" }
		// 		),
		// 	key: "api",
		// 	icon: renderIcon(APIIcon)
		// },
		// {
		// 	label: () =>
		// 		h(
		// 			RouterLink,
		// 			{
		// 				to: {
		// 					name: "datasets"
		// 				}
		// 			},
		// 			{ default: () => "Datasets" }
		// 		),
		// 	key: "Datasets",
		// 	icon: renderIcon(DashboardIcon)
		// },

	]
}
