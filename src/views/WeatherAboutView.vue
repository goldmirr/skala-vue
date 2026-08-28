<script setup>
/* =========================================================
   WeatherAboutView.vue - 서비스 소개용 정적 페이지 (/about)

   반응형 데이터가 하나도 없는 순수 정적 페이지.
   메인으로 돌아가는 버튼은 RouterLink로 처리했다.
   (JS 코드로 이동할 필요가 없는 단순 링크는 RouterLink가 정석)
   ========================================================= */
</script>

<template>
  <div class="page">
    <div class="about-box">
      <h3>ℹ️ 서비스 소개</h3>

      <p class="intro">
        SKALA Vue.js 과정 4일 동안 만든 실습용 날씨 대시보드입니다. 1일차의 mock 데이터
        카드에서 시작해서 컴포넌트 분리 → 라우터 → 스토어 → 실제 API → UI 라이브러리 순서로
        같은 앱을 계속 고쳐 나갔습니다.
      </p>

      <h4>데이터 출처</h4>
      <ul>
        <li>
          <a href="https://openweathermap.org/" target="_blank" rel="noopener">OpenWeatherMap</a>
          — 현재 날씨, 3시간 간격 예보, 도시 이름 → 좌표(Geocoding)
        </li>
        <li>
          <a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noopener">Open-Meteo Air Quality</a>
          — 미세먼지 PM10 / PM2.5 (키 없이 사용 가능)
        </li>
        <li>도시 사진 — Wikimedia Commons CC0 (<code>src/assets/images/CREDITS.md</code>)</li>
      </ul>

      <h4>구성</h4>
      <ul>
        <li><code>components/exercise/</code> 폴더 내부의 독립 부품 컴포넌트 (props / emits / slot)</li>
        <li>Vue Router — 동적 경로 <code>/weather/:cityId</code>, 지연 로딩, Catch-all</li>
        <li>Pinia — 단위 설정(configStore) · 날씨 데이터(weatherStore) · 즐겨찾기 · 방문 기록</li>
        <li>axios 인스턴스 + interceptor 로 API 키 자동 주입 (<code>src/api/weatherApi.js</code>)</li>
        <li>Element Plus — 입력창, 태그, 스위치, 표, 다이얼로그, 토스트 등</li>
        <li>키보드/마우스 조작 안내 — 상단의 ⌨️ 버튼으로 확인 (<kbd>/</kbd> <kbd>Enter</kbd> <kbd>Esc</kbd>, 더블클릭·오른쪽 클릭)</li>
      </ul>

      <!-- 단순 이동은 RouterLink / 조건이 붙는 이동은 router.push -->
      <RouterLink to="/" class="home-btn">대시보드 홈으로 이동</RouterLink>
    </div>
  </div>
</template>

<style scoped>
.page {
  font-size: 18px;
}
.about-box {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
}
h3 {
  margin: 0 0 16px;
  font-size: 22px;
}
h4 {
  margin: 18px 0 8px;
  font-size: 17px;
  color: #5a6b7d;
}
.intro {
  margin: 0 0 14px;
  line-height: 1.6;
}
ul {
  margin: 0 0 8px;
  padding-left: 24px;
}
li {
  margin-bottom: 8px;
}
a {
  color: #2f6bb5;
}
code,
kbd {
  padding: 2px 6px;
  border-radius: 4px;
  background-color: #fff3cd;
  font-size: 15px;
}
.home-btn {
  display: block;
  margin-top: 20px;
  padding: 13px;
  border-radius: 8px;
  background-color: #4a90d9;
  color: white;
  text-align: center;
  text-decoration: none;
  font-size: 16px;
}
.home-btn:hover {
  background-color: #3a7bc0;
}
</style>
