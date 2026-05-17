<template>
  <div>
    <div class="view-header">
      <h3>Categories</h3>
      <el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon> Add Category</el-button>
    </div>
    <el-card>
      <el-table :data="categories" stripe v-loading="loading">
        <el-table-column label="ID" prop="id" width="60" />
        <el-table-column label="Name" prop="name" min-width="200" />
        <el-table-column label="Description" prop="description" min-width="250" />
        <el-table-column label="Created" width="180">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleDateString() }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="100">
          <template #default="{ row }">
            <el-popconfirm title="Delete category?" @confirm="remove(row.id)">
              <template #reference>
                <el-button size="small" type="danger"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <el-dialog v-model="dialogVisible" title="New Category" width="420px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Name" required><el-input v-model="form.name" /></el-form-item>
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
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import api from '../api/axios'
const categories = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const form = ref({ name: '', description: '' })
async function load() {
  loading.value = true
  const { data } = await api.get('/categories')
  categories.value = data
  loading.value = false
}
function openCreate() { form.value = { name: '', description: '' }; dialogVisible.value = true }
async function save() {
  saving.value = true
  try { await api.post('/categories', form.value); ElMessage.success('Category created'); dialogVisible.value = false; load() }
  catch (e) { ElMessage.error(e.response?.data?.error || 'Failed') }
  finally { saving.value = false }
}
async function remove(id) { await api.delete(`/categories/${id}`); ElMessage.success('Deleted'); load() }
onMounted(load)
</script>
<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
</style>
