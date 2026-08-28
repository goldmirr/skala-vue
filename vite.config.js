import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    // element-plus 를 통째로(app.use) 쓰고 있어서 그 청크 하나가 900kB 를 넘는다.
    // 온디맨드 import(unplugin) 로 줄일 수 있지만 이번 과제 범위 밖이라 경고 기준만 올렸다
    chunkSizeWarningLimit: 1100,
    rolldownOptions: {
      output: {
        // Element Plus 가 커서 index 청크가 900kB 를 넘는다.
        // 라이브러리 코드는 자주 안 바뀌니 따로 떼어서 브라우저 캐시를 살린다
        advancedChunks: {
          groups: [
            { name: 'element-plus', test: /node_modules[\\/]element-plus/ },
            { name: 'vendor', test: /node_modules/ },
          ],
        },
      },
    },
  },
})
