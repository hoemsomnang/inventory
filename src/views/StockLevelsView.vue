<template>
  <div>
    <div class="view-header">
      <h3>Current Stock Levels</h3>
      <el-input v-model="search" placeholder="Search..." prefix-icon="Search" style="width:220px" clearable />
    </div>
    <el-card>
      <el-table :data="filtered" stripe v-loading="loading">
        <el-table-column label="SKU" prop="product.sku" width="120" />
        <el-table-column label="Product" prop="product.name" min-width="180" />
        <el-table-column label="Category" prop="product.category.name" width="130" />
        <el-table-column label="Unit" prop="product.unit" width="80" />
        <el-table-column label="Min Stock" prop="product.minStock" width="110" />
        <el-table-column label="Current Qty" width="130">
          <template #default="{ row }">
            <span :class="['qty-badge', row.quantity <= row.product.minStock ? 'low' : 'ok']">
              {{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag :type="row.quantity <= row.product.minStock ? 'danger' : 'success'" size="small">
              {{ row.quantity <= row.product.minStock ? 'LOW STOCK' : 'OK' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Last Updated" width="180">
          <template #default="{ row }">{{ formatDate(row.lastUpdated) }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

const levels = ref([])
const loading = ref(false)
const search = ref('')

const filtered = computed(() =>
  levels.value.filter(l =>
    (l.product?.name || '').toLowerCase().includes(search.value.toLowerCase()) ||
    (l.product?.sku || '').toLowerCase().includes(search.value.toLowerCase())
  )
)

function formatDate(dt) { return dt ? new Date(dt).toLocaleString() : '-' }

onMounted(async () => {
  loading.value = true
  const { data } = await api.get('/stock/levels')
  levels.value = data
  loading.value = false
})
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
.qty-badge { font-size: 16px; font-weight: 700; }
.qty-badge.ok { color: var(--success); }
.qty-badge.low { color: var(--danger); }
</style>
