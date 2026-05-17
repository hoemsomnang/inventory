<template>
  <div>
    <div class="view-header">
      <h3>Suppliers</h3>
      <el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon> Add Supplier</el-button>
    </div>
    <el-card>
      <el-table :data="suppliers" stripe v-loading="loading">
        <el-table-column label="Name" prop="name" min-width="160" />
        <el-table-column label="Contact" prop="contact" width="140" />
        <el-table-column label="Phone" prop="phone" width="130" />
        <el-table-column label="Email" prop="email" min-width="180" />
        <el-table-column label="Address" prop="address" show-overflow-tooltip />
        <el-table-column label="Actions" width="140">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)"><el-icon><Edit /></el-icon></el-button>
            <el-popconfirm title="Delete supplier?" @confirm="remove(row.id)">
              <template #reference>
                <el-button size="small" type="danger"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" :title="editId ? 'Edit Supplier' : 'New Supplier'" width="480px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Name" required><el-input v-model="form.name" /></el-form-item>
        <el-form-item label="Contact"><el-input v-model="form.contact" /></el-form-item>
        <el-form-item label="Phone"><el-input v-model="form.phone" /></el-form-item>
        <el-form-item label="Email"><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="Address"><el-input v-model="form.address" type="textarea" :rows="2" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">Cancel</el-button>
        <el-button type="primary" :loading="saving" @click="save">Save</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/axios'
const suppliers = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editId = ref(null)
const form = ref({})
async function load() {
  loading.value = true
  const { data } = await api.get('/suppliers')
  suppliers.value = data
  loading.value = false
}
function openCreate() { editId.value = null; form.value = { name:'',contact:'',phone:'',email:'',address:'' }; dialogVisible.value = true }
function openEdit(row) { editId.value = row.id; form.value = { ...row }; dialogVisible.value = true }
async function save() {
  saving.value = true
  try {
    if (editId.value) { await api.put(`/suppliers/${editId.value}`, form.value); ElMessage.success('Updated') }
    else { await api.post('/suppliers', form.value); ElMessage.success('Created') }
    dialogVisible.value = false; load()
  } catch (e) { ElMessage.error(e.response?.data?.error || 'Failed') }
  finally { saving.value = false }
}
async function remove(id) { await api.delete(`/suppliers/${id}`); ElMessage.success('Deleted'); load() }
onMounted(load)
</script>
<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
</style>
