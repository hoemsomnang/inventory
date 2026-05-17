<template>
  <el-drawer
    v-model="drawerVisible"
    direction="ltr"
    size="280px"
    :with-header="false"
    class="modern-mobile-drawer"
  >
    <div class="drawer-content">
      <!-- Header Section -->
      <div class="drawer-header">
        <div class="drawer-logo">
          <el-icon class="logo-icon"><Box /></el-icon>
          <span>Inventory<strong>Pro</strong></span>
        </div>
        <el-button class="close-btn" icon="Close" circle text @click="drawerVisible = false" />
      </div>

      <!-- Profile Section -->
      <div class="drawer-profile" v-if="auth.user">
        <el-avatar :size="52" class="profile-avatar">
          {{ auth.user?.username?.[0]?.toUpperCase() }}
        </el-avatar>
        <div class="profile-info">
          <div class="profile-name">{{ auth.user?.username }}</div>
          <el-tag size="small" effect="dark" class="profile-role" type="success">{{ auth.user?.role }}</el-tag>
        </div>
      </div>

      <!-- Menu Section -->
      <div class="drawer-menu-container">
        <el-menu :default-active="$route.path" router class="mobile-menu" @select="drawerVisible = false">
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
      </div>

      <!-- Footer Section -->
      <div class="drawer-footer">
        <el-button type="danger" plain class="logout-btn" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>Logout</span>
        </el-button>
      </div>
    </div>
  </el-drawer>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const props = defineProps({
  modelValue: Boolean
});
const emit = defineEmits(['update:modelValue']);

const auth = useAuthStore();
const router = useRouter();

const drawerVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const handleLogout = () => {
  auth.logout();
  drawerVisible.value = false;
  router.push('/login');
};
</script>

<style scoped>
:deep(.el-drawer) {
  background: rgba(18, 18, 18, 0.85) !important;
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-right: 1px solid rgba(255, 255, 255, 0.08);
}

.drawer-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.drawer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 22px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.5px;
}

.logo-icon {
  font-size: 28px;
  color: var(--primary-light);
  filter: drop-shadow(0 0 10px rgba(0, 128, 128, 0.6));
}

.drawer-logo strong {
  color: var(--primary-light);
}

.close-btn {
  font-size: 22px;
  color: #a0a0a0;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #fff;
  transform: rotate(90deg);
}

.drawer-profile {
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(255, 255, 255, 0.02);
}

.profile-avatar {
  background: linear-gradient(135deg, var(--primary), var(--accent)) !important;
  font-size: 20px;
  font-weight: bold;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.4);
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.profile-name {
  font-size: 17px;
  font-weight: 600;
  color: #fff;
}

.profile-role {
  border-radius: 12px;
  border: none;
  font-weight: 600;
  padding: 0 10px;
  align-self: flex-start;
  letter-spacing: 0.5px;
}

.drawer-menu-container {
  flex: 1;
  overflow-y: auto;
  padding: 16px 8px;
}

.mobile-menu {
  background: transparent !important;
  border-right: none !important;
}

:deep(.el-menu-item) {
  color: var(--text-muted) !important;
  border-radius: 12px !important;
  margin: 4px 12px !important;
  height: 50px !important;
  line-height: 50px !important;
  font-size: 15px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.el-menu-item .el-icon) {
  font-size: 20px !important;
  margin-right: 12px !important;
}

:deep(.el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: #fff !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(0,128,128,0.2) 0%, rgba(0,128,128,0.05) 100%) !important;
  color: var(--primary-light) !important;
  border-left: 3px solid var(--primary-light);
  box-shadow: inset 0 0 20px rgba(0,128,128,0.1);
}

:deep(.el-menu-item-group__title) {
  color: rgba(255, 255, 255, 0.4) !important;
  font-size: 11px !important;
  font-weight: 700 !important;
  letter-spacing: 2px !important;
  padding: 24px 24px 8px !important;
}

.drawer-footer {
  padding: 20px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(0, 0, 0, 0.2);
}

.logout-btn {
  width: 100%;
  border-radius: 12px;
  height: 48px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  font-size: 15px;
  transition: all 0.3s ease;
  background: rgba(245, 108, 108, 0.1) !important;
  border-color: rgba(245, 108, 108, 0.3) !important;
  color: #f56c6c !important;
}

.logout-btn:hover {
  background: #f56c6c !important;
  color: #fff !important;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
}
</style>
