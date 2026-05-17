<template>
  <div>
    <div class="view-header">
      <h3>Products</h3>
      <el-button type="primary" @click="openCreate" v-if="!auth.isViewer">
        <el-icon><Plus /></el-icon> Add Product
      </el-button>
    </div>

    <el-card>
      <div class="table-toolbar">
        <el-input v-model="search" placeholder="Search products..." prefix-icon="Search" style="width:260px" clearable />
      </div>
      <el-table :data="filtered" stripe v-loading="loading">
        <el-table-column label="SKU" prop="sku" width="120" />
        <el-table-column label="Name" prop="name" min-width="160" />
        <el-table-column label="Category" prop="category.name" width="130" />
        <el-table-column label="Supplier" prop="supplier.name" width="140" />
        <el-table-column label="Unit" prop="unit" width="80" />
        <el-table-column label="Min Stock" prop="minStock" width="100" />
        <el-table-column label="Price" width="110">
          <template #default="{ row }">{{ row.price ? '$' + row.price : '-' }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="140" v-if="!auth.isViewer">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)"><el-icon><Edit /></el-icon></el-button>
            <el-popconfirm title="Delete this product?" @confirm="deleteProduct(row.id)">
              <template #reference>
                <el-button size="small" type="danger"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- Dialog -->
    <el-dialog v-model="dialogVisible" :title="editId ? 'Edit Product' : 'New Product'" width="520px">
      <el-form :model="form" label-width="120px" ref="formRef">
        <el-form-item label="Name" prop="name" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="SKU" prop="sku" required><el-input v-model="form.sku" :disabled="!!editId" /></el-form-item>
        <el-form-item label="Category">
          <el-select v-model="form.categoryId" placeholder="Select category" clearable style="width:100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Supplier">
          <el-select v-model="form.supplierId" placeholder="Select supplier" clearable style="width:100%">
            <el-option v-for="s in suppliers" :key="s.id" :label="s.name" :value="s.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="Unit"><el-input v-model="form.unit" placeholder="pcs, kg, box..." /></el-form-item>
        <el-form-item label="Min Stock"><el-input-number v-model="form.minStock" :min="0" /></el-form-item>
        <el-form-item label="Price"><el-input-number v-model="form.price" :min="0" :precision="2" /></el-form-item>
        <el-form-item label="Description"><el-input v-model="form.description" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="save">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import api from '../api/axios'

const auth = useAuthStore()
const products = ref([])
const categories = ref([])
const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const search = ref('')
const dialogVisible = ref(false)
const editId = ref(null)
const form = ref({})
const formRef = ref()

const filtered = computed(() =>
  products.value.filter(p =>
    p.name.toLowerCase().includes(search.value.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.value.toLowerCase())
  )
)

async function load() {
  loading.value = true
  const [p, c, s] = await Promise.all([
    api.get('/products'), api.get('/categories'), api.get('/suppliers')
  ])
  products.value = p.data
  categories.value = c.data
  suppliers.value = s.data
  loading.value = false
}

function openCreate() {
  editId.value = null
  form.value = { name: '', sku: '', unit: 'pcs', minStock: 0, price: 0, description: '', categoryId: null, supplierId: null }
  dialogVisible.value = true
}

function openEdit(row) {
  editId.value = row.id
  form.value = {
    name: row.name, sku: row.sku, unit: row.unit,
    minStock: row.minStock, price: row.price, description: row.description,
    categoryId: row.category?.id, supplierId: row.supplier?.id
  }
  dialogVisible.value = true
}

async function save() {
  saving.value = true
  try {
    const payload = {
      ...form.value,
      category: form.value.categoryId ? { id: form.value.categoryId } : null,
      supplier: form.value.supplierId ? { id: form.value.supplierId } : null,
    }
    if (editId.value) {
      await api.put(`/products/${editId.value}`, payload)
      ElMessage.success('Product updated')
    } else {
      await api.post('/products', payload)
      ElMessage.success('Product created')
    }
    dialogVisible.value = false
    load()
  } catch (e) {
    ElMessage.error(e.response?.data?.error || 'Save failed')
  } finally { saving.value = false }
}

async function deleteProduct(id) {
  await api.delete(`/products/${id}`)
  ElMessage.success('Product deleted')
  load()
}

onMounted(load)
</script>

<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
.table-toolbar { margin-bottom: 16px; }
</style>
