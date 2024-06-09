import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: () => import('@/views/HomeView.vue'),
      meta: {
        title: 'Home'
      }
    }
  ]
})
router.afterEach((to, from, next) => {
  console.log('router.beforeEach')
  const { meta } = to;
  console.log(meta)
  Object.keys(meta).forEach((key) => {
    if (typeof meta[key] === 'function') {
      meta[key] = meta[key](to);
      console.log(meta[key])
    }
  });
  // next();
});
export default router