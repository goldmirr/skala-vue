import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

// ===== Element Plus UI 라이브러리 =====
// ElementPlus: 모든 el-* 컴포넌트가 들어 있는 플러그인
// index.css : Element Plus 컴포넌트들의 스타일 (이걸 빼먹으면 모양이 깨진다)
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
// Vue 앱에 Element Plus 등록 → 이제 어떤 컴포넌트에서든 import 없이 <el-button> 등을 바로 쓸 수 있다
app.use(ElementPlus)

app.mount('#app')
