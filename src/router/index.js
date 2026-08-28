import { createRouter, createWebHistory } from 'vue-router'

// 메인 대시보드는 무조건 처음 보는 화면이므로 즉시 로딩한다
import WeatherHomeView from '@/views/WeatherHomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ===== 1) 메인 날씨 대시보드 =====
    {
      path: '/',
      name: 'weather-home',
      component: WeatherHomeView,
    },

    // ===== 2) 동적 경로 매칭 + 지연 로딩(Lazy Loading) =====
    // :cityId 자리에 오는 값(city_01 등)은 route.params.cityId로 꺼낸다.
    // component에 () => import(...)를 적으면 이 페이지를 처음 방문하는
    // 순간에야 파일을 내려받는다 (빌드 시 별도 청크로 분리됨)
    {
      path: '/weather/:cityId',
      name: 'weather-detail',
      component: () => import('@/views/WeatherDetailView.vue'),
    },

    // ===== 3) 서비스 소개 (정적 페이지, 지연 로딩) =====
    {
      path: '/about',
      name: 'weather-about',
      component: () => import('@/views/WeatherAboutView.vue'),
    },

    // ===== 4) Catch-all Route =====
    // 위 어디에도 매칭되지 않은 모든 주소를 받아내는 마지막 그물.
    // 반드시 배열의 맨 마지막에 둔다
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
})

export default router
