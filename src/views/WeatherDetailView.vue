<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useWeatherStore } from '@/stores/weatherStore'
import { useConfigStore } from '@/stores/configStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useShortcuts } from '@/composables/useShortcuts'
import { iconUrl, formatClock, statusGradient, DUST_COLOR } from '@/utils/weather'

/* =========================================================
   WeatherDetailView.vue - 지역별 상세 기상 관측 페이지

   라우터의 동적 경로 매칭(/weather/:cityId)으로 들어오는 페이지.
   주소에 담겨온 도시ID(cityId)를 기반으로 Mount 시점에 도시 객체를 골라낸다.

   과제 4 때는 이 파일 안에 Mock DB(WEATHER_DB)를 따로 들고 있었는데,
   과제 6에서 weatherStore 로 옮기면서 메인 카드와 완전히 같은 데이터를 보게 됐다.
   (API 키가 없을 때의 Mock 값은 data/cities.js 에 남아 있다)

   주소창에 /weather/city_03 을 직접 쳐서 들어오면 store 가 비어 있으므로
   (status === 'idle') 이때는 loadAll() 을 먼저 부른 뒤 골라낸다.
   ========================================================= */

const route = useRoute()
const router = useRouter()

const weatherStore = useWeatherStore()
const configStore = useConfigStore()
const historyStore = useHistoryStore()
const favoriteStore = useFavoriteStore()

const { status } = storeToRefs(weatherStore)

// 골라낸 도시 객체를 담아둘 그릇 (못 찾으면 null 유지)
const city = ref(null)
const isFavorite = computed(() => (city.value ? favoriteStore.isFavorite(city.value.id) : false))

/* ===== Mount 시점에 도시 선택 ===== */
onMounted(async () => {
  // 직접 진입이면 store 가 비어 있으니 먼저 채운다
  if (status.value === 'idle') await weatherStore.loadAll()

  // /weather/city_01 로 들어왔다면 route.params.cityId === 'city_01'
  // store 안의 객체는 반응형이라, 여기서 꺼내 둔 뒤 새로고침으로 값이 바뀌어도 화면에 반영된다
  city.value = weatherStore.cityById(route.params.cityId)

  // [추가 Store 활용] 방문 기록을 historyStore 에 남긴다
  if (city.value) {
    historyStore.addRecord({ id: city.value.id, name: city.value.name, icon: city.value.icon })
  }
})

/* ===== 표시용 값들 ===== */
const displayTemp = computed(() => (city.value ? configStore.convertTemp(city.value.temp) : 0))
const feelsLike = computed(() =>
  city.value?.feelsLike != null ? configStore.convertTemp(city.value.feelsLike) : null,
)
const sunrise = computed(() => formatClock(city.value?.sunrise, city.value?.tz))
const sunset = computed(() => formatClock(city.value?.sunset, city.value?.tz))

const bannerStyle = computed(() =>
  city.value?.img
    ? { backgroundImage: `url(${city.value.img})`, backgroundPosition: city.value.pos }
    : { backgroundImage: statusGradient(city.value?.status) },
)

// 미세먼지 게이지: 매우나쁨 기준(PM10 150 / PM2.5 75)을 100% 로 잡았다
const pm10Percent = computed(() =>
  city.value?.pm10 == null ? 0 : Math.min(100, Math.round((city.value.pm10 / 150) * 100)),
)
const pm25Percent = computed(() =>
  city.value?.pm25 == null ? 0 : Math.min(100, Math.round((city.value.pm25 / 75) * 100)),
)

const goHome = () => {
  router.push('/')
}

const toggleFavorite = () => {
  if (city.value) favoriteStore.toggle(city.value.id)
}

// Esc → 메인으로 (모달 닫기처럼 "뒤로 가기" 느낌으로 통일)
useShortcuts({
  Escape: goHome,
})
</script>

