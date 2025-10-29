import { createRouter, createWebHistory } from 'vue-router'
import RequesterView from '../views/RequesterView.vue'
import ValidatorView from '../views/ValidatorView.vue'

const routes = [
  { path: '/', redirect: '/requester' },
  { path: '/requester', name: 'Requester', component: RequesterView },
  { path: '/validator', name: 'Validator', component: ValidatorView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
