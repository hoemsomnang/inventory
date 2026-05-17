<template>
  <div>
    <div class="view-header">
      <h3>Current Stock Levels</h3>
      <el-input v-model="search" placeholder="Search..." prefix-icon="Search" style="width:220px" clearable />
    </div>
    <el-card>
      <el-table :data="paginatedData" stripe v-loading="loading" @row-click="openDetail" style="cursor:pointer">
        <el-table-column label="Image" width="80">
          <template #default="{ row }">
            <el-image v-if="row.product?.productImage" :src="row.product.productImage" fit="cover" style="width:40px;height:40px;border-radius:8px" />
            <el-icon v-else style="font-size:20px;color:#ccc"><Picture /></el-icon>
          </template>
        </el-table-column>
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
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filtered.length"
          layout="prev, pager, next, total"
          background
          small
        />
      </div>
    </el-card>

    <ProductDetailDialog v-model="detailVisible" :product="detailProduct" :stock-qty="detailStockQty" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'
import ProductDetailDialog from '../components/ProductDetailDialog.vue'

const levels = ref([])
const loading = ref(false)
const search = ref('')
const currentPage = ref(1)
const pageSize = 30
const detailVisible = ref(false)
const detailProduct = ref(null)
const detailStockQty = ref(null)

function openDetail(row) {
  detailProduct.value = row.product
  detailStockQty.value = row.quantity
  detailVisible.value = true
}

const filtered = computed(() =>
  levels.value.filter(l =>
    (l.product?.name || '').toLowerCase().includes(search.value.toLowerCase())
  )
)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filtered.value.slice(start, start + pageSize)
})

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
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
