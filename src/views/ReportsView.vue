<template>
  <div>
    <div class="view-header"><h3>Reports & Analytics</h3></div>

    <!-- Date Range -->
    <el-card class="filter-card">
      <el-form inline>
        <el-form-item label="Date Range">
          <el-date-picker v-model="dateRange" type="daterange" range-separator="to"
            start-placeholder="Start Date" end-placeholder="End Date" style="width:280px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="load"><el-icon><Search /></el-icon> Generate Report</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Summary KPIs -->
    <div class="report-kpis" v-if="movement">
      <div class="kpi-box green">
        <div class="kpi-num">{{ movement.totalStockIn }}</div>
        <div class="kpi-lbl">Total Stock In</div>
      </div>
      <div class="kpi-box red">
        <div class="kpi-num">{{ movement.totalStockOut }}</div>
        <div class="kpi-lbl">Total Stock Out</div>
      </div>
      <div class="kpi-box purple">
        <div class="kpi-num">${{ valuation?.totalValue?.toFixed(2) || '0.00' }}</div>
        <div class="kpi-lbl">Inventory Value</div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-row" v-if="movement">
      <el-card>
        <template #header><span class="card-title">Movement by Product</span></template>
        <Bar v-if="barData" :data="barData" :options="chartOptions" style="height:300px" />
      </el-card>
      <el-card>
        <template #header><span class="card-title">IN vs OUT Ratio</span></template>
        <Doughnut v-if="doughnutData" :data="doughnutData" :options="doughnutOptions" style="height:300px" />
      </el-card>
    </div>

    <!-- Valuation Table -->
    <el-card v-if="valuation" style="margin-top:20px">
      <template #header><span class="card-title">Stock Valuation</span></template>
      <el-table :data="paginatedValuation" stripe @row-click="openDetail" style="cursor:pointer">
        <el-table-column label="Product" prop="product.name" min-width="160" />
        <el-table-column label="Image" width="80">
          <template #default="{ row }">
            <el-image v-if="row.product?.productImage" :src="row.product.productImage" fit="cover" style="width:36px;height:36px;border-radius:8px" />
            <el-icon v-else style="font-size:18px;color:#ccc"><Picture /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="Qty" prop="quantity" width="80" />
        <el-table-column label="Unit Price" width="120">
          <template #default="{ row }">{{ row.product.price ? '$' + row.product.price : '-' }}</template>
        </el-table-column>
        <el-table-column label="Total Value" width="130">
          <template #default="{ row }">
            <strong style="color:var(--primary-light)">
              {{ row.product.price ? '$' + (row.quantity * row.product.price).toFixed(2) : '-' }}
            </strong>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-wrapper" v-if="valuation.items?.length > pageSize">
        <el-pagination
          v-model:current-page="valPage"
          :page-size="pageSize"
          :total="valuation.items?.length || 0"
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
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Title, Tooltip, Legend
} from 'chart.js'
import api from '../api/axios'
import ProductDetailDialog from '../components/ProductDetailDialog.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

const dateRange = ref([
  new Date(new Date().setDate(new Date().getDate() - 30)),
  new Date()
])
const movement = ref(null)
const valuation = ref(null)
const valPage = ref(1)
const pageSize = 30

const paginatedValuation = computed(() => {
  if (!valuation.value?.items) return []
  const start = (valPage.value - 1) * pageSize
  return valuation.value.items.slice(start, start + pageSize)
})

const detailVisible = ref(false)
const detailProduct = ref(null)
const detailStockQty = ref(null)

function openDetail(row) {
  detailProduct.value = row.product
  detailStockQty.value = row.quantity
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
const doughnutOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#e2e8f0' } } }
}

const barData = computed(() => {
  if (!movement.value?.transactions) return null
  const txs = movement.value.transactions
  const productMap = {}
  txs.forEach(t => {
    const name = t.product?.name || 'Unknown'
    if (!productMap[name]) productMap[name] = { in: 0, out: 0 }
    if (t.type === 'IN') productMap[name].in += t.quantity
    else productMap[name].out += t.quantity
  })
  const labels = Object.keys(productMap).slice(0, 10)
  return {
    labels,
    datasets: [
      { label: 'IN',  data: labels.map(l => productMap[l].in),  backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
      { label: 'OUT', data: labels.map(l => productMap[l].out), backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 6 },
    ]
  }
})

const doughnutData = computed(() => {
  if (!movement.value) return null
  return {
    labels: ['Stock In', 'Stock Out'],
    datasets: [{
      data: [movement.value.totalStockIn, movement.value.totalStockOut],
      backgroundColor: ['rgba(16,185,129,0.8)', 'rgba(239,68,68,0.8)'],
      borderWidth: 0,
    }]
  }
})

async function load() {
  if (!dateRange.value?.[0]) return
  const from = dateRange.value[0].toISOString().split('T')[0]
  const to   = dateRange.value[1].toISOString().split('T')[0]
  const [m, v] = await Promise.all([
    api.get(`/reports/movement?from=${from}&to=${to}`),
    api.get('/reports/valuation'),
  ])
  movement.value = m.data
  valuation.value = v.data
}

onMounted(load)
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
.filter-card { margin-bottom: 20px; }
.report-kpis { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px; }
.kpi-box {
  border-radius: var(--radius); padding: 24px;
  text-align: center; border: 1px solid var(--border);
}
.kpi-box.green { background: rgba(16,185,129,0.1); }
.kpi-box.red   { background: rgba(239,68,68,0.1); }
.kpi-box.purple { background: rgba(99,102,241,0.1); }
.kpi-num { font-size: 32px; font-weight: 700; color: var(--text); }
.kpi-lbl { color: var(--text-muted); font-size: 13px; margin-top: 4px; }
.charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.card-title { font-weight: 600; color: var(--text); }
.pagination-wrapper { display: flex; justify-content: flex-end; margin-top: 16px; }
</style>