<template>
  <div class="page">
    <!-- 주소로 바로 들어와서 store 를 채우는 중 -->
    <div v-if="status === 'loading' && !city?.live" class="detail-box">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- ===== 정상: 도시를 찾았을 때 ===== -->
    <div v-else-if="city" class="detail-box">
      <div class="head">
        <h3>📊 {{ city.name }} 상세 기상 관측 정보</h3>
        <el-tag v-if="city.live" type="success" effect="light">실시간</el-tag>
        <el-tag v-else type="info" effect="light">샘플 데이터</el-tag>
      </div>

      <!-- 도시 사진 배너 (검색으로 추가한 도시는 날씨별 그라데이션) -->
      <div class="photo-banner" :style="bannerStyle">
        <p class="banner-title">{{ city.icon }} {{ city.name }}</p>
        <el-button class="fav-btn" circle size="large" :title="isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'" @click="toggleFavorite">
          {{ isFavorite ? '⭐' : '☆' }}
        </el-button>
      </div>

      <!-- 관측 수치: 과제 4 의 <p> 나열을 el-descriptions 표로 바꿨다 -->
      <el-descriptions :column="2" border size="large" class="desc">
        <el-descriptions-item label="📍 지정 지역" :span="2">{{ city.region }}</el-descriptions-item>
        <el-descriptions-item label="🌡 실시간 기온">
          <strong>{{ displayTemp }}{{ configStore.unitSymbol }}</strong>
          <span v-if="feelsLike != null" class="muted"> (체감 {{ feelsLike }}{{ configStore.unitSymbol }})</span>
        </el-descriptions-item>
        <el-descriptions-item label="기상 현황">
          {{ city.icon }} {{ city.status }}
          <span v-if="city.description" class="muted">· {{ city.description }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="💧 대기 습도">{{ city.humidity }}%</el-descriptions-item>
        <el-descriptions-item label="🍃 현재 풍속">{{ city.wind }} m/s</el-descriptions-item>
        <el-descriptions-item label="기압">{{ city.pressure ?? '-' }} hPa</el-descriptions-item>
        <el-descriptions-item label="☔ 12시간 내 강수확률">{{ city.rainProb }}%</el-descriptions-item>
        <el-descriptions-item label="🌅 일출">{{ sunrise }}</el-descriptions-item>
        <el-descriptions-item label="🌇 일몰">{{ sunset }}</el-descriptions-item>
      </el-descriptions>

      <!-- 미세먼지 (Open-Meteo Air Quality API) -->
      <h4 class="section-title">😷 미세먼지 <span class="muted">(Open-Meteo)</span></h4>
      <div class="dust-row">
        <span class="dust-label">PM10 · {{ city.pm10 ?? '-' }} ㎍/㎥</span>
        <el-progress :percentage="pm10Percent" :stroke-width="14" :color="DUST_COLOR[city.dust]" :format="() => city.dust" />
      </div>
      <div class="dust-row">
        <span class="dust-label">PM2.5 · {{ city.pm25 ?? '-' }} ㎍/㎥</span>
        <el-progress :percentage="pm25Percent" :stroke-width="14" :color="DUST_COLOR[city.dust25]" :format="() => city.dust25" />
      </div>

      <!-- 3시간 간격 예보 (OpenWeather forecast API) -->
      <h4 class="section-title">🕒 3시간 간격 예보 <span class="muted">(앞으로 24시간)</span></h4>
      <div v-if="city.forecast.length > 0" class="forecast-strip">
        <div
          v-for="slot in city.forecast"
          :key="slot.time"
          class="forecast-item"
          :class="{ rainy: slot.pop >= 60 }"
        >
          <p class="fc-time">{{ slot.label }}</p>
          <img :src="iconUrl(slot.iconCode)" :alt="slot.status" class="fc-icon" />
          <p class="fc-temp">{{ configStore.convertTemp(slot.temp) }}°</p>
          <p class="fc-status">{{ slot.status }}</p>
          <p class="fc-pop">💧 {{ slot.pop }}%</p>
        </div>
      </div>
      <el-empty v-else :image-size="60" description="예보 데이터가 없습니다 (샘플 데이터 모드)" />

      <div class="btn-row">
        <el-button type="primary" size="large" @click="goHome">← 메인 대시보드로 돌아가기 (Esc)</el-button>
      </div>
    </div>

    <!-- ===== 예외: 주소는 패턴에 맞지만 없는 도시 코드일 때 ===== -->
    <!-- 예) /weather/city_99 → 라우트는 매칭되지만 데이터가 없다 -->
    <div v-else class="detail-box empty">
      <h3>🤔 관측소를 찾을 수 없습니다</h3>
      <p>
        <code>{{ route.params.cityId }}</code> 는 등록되지 않은 도시 코드입니다.
      </p>
      <el-button type="primary" @click="goHome">← 메인 대시보드로 돌아가기</el-button>
    </div>
  </div>
</template>

<style scoped>
.page {
  font-size: 18px;
}
.detail-box {
  background-color: white;
  border-radius: 16px;
  padding: 24px;
}
.head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
h3 {
  margin: 0;
  font-size: 22px;
}
.muted {
  color: #888;
  font-size: 14px;
  font-weight: normal;
}

/* 도시 사진 배너 */
.photo-banner {
  position: relative;
  height: 170px;
  border-radius: 12px;
  background-size: cover;
  margin-bottom: 16px;
  overflow: hidden;
}
.banner-title {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  margin: 0;
  padding: 14px 18px;
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.6), transparent);
  color: white;
  font-size: 26px;
  font-weight: bold;
}
.fav-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  font-size: 20px;
}

.desc {
  margin-bottom: 20px;
}
.section-title {
  margin: 18px 0 10px;
  font-size: 18px;
}

/* 미세먼지 게이지 */
.dust-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 8px;
}
.dust-label {
  flex-shrink: 0;
  width: 170px;
  font-size: 15px;
}
.dust-row .el-progress {
  flex: 1;
}

/* 예보 카드 가로 스크롤 */
.forecast-strip {
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
}
.forecast-item {
  flex: 0 0 96px;
  padding: 10px 6px;
  border-radius: 12px;
  background-color: #f1f5fa;
  text-align: center;
  font-size: 14px;
}
.forecast-item.rainy {
  background-color: #dbe9ff;
}
.forecast-item p {
  margin: 2px 0;
}
.fc-time {
  color: #5a6b7d;
}
.fc-icon {
  width: 50px;
  height: 50px;
}
.fc-temp {
  font-size: 18px;
  font-weight: bold;
}
.fc-status {
  font-size: 13px;
}
.fc-pop {
  font-size: 13px;
  color: #2f6bb5;
}

.btn-row {
  margin-top: 22px;
}

/* 없는 도시 코드일 때 */
.empty {
  text-align: center;
  padding: 40px 24px;
}
.empty p {
  color: #666;
  margin-bottom: 20px;
}
code {
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #fdf3f3;
  color: #b03a3a;
}
</style>
