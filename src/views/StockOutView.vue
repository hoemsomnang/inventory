<template>
  <div>
    <div class="view-header">
      <h3>Stock Out — Dispatch Goods</h3>
    </div>
    <div class="form-grid">
      <el-card class="form-card">
        <el-form :model="form" label-width="140px" ref="formRef">
          <el-form-item label="Product" prop="productId" required>
            <el-select v-model="form.productId" placeholder="Select product" filterable style="width:100%"
              @change="onProductChange">
              <el-option v-for="p in products" :key="p.id" :label="`[${p.sku}] ${p.name}`" :value="p.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="Available Stock">
            <span :class="['stock-badge', currentStock === 0 ? 'danger' : 'normal']">
              {{ currentStock ?? '-' }} {{ selectedProduct?.unit || '' }}
            </span>
          </el-form-item>
          <el-form-item label="Quantity Out" prop="quantity" required>
            <el-input-number v-model="form.quantity" :min="1" :max="currentStock || 9999" style="width:160px" />
          </el-form-item>
          <el-form-item label="Reference No.">
            <el-input v-model="form.referenceNo" placeholder="SO-2024-001" />
          </el-form-item>
          <el-form-item label="Notes">
            <el-input v-model="form.notes" type="textarea" :rows="3" />
          </el-form-item>
          <el-form-item>
            <el-button type="danger" size="large" :loading="saving" @click="submit" style="width:100%"
              :disabled="currentStock === 0">
              <el-icon><Upload /></el-icon> &nbsp; Confirm Stock Out
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <el-card class="recent-card">
        <template #header><span class="card-title">Recent Stock Out</span></template>
        <div v-for="tx in recentOut" :key="tx.id" class="tx-item">
          <div>
            <div class="tx-product">{{ tx.product?.name }}</div>
            <div class="tx-ref">{{ tx.referenceNo || '—' }} · {{ formatDate(tx.createdAt) }}</div>
          </div>
          <el-tag type="danger">-{{ tx.quantity }}</el-tag>
        </div>
        <div v-if="recentOut.length === 0" class="empty-tx">No records yet</div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/axios'

const products = ref([])
const stockLevels = ref([])
const recentOut = ref([])
const saving = ref(false)
const currentStock = ref(null)
const selectedProduct = ref(null)
const form = ref({ productId: null, quantity: 1, referenceNo: '', notes: '' })

function onProductChange(id) {
  selectedProduct.value = products.value.find(p => p.id === id)
  const level = stockLevels.value.find(sl => sl.product?.id === id)
  currentStock.value = level ? level.quantity : 0
}

function formatDate(dt) { return new Date(dt).toLocaleString() }

async function submit() {
  if (!form.value.productId || form.value.quantity < 1) {
    ElMessage.warning('Please select product and enter quantity')
    return
  }
  saving.value = true
  try {
    await api.post('/stock/out', form.value)
    ElMessage.success('Stock Out recorded successfully!')
    form.value = { productId: null, quantity: 1, referenceNo: '', notes: '' }
    currentStock.value = null
    selectedProduct.value = null
    await loadData()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Failed to record stock out')
  } finally { saving.value = false }
}

async function loadData() {
  const [p, sl, tx] = await Promise.all([
    api.get('/products'),
    api.get('/stock/levels'),
    api.get('/stock/transactions'),
  ])
  products.value = p.data
  stockLevels.value = sl.data
  recentOut.value = tx.data.filter(t => t.type === 'OUT').slice(0, 10)
}

onMounted(loadData)
</script>

<style scoped>
.view-header { margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
.form-grid { display: grid; grid-template-columns: 1fr 360px; gap: 20px; }
.form-card, .recent-card { height: fit-content; }
.stock-badge { font-size: 20px; font-weight: 700; }
.stock-badge.normal { color: var(--success); }
.stock-badge.danger { color: var(--danger); }
.card-title { font-weight: 600; color: var(--text); }
.tx-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); }
.tx-item:last-child { border-bottom: none; }
.tx-product { font-size: 13px; font-weight: 500; color: var(--text); }
.tx-ref { font-size: 11px; color: var(--text-muted); margin-top: 2px; }
.empty-tx { text-align: center; color: var(--text-muted); padding: 20px; font-size: 13px; }
</style>
