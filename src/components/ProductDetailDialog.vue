<template>
  <el-dialog v-model="visible" title="Product Details" width="480px" class="detail-dialog">
    <div v-if="product" class="product-detail">
      <div class="detail-image">
        <el-image v-if="product.productImage" :src="product.productImage" fit="cover" style="width:120px;height:120px;border-radius:16px" />
        <div v-else class="no-image"><el-icon style="font-size:48px;color:#ccc"><Picture /></el-icon></div>
      </div>
      <h3 class="detail-name">{{ product.name }}</h3>
      <p v-if="product.description" class="detail-desc">{{ product.description }}</p>
      <div class="detail-grid">
        <div class="detail-item"><span class="label">Category</span><span class="value">{{ product.category?.name || '—' }}</span></div>
        <div class="detail-item"><span class="label">Supplier</span><span class="value">{{ product.supplier?.name || '—' }}</span></div>
        <div class="detail-item"><span class="label">Unit</span><span class="value">{{ product.unit || '—' }}</span></div>
        <div class="detail-item"><span class="label">Min Stock</span><span class="value">{{ product.minStock }}</span></div>
        <div class="detail-item"><span class="label">Price</span><span class="value price">{{ product.price ? '$' + product.price : '—' }}</span></div>
        <div class="detail-item"><span class="label">Status</span><span class="value"><el-tag :type="product.active !== false ? 'success' : 'danger'" size="small">{{ product.active !== false ? 'Active' : 'Inactive' }}</el-tag></span></div>
      </div>
      <!-- Optional: show stock info if passed -->
      <div v-if="stockQty !== null" class="stock-info">
        <span class="label">Current Stock</span>
        <span :class="['stock-value', stockQty <= (product.minStock || 0) ? 'low' : 'ok']">{{ stockQty }} {{ product.unit || '' }}</span>
      </div>
    </div>
    <template #footer>
      <el-button @click="visible = false">Close</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  product: { type: Object, default: null },
  stockQty: { type: Number, default: null },
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})
</script>

<style scoped>
.product-detail { text-align: center; }
.detail-image { display: flex; justify-content: center; margin-bottom: 16px; }
.no-image {
  width: 120px; height: 120px; border-radius: 16px; display: flex;
  align-items: center; justify-content: center; background: var(--surface-3, #f5f5f5);
}
.detail-name { font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 6px; }
.detail-desc { font-size: 13px; color: var(--text-muted); margin: 0 0 20px; }
.detail-grid {
  display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
  text-align: left; padding: 16px; background: var(--surface-3, #f5f5f5); border-radius: 12px;
}
.detail-item { display: flex; flex-direction: column; gap: 2px; }
.detail-item .label { font-size: 11px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
.detail-item .value { font-size: 14px; color: var(--text); font-weight: 500; }
.detail-item .value.price { color: var(--primary-light, #818cf8); font-weight: 700; }
.stock-info {
  display: flex; justify-content: center; align-items: center; gap: 10px;
  margin-top: 16px; padding: 12px; border-radius: 10px;
  background: var(--surface-3, #f5f5f5);
}
.stock-info .label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; }
.stock-value { font-size: 22px; font-weight: 700; }
.stock-value.ok { color: var(--success, #10b981); }
.stock-value.low { color: var(--danger, #ef4444); }
</style>
