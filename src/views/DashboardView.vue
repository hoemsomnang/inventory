<template>
  <div class="dashboard">
    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpis" :key="kpi.label" :class="kpi.color">
        <div class="kpi-icon"><el-icon><component :is="kpi.icon" /></el-icon></div>
        <div class="kpi-info">
          <div class="kpi-value">{{ kpi.value }}</div>
          <div class="kpi-label">{{ kpi.label }}</div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="charts-grid">
      <el-card class="chart-card">
        <template #header><span class="card-title">Stock Movement (Last 7 Days)</span></template>
        <Bar v-if="chartData" :data="chartData" :options="chartOptions" style="height:260px" />
        <div v-else class="chart-loading"><el-icon class="rotating"><Loading /></el-icon></div>
      </el-card>

      <el-card class="chart-card">
        <template #header><span class="card-title">⚠️ Low Stock Alerts</span></template>
        <div v-if="lowStock.length === 0" class="empty-state">
          <el-icon><CircleCheckFilled /></el-icon>
          <p>All stock levels are healthy!</p>
        </div>
        <div v-else class="low-stock-list">
          <div v-for="item in lowStock" :key="item.id" class="low-stock-item clickable" @click="openDetailFromStock(item)">
            <span class="product-name">{{ item.product.name }}</span>
            <el-tag type="danger" size="small">{{ item.quantity }} left</el-tag>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Recent Transactions -->
    <el-card class="recent-card">
      <template #header>
        <div class="card-header-row">
          <span class="card-title">Recent Transactions</span>
          <el-button size="small" @click="$router.push('/stock/transactions')">View All</el-button>
        </div>
      </template>
      <el-table :data="recentTx" stripe @row-click="openDetailFromTx" style="cursor:pointer">
        <el-table-column label="Date" prop="createdAt" width="130">
          <template #default="{ row }">{{ formatDate(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="Product" prop="product.name" min-width="150" />
        <el-table-column label="Type" width="100">
          <template #default="{ row }">
            <el-tag :type="row.type === 'IN' ? 'success' : 'danger'" size="small">{{ row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Qty" prop="quantity" width="80" />
        <el-table-column label="Ref#" prop="referenceNo" />
        <el-table-column label="By" prop="createdBy" width="120" />
      </el-table>
    </el-card>

    <ProductDetailDialog v-model="detailVisible" :product="detailProduct" :stock-qty="detailStockQty" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import api from '../api/axios'
import ProductDetailDialog from '../components/ProductDetailDialog.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const summary = ref({})
const lowStock = ref([])
const recentTx = ref([])
const chartData = ref(null)
const detailVisible = ref(false)
const detailProduct = ref(null)
const detailStockQty = ref(null)

function openDetailFromStock(item) {
  detailProduct.value = item.product
  detailStockQty.value = item.quantity
  detailVisible.value = true
}

function openDetailFromTx(row) {
  detailProduct.value = row.product
  detailStockQty.value = null
  detailVisible.value = true
}

const chartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#e2e8f0' } } },
  scales: {
    x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
  }
}

const kpis = computed(() => [
  { label: 'Total Products',  value: summary.value.totalProducts  ?? '-', icon: 'Goods',         color: 'purple' },
  { label: 'Total Suppliers', value: summary.value.totalSuppliers ?? '-', icon: 'OfficeBuilding', color: 'blue'   },
  { label: 'Stock In Today',  value: summary.value.stockInToday   ?? '-', icon: 'Download',       color: 'green'  },
  { label: 'Stock Out Today', value: summary.value.stockOutToday  ?? '-', icon: 'Upload',         color: 'orange' },
  { label: 'Low Stock Items', value: summary.value.lowStockItems  ?? '-', icon: 'Warning',        color: 'red'    },
  { label: 'Total Users',     value: summary.value.totalUsers     ?? '-', icon: 'User',           color: 'teal'   },
])

function formatDate(dt) {
  if (!dt) return ''
  const d = new Date(dt)
  const dateStr = d.toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })
  const timeStr = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
  return `${dateStr} ${timeStr}`
}

onMounted(async () => {
  const [s, ls, tx] = await Promise.all([
    api.get('/reports/summary'),
    api.get('/stock/low-stock'),
    api.get('/stock/transactions'),
  ])
  summary.value = s.data
  lowStock.value = ls.data.slice(0, 8)
  recentTx.value = tx.data.slice(0, 10)

  // Build 7-day chart
  const labels = []
  const inData = []
  const outData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    labels.push(d.toLocaleDateString('en', { weekday: 'short' }))
    const dayTx = tx.data.filter(t => new Date(t.createdAt).toDateString() === d.toDateString())
    inData.push(dayTx.filter(t => t.type === 'IN').reduce((a, b) => a + b.quantity, 0))
    outData.push(dayTx.filter(t => t.type === 'OUT').reduce((a, b) => a + b.quantity, 0))
  }
  chartData.value = {
    labels,
    datasets: [
      { label: 'Stock In',  data: inData,  backgroundColor: 'rgba(16,185,129,0.7)',  borderRadius: 6 },
      { label: 'Stock Out', data: outData, backgroundColor: 'rgba(239,68,68,0.7)',   borderRadius: 6 },
    ]
  }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
@media (max-width: 900px) { .kpi-grid { grid-template-columns: repeat(2, 1fr); } }

.kpi-card {
  display: flex; align-items: center; gap: 16px;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 20px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-card:hover { transform: translateY(-3px); box-shadow: var(--shadow); }

.kpi-icon {
  width: 52px; height: 52px; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 26px;
}
.kpi-card.purple .kpi-icon { background: rgba(99,102,241,0.2); color: #818cf8; }
.kpi-card.blue   .kpi-icon { background: rgba(59,130,246,0.2); color: #60a5fa; }
.kpi-card.green  .kpi-icon { background: rgba(16,185,129,0.2); color: #10b981; }
.kpi-card.orange .kpi-icon { background: rgba(245,158,11,0.2); color: #f59e0b; }
.kpi-card.red    .kpi-icon { background: rgba(239,68,68,0.2);  color: #ef4444; }
.kpi-card.teal   .kpi-icon { background: rgba(20,184,166,0.2); color: #14b8a6; }

.kpi-value { font-size: 28px; font-weight: 700; color: var(--text); }
.kpi-label { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

.charts-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; }
@media (max-width: 900px) { .charts-grid { grid-template-columns: 1fr; } }

.chart-card, .recent-card { background: var(--surface-2) !important; }
.card-title { font-weight: 600; color: var(--text); font-size: 15px; }
.card-header-row { display: flex; justify-content: space-between; align-items: center; }

.chart-loading { height: 260px; display: flex; align-items: center; justify-content: center; color: var(--text-muted); font-size: 32px; }
@keyframes spin { to { transform: rotate(360deg); } }
.rotating { animation: spin 1s linear infinite; }

.empty-state { text-align: center; padding: 40px; color: var(--success); }
.empty-state .el-icon { font-size: 48px; display: block; margin-bottom: 10px; }

.low-stock-list { display: flex; flex-direction: column; gap: 8px; }
.low-stock-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 10px 12px;
  background: var(--surface-3);
  border-radius: 8px;
  transition: background 0.2s, transform 0.15s;
}
.low-stock-item.clickable { cursor: pointer; }
.low-stock-item.clickable:hover { background: var(--border); transform: translateX(4px); }
.product-name { font-size: 13px; color: var(--text); }
</style>
