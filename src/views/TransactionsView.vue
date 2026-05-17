<template>
  <div>
    <div class="view-header">
      <h3>Transaction History</h3>
      <div class="filters">
        <el-date-picker v-model="dateRange" type="daterange" range-separator="to"
          start-placeholder="Start" end-placeholder="End" style="width:260px" @change="load" />
        <el-select v-model="typeFilter" placeholder="All Types" clearable style="width:130px" @change="load">
          <el-option label="Stock In" value="IN" />
          <el-option label="Stock Out" value="OUT" />
        </el-select>
      </div>
    </div>
    <el-card>
      <el-table :data="filtered" stripe v-loading="loading">
        <el-table-column label="Date" width="180">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Product" prop="product.name" min-width="160" />
        <el-table-column label="SKU" prop="product.sku" width="120" />
        <el-table-column label="Type" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'IN' ? 'success' : 'danger'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Qty" width="80">
          <template #default="{ row }">
            <span :style="{ color: row.type === 'IN' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }">
              {{ row.type === 'IN' ? '+' : '-' }}{{ row.quantity }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="Reference" prop="referenceNo" />
        <el-table-column label="Notes" prop="notes" show-overflow-tooltip />
        <el-table-column label="By" prop="createdBy" width="120" />
      </el-table>
      <div class="summary-row">
        Total IN: <strong class="in">{{ totalIn }}</strong> &nbsp;|&nbsp;
        Total OUT: <strong class="out">{{ totalOut }}</strong>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import api from '../api/axios'

const transactions = ref([])
const loading = ref(false)
const dateRange = ref(null)
const typeFilter = ref(null)

const filtered = computed(() =>
  transactions.value.filter(t => !typeFilter.value || t.type === typeFilter.value)
)
const totalIn  = computed(() => filtered.value.filter(t => t.type === 'IN').reduce((a, b) => a + b.quantity, 0))
const totalOut = computed(() => filtered.value.filter(t => t.type === 'OUT').reduce((a, b) => a + b.quantity, 0))

function formatDate(dt) { return dt ? new Date(dt).toLocaleString() : '' }

async function load() {
  loading.value = true
  if (dateRange.value?.[0]) {
    const from = dateRange.value[0].toISOString()
    const to = dateRange.value[1].toISOString()
    const { data } = await api.get(`/stock/transactions?from=${from}&to=${to}`)
    transactions.value = data
  } else {
    const { data } = await api.get('/stock/transactions')
    transactions.value = data
  }
  loading.value = false
}

onMounted(load)
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
.filters { display: flex; gap: 10px; flex-wrap: wrap; }
.summary-row { padding: 14px 0 0; color: var(--text-muted); font-size: 13px; }
.summary-row .in { color: var(--success); }
.summary-row .out { color: var(--danger); }
</style>
