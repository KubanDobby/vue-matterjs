import 'uno.css'
import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Index from './pages/index.vue'

const routes = [
  {
    path: '/',
    component: Index,
  },
]


const router = createRouter({
  history: createWebHistory(),
  routes,
})


const app = createApp(App)
app.use(router)
app.mount('#app')
import 'virtual:uno.css'
