<template>
  <div>
    <div class="view-header">
      <h3>User Management</h3>
      <el-button type="primary" @click="openCreate"><el-icon><Plus /></el-icon> Add User</el-button>
    </div>
    <el-card>
      <el-table :data="users" stripe v-loading="loading">
        <el-table-column label="Username" prop="username" min-width="130" />
        <el-table-column label="Email" prop="email" min-width="200" />
        <el-table-column label="Role" width="160">
          <template #default="{ row }">
            <el-tag :type="row.role === 'ADMIN' ? 'danger' : row.role === 'WAREHOUSE_STAFF' ? 'warning' : 'info'" size="small">
              {{ row.role }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Status" width="100">
          <template #default="{ row }">
            <el-tag :type="row.active ? 'success' : 'info'" size="small">{{ row.active ? 'Active' : 'Inactive' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="Created" width="160">
          <template #default="{ row }">{{ new Date(row.createdAt).toLocaleDateString() }}</template>
        </el-table-column>
        <el-table-column label="Actions" width="140">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)"><el-icon><Edit /></el-icon></el-button>
            <el-popconfirm title="Deactivate this user?" @confirm="remove(row.id)">
              <template #reference>
                <el-button size="small" type="danger" :disabled="row.username === 'admin'"><el-icon><Delete /></el-icon></el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="editId ? 'Edit User' : 'New User'" width="440px">
      <el-form :model="form" label-width="120px">
        <el-form-item label="Username" v-if="!editId" required><el-input v-model="form.username" /></el-form-item>
        <el-form-item label="Email" required><el-input v-model="form.email" /></el-form-item>
        <el-form-item label="Password" :required="!editId">
          <el-input v-model="form.password" type="password" :placeholder="editId ? 'Leave blank to keep' : ''" show-password />
        </el-form-item>
        <el-form-item label="Role" required>
          <el-select v-model="form.role" style="width:100%">
            <el-option label="Admin" value="ADMIN" />
            <el-option label="Warehouse Staff" value="WAREHOUSE_STAFF" />
            <el-option label="Viewer" value="VIEWER" />
          </el-select>
        </el-form-item>
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
const users = ref([])
const loading = ref(false)
const saving = ref(false)
const dialogVisible = ref(false)
const editId = ref(null)
const form = ref({})
async function load() {
  loading.value = true
  const { data } = await api.get('/users')
  users.value = data
  loading.value = false
}
function openCreate() { editId.value = null; form.value = { username:'',email:'',password:'',role:'WAREHOUSE_STAFF' }; dialogVisible.value = true }
function openEdit(row) { editId.value = row.id; form.value = { email: row.email, role: row.role, password: '' }; dialogVisible.value = true }
async function save() {
  saving.value = true
  try {
    if (editId.value) { await api.put(`/users/${editId.value}`, form.value); ElMessage.success('User updated') }
    else { await api.post('/users', form.value); ElMessage.success('User created') }
    dialogVisible.value = false; load()
  } catch (e) { ElMessage.error(e.response?.data?.error || 'Failed') }
  finally { saving.value = false }
}
async function remove(id) { await api.delete(`/users/${id}`); ElMessage.success('User deactivated'); load() }
onMounted(load)
</script>
<style scoped>
.view-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.view-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
</style>
