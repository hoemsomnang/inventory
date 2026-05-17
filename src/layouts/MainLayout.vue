<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside width="240px" class="sidebar">
      <div class="sidebar-logo">
        <el-icon class="logo-icon"><Box /></el-icon>
        <span>Inventory<strong>Pro</strong></span>
      </div>

      <el-menu :default-active="$route.path" router class="sidebar-menu">
        <el-menu-item index="/">
          <el-icon><DataBoard /></el-icon><span>Dashboard</span>
        </el-menu-item>

        <el-menu-item-group title="CATALOG">
          <el-menu-item index="/products">
            <el-icon><Goods /></el-icon><span>Products</span>
          </el-menu-item>
          <el-menu-item index="/categories">
            <el-icon><Collection /></el-icon><span>Categories</span>
          </el-menu-item>
          <el-menu-item index="/suppliers">
            <el-icon><OfficeBuilding /></el-icon><span>Suppliers</span>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="STOCK">
          <el-menu-item index="/stock/in">
            <el-icon><Download /></el-icon><span>Stock In</span>
          </el-menu-item>
          <el-menu-item index="/stock/out">
            <el-icon><Upload /></el-icon><span>Stock Out</span>
          </el-menu-item>
          <el-menu-item index="/stock/levels">
            <el-icon><List /></el-icon><span>Stock Levels</span>
          </el-menu-item>
          <el-menu-item index="/stock/transactions">
            <el-icon><Tickets /></el-icon><span>Transactions</span>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group title="ANALYTICS">
          <el-menu-item index="/reports">
            <el-icon><TrendCharts /></el-icon><span>Reports</span>
          </el-menu-item>
        </el-menu-item-group>

        <el-menu-item-group v-if="auth.isAdmin" title="ADMIN">
          <el-menu-item index="/users">
            <el-icon><User /></el-icon><span>Users</span>
          </el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>

    <!-- Main -->
    <el-container direction="vertical" class="main-container">
      <!-- Header -->
      <el-header class="app-header">
        <div class="header-left">
          <el-button 
            class="mobile-header-toggle" 
            icon="Menu" 
            circle 
            text 
            @click="mobileMenuVisible = true" 
          />
          <div class="mobile-logo hidden-desktop">
            <el-icon class="logo-icon"><Box /></el-icon>
          </div>
          <h2 class="page-title">{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-badge :value="lowStockCount" :hidden="lowStockCount === 0" type="danger">
            <el-button circle @click="$router.push('/stock/levels')">
              <el-icon><Bell /></el-icon>
            </el-button>
          </el-badge>
          <el-dropdown @command="handleCommand">
            <div class="user-chip">
              <el-avatar :size="32" class="user-avatar">
                {{ auth.user?.username?.[0]?.toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <span class="user-name">{{ auth.user?.username }}</span>
                <el-tag size="small" type="success">{{ auth.user?.role }}</el-tag>
              </div>
              <el-icon><ArrowDown /></el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout" divided>
                  <el-icon><SwitchButton /></el-icon> Logout
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- Content -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
    
    <!-- Mobile Navigation Drawer -->
    <MobileMenu v-model="mobileMenuVisible" />
    
    <!-- Mobile Bottom Navigation (Light Theme UI) -->
    <div class="mobile-bottom-nav hidden-desktop">
      <router-link to="/" class="nav-item" exact-active-class="active">
        <el-icon><HomeFilled /></el-icon>
      </router-link>
      <router-link to="/stock/in" class="nav-item" exact-active-class="active">
        <el-icon><Download /></el-icon>
      </router-link>
      <router-link to="/stock/out" class="nav-item" exact-active-class="active">
        <el-icon><Upload /></el-icon>
      </router-link>
      <router-link to="/products" class="nav-item" exact-active-class="active">
        <el-icon><Goods /></el-icon>
      </router-link>
      <div class="nav-item nav-fab" @click="mobileMenuVisible = true">
        <el-icon><Plus /></el-icon>
      </div>
    </div>
  </el-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'
import MobileMenu from '../components/MobileMenu.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const lowStockCount = ref(0)
const mobileMenuVisible = ref(false)

const pageTitles = {
  '/': 'Dashboard',
  '/products': 'Products',
  '/categories': 'Categories',
  '/suppliers': 'Suppliers',
  '/stock/in': 'Stock In',
  '/stock/out': 'Stock Out',
  '/stock/levels': 'Stock Levels',
  '/stock/transactions': 'Transaction History',
  '/reports': 'Reports & Analytics',
  '/users': 'User Management',
}
const pageTitle = computed(() => pageTitles[route.path] || 'Inventory Pro')

onMounted(async () => {
  try {
    const { data } = await api.get('/stock/low-stock')
    lowStockCount.value = data.length
  } catch {}
})

function handleCommand(cmd) {
  if (cmd === 'logout') {
    auth.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.layout-container { height: 100vh; }

.sidebar {
  background: linear-gradient(180deg, #13132a 0%, #1a1a35 100%);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 24px 20px;
  font-size: 20px;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.logo-icon { font-size: 28px; color: var(--primary); }
.sidebar-logo strong { color: var(--primary); }

.sidebar-menu {
  background: transparent !important;
  border-right: none !important;
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
:deep(.el-menu-item) {
  color: var(--text-muted) !important;
  border-radius: 8px !important;
  margin: 2px 10px !important;
  transition: all 0.2s ease !important;
}
:deep(.el-menu-item:hover), :deep(.el-menu-item.is-active) {
  background: rgba(99,102,241,0.15) !important;
  color: var(--primary-light) !important;
}
:deep(.el-menu-item.is-active) { box-shadow: var(--glow); }
:deep(.el-menu-item-group__title) {
  color: var(--text-muted) !important;
  font-size: 10px !important;
  letter-spacing: 1.5px !important;
  padding: 16px 20px 6px !important;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 64px !important;
}
.header-left { display: flex; align-items: center; gap: 12px; }
.mobile-header-toggle { display: none; font-size: 22px; color: var(--text); }
.mobile-logo { display: none; }
.mobile-logo .logo-icon { font-size: 24px; color: var(--primary); }
.page-title { font-size: 20px; font-weight: 600; color: var(--text); margin-left: 4px; }
.header-right { display: flex; align-items: center; gap: 16px; }

.user-chip {
  display: flex; align-items: center; gap: 10px;
  background: var(--surface-3);
  border: 1px solid var(--border);
  border-radius: 40px;
  padding: 6px 14px 6px 6px;
  cursor: pointer;
  transition: all 0.2s;
}
.user-chip:hover { border-color: var(--primary); box-shadow: var(--glow); }
.user-avatar { background: var(--primary) !important; font-weight: 700; }
.user-info { display: flex; flex-direction: column; line-height: 1.2; }
.user-name { font-size: 13px; font-weight: 600; color: var(--text); }

.app-main { background: var(--surface); padding: 24px; overflow-y: auto; }
</style>
