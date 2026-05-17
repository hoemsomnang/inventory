<template>
  <el-drawer
    v-model="drawerVisible"
    direction="ltr"
    size="240px"
    :with-header="false"
    class="mobile-drawer glass"
  >
    <div class="sidebar-logo">
      <el-icon class="logo-icon"><Box /></el-icon>
      <span>Inventory<strong>Pro</strong></span>
    </div>
    
    <el-menu :default-active="$route.path" router class="sidebar-menu" @select="drawerVisible = false">
      <el-menu-item index="/">
        <el-icon><DataBoard /></el-icon><span>Dashboard</span>
      </el-menu-item>

      <el-menu-item-group title="CATALOG">
        <el-menu-item index="/products"><el-icon><Goods /></el-icon><span>Products</span></el-menu-item>
        <el-menu-item index="/categories"><el-icon><Collection /></el-icon><span>Categories</span></el-menu-item>
        <el-menu-item index="/suppliers"><el-icon><OfficeBuilding /></el-icon><span>Suppliers</span></el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group title="STOCK">
        <el-menu-item index="/stock/in"><el-icon><Download /></el-icon><span>Stock In</span></el-menu-item>
        <el-menu-item index="/stock/out"><el-icon><Upload /></el-icon><span>Stock Out</span></el-menu-item>
        <el-menu-item index="/stock/levels"><el-icon><List /></el-icon><span>Stock Levels</span></el-menu-item>
        <el-menu-item index="/stock/transactions"><el-icon><Tickets /></el-icon><span>Transactions</span></el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group title="ANALYTICS">
        <el-menu-item index="/reports"><el-icon><TrendCharts /></el-icon><span>Reports</span></el-menu-item>
      </el-menu-item-group>

      <el-menu-item-group v-if="auth.isAdmin" title="ADMIN">
        <el-menu-item index="/users"><el-icon><User /></el-icon><span>Users</span></el-menu-item>
      </el-menu-item-group>
    </el-menu>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue']);

const auth = useAuthStore();

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});
</script>

<style scoped>
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
  padding: 8px 0;
}
:deep(.el-menu-item) {
  color: var(--text-muted) !important;
  border-radius: 8px !important;
  margin: 2px 10px !important;
  transition: all 0.2s ease !important;
}
:deep(.el-menu-item:hover), :deep(.el-menu-item.is-active) {
  background: rgba(0,128,128,0.15) !important;
  color: var(--primary-light) !important;
}
:deep(.el-menu-item.is-active) { box-shadow: var(--glow); }
:deep(.el-menu-item-group__title) {
  color: var(--text-muted) !important;
  font-size: 10px !important;
  letter-spacing: 1.5px !important;
  padding: 16px 20px 6px !important;
}
:deep(.el-drawer) {
  background: var(--surface) !important;
}
</style>
