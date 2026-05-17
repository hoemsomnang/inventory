<template>
  <div class="login-page">
    <div class="login-bg">
      <div class="blob blob-1"></div>
      <div class="blob blob-2"></div>
      <div class="blob blob-3"></div>
    </div>

    <div class="login-card">
      <div class="login-header">
        <div class="brand-icon"><el-icon><Box /></el-icon></div>
        <h1>Inventory<span>Pro</span></h1>
        <p>Stock Management System</p>
      </div>

      <el-form :model="form" :rules="rules" ref="formRef" class="login-form" @submit.prevent="submit">
        <el-form-item prop="username">
          <el-input
            v-model="form.username"
            placeholder="Username"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="Password"
            size="large"
            prefix-icon="Lock"
            show-password
            @keyup.enter="submit"
          />
        </el-form-item>
        <el-alert v-if="error" :title="error" type="error" show-icon :closable="false" class="mb-16" />
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="submit"
          class="login-btn"
        >
          Sign In
        </el-button>
      </el-form>

      <p class="login-hint">Default: <code>admin</code> / <code>admin123</code></p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'

const auth = useAuthStore()
const router = useRouter()
const formRef = ref()
const loading = ref(false)
const error = ref('')

const form = ref({ username: '', password: '' })
const rules = {
  username: [{ required: true, message: 'Please enter username', trigger: 'blur' }],
  password: [{ required: true, message: 'Please enter password', trigger: 'blur' }],
}

async function submit() {
  if (!await formRef.value.validate().catch(() => false)) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.value.username, form.value.password)
    ElMessage.success(`Welcome, ${auth.user.username}!`)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.error || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  position: relative;
  overflow: hidden;
}

.login-bg { position: absolute; inset: 0; }
.blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
  animation: float 8s ease-in-out infinite;
}
.blob-1 { width: 400px; height: 400px; background: var(--primary); top: -100px; left: -100px; animation-delay: 0s; }
.blob-2 { width: 300px; height: 300px; background: var(--success); bottom: -80px; right: -80px; animation-delay: 3s; }
.blob-3 { width: 250px; height: 250px; background: var(--warning); top: 50%; left: 60%; animation-delay: 5s; }

@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-30px) scale(1.05); }
}

.login-card {
  position: relative;
  z-index: 1;
  background: rgba(30, 30, 46, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 48px 40px;
  width: 100%;
  max-width: 420px;
  margin: 0 16px;
  box-shadow: var(--shadow);
}

.login-header { text-align: center; margin-bottom: 36px; }
.brand-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px; height: 64px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  border-radius: 18px;
  font-size: 32px;
  margin-bottom: 16px;
  box-shadow: var(--glow);
}
.login-header h1 { font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 6px; }
.login-header h1 span { color: var(--primary); }
.login-header p { color: var(--text-muted); font-size: 14px; }

.login-form { display: flex; flex-direction: column; gap: 4px; }

.login-btn {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px !important;
  margin-top: 8px;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark)) !important;
  border: none !important;
  box-shadow: var(--glow);
  transition: transform 0.2s, box-shadow 0.2s !important;
}
.login-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.5) !important; }

.login-hint {
  text-align: center;
  margin-top: 20px;
  color: var(--text-muted);
  font-size: 13px;
}
.login-hint code {
  background: var(--surface-3);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--primary-light);
  font-size: 12px;
}
.mb-16 { margin-bottom: 16px; }
</style>
