import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  { path: '/login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '',         name: 'dashboard',    component: () => import('../views/DashboardView.vue') },
      { path: 'products', name: 'products',     component: () => import('../views/ProductsView.vue') },
      { path: 'categories', name: 'categories', component: () => import('../views/CategoriesView.vue') },
      { path: 'suppliers', name: 'suppliers',   component: () => import('../views/SuppliersView.vue') },
      { path: 'stock/in',  name: 'stock-in',    component: () => import('../views/StockInView.vue') },
      { path: 'stock/out', name: 'stock-out',   component: () => import('../views/StockOutView.vue') },
      { path: 'stock/levels', name: 'stock-levels', component: () => import('../views/StockLevelsView.vue') },
      { path: 'stock/transactions', name: 'transactions', component: () => import('../views/TransactionsView.vue') },
      { path: 'reports',  name: 'reports',      component: () => import('../views/ReportsView.vue') },
      { path: 'users',    name: 'users',        component: () => import('../views/UsersView.vue'), meta: { adminOnly: true } },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, _from, next) => {
  const auth = useAuthStore()
  if (!to.meta.public && !auth.isAuthenticated) {
    next('/login')
  } else if (to.meta.adminOnly && !auth.isAdmin) {
    next('/')
  } else {
    next()
  }
})

export default router
