import { createRouter, createWebHistory } from "vue-router"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			redirect: "/home"
		},
		{
			path: "/home",
			name: "home",
			component: () => import("@/views/Home/index.vue"),
			meta: { title: "Home" }
		},

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
			path: "/browse",
			name: "browse",
			redirect: { name: "browse-home" },
			meta: { title: "Browser" },
			children: [
				{
					path: "",
					name: "browse-home",
					component: () => import("@/views/Browse/index.vue"),
					meta: { title: "Browser" }
				},
				{
					path: "human",
					name: "Human",
					component: () => import("@/views/Browse/human.vue"),
					meta: {
						title: "Human Browser",
						showBreadCrumb: true
					}
				},
				{
					path: "mouse",
					name: "Mouse",
					component: () => import("@/views/Browse/index.vue"),
					meta: {
						title: "More Browser",
						showBreadCrumb: true
					}
				},
				{
					path: "more",
					name: "More",
					component: () => import("@/views/Browse/index.vue"),
					meta: {
						title: "Monkey Browser",
						showBreadCrumb: true
					}
				},
				{
					path: "monkey",
					name: "Monkey",
					component: () => import("@/views/Browse/monkey.vue"),
					meta: {
						title: "Monkey Browser",
						showBreadCrumb: true
					}
				}
			]
		},
		{
			path: "/cross-species",
			name: "CrossSpecies",
			redirect: '/cross-species/humanvsmouse',
			meta: {
				title: "Cross Species",
				showBreadCrumb: true
			},
			children: [
				{
					path: "humanvsmouse",
					name: "humanvsmouse",
					component: () => import("@/views/CrossSpecies/index.vue"),
					meta: {
						title: "Human vs Mouse",
						showBreadCrumb: true
					}
				},
				{
					path: "humanvsmonkey",
					name: "humanvsmonkey",
					component: () => import("@/views/CrossSpecies/humanvsmonkey.vue"),
					meta: {
						title: "Human vs Monkey",
						showBreadCrumb: true
					}
				}
			]
		}

	]
})


export default router
