import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { BASE_CITIES, EMPTY_MOCK } from '@/data/cities'
import {
  hasApiKey,
  getCurrentWeather,
  getForecast,
  getAirQuality,
  searchCity,
} from '@/api/weatherApi'
import { toStatus, toEmoji, pm10Grade, pm25Grade, formatHourLabel } from '@/utils/weather'

/* =========================================================
   weatherStore - 실시간 날씨 데이터 저장소

   과제 4까지는 WeatherHomeView 가 날씨 배열을 직접 들고 있었는데,
   axios 로 진짜 데이터를 받기 시작하니까 문제가 생겼다.
   - 메인 → 상세 → 메인으로 돌아올 때마다 API 를 다시 부른다
   - 상세 페이지도 같은 데이터가 필요하다
   그래서 날씨 배열을 store 로 올렸다. 한 번 받아두면 페이지를 오가도 유지된다.

   상태 흐름: idle → loading → ready (실패해도 ready, 대신 mock 값 유지)
   ========================================================= */

const CUSTOM_KEY = 'skala-vue:custom-cities'

// localStorage 에 저장해둔, 검색으로 추가한 도시들 복원
const restoreCustomCities = () => {
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_KEY)) ?? []
  } catch {
    return []
  }
}

// 기본 정보 + mock 값 을 합쳐서 카드가 바로 그릴 수 있는 형태로 만든다
const buildCity = (base) => ({
  ...base,
  ...(base.mock ?? EMPTY_MOCK),
  live: false, // 실시간 데이터로 채워졌는지
  description: '',
  feelsLike: null,
  pressure: null,
  iconCode: null,
  sunrise: null,
  sunset: null,
  tz: 32400,
  pm10: null,
  pm25: null,
  dust25: '정보없음',
  forecast: [],
})

/* ===== API 응답 → 카드 데이터 변환 ===== */
const mapCurrent = (cur) => {
  const w = cur.weather[0]
  const status = toStatus(w.main, cur.clouds?.all)
  return {
    temp: Math.round(cur.main.temp),
    feelsLike: Math.round(cur.main.feels_like),
    humidity: cur.main.humidity,
    pressure: cur.main.pressure,
    wind: cur.wind?.speed ?? 0,
    status,
    description: w.description,
    icon: toEmoji(status, w.icon),
    iconCode: w.icon,
    sunrise: cur.sys?.sunrise ?? null,
    sunset: cur.sys?.sunset ?? null,
    tz: cur.timezone ?? 32400,
  }
}

const mapForecast = (fc, tz) => {
  const forecast = fc.list.map((item) => {
    const w = item.weather[0]
    const status = toStatus(w.main, item.clouds?.all)
    return {
      time: item.dt,
      label: formatHourLabel(item.dt, tz),
      temp: Math.round(item.main.temp),
      pop: Math.round((item.pop ?? 0) * 100), // 강수확률 0~1 → %
      status,
      icon: toEmoji(status, w.icon),
      iconCode: w.icon,
      rain: item.rain?.['3h'] ?? 0,
    }
  })
  // 카드/우산 목록에서 쓸 강수확률 = 앞으로 12시간(4칸) 중 최대값
  const rainProb = Math.max(0, ...forecast.slice(0, 4).map((f) => f.pop))
  return { forecast, rainProb }
}

const mapAir = (air) => {
  const pm10 = air?.current?.pm10 ?? null
  const pm25 = air?.current?.pm2_5 ?? null
  return { pm10, pm25, dust: pm10Grade(pm10), dust25: pm25Grade(pm25) }
}

export const useWeatherStore = defineStore('weather', () => {
  /* ===== State ===== */
  const cities = ref([...BASE_CITIES, ...restoreCustomCities()].map(buildCity))
  const status = ref('idle')
  const errorMessage = ref('')
  const lastUpdated = ref(null)

  /* ===== Getters ===== */
  const isLive = computed(() => cities.value.some((c) => c.live))
  const liveCount = computed(() => cities.value.filter((c) => c.live).length)
  const cityById = (id) => cities.value.find((c) => c.id === id) ?? null
  const hottestCity = computed(() =>
    cities.value.reduce((best, c) => (best === null || c.temp > best.temp ? c : best), null),
  )

  /* ===== Actions ===== */
  // 도시 하나에 대해 현재 날씨 / 예보 / 미세먼지 를 동시에 요청한다.
  // 미세먼지는 보조 정보라 실패해도 나머지는 살리도록 catch 로 감쌌다.
  async function loadCity(city) {
    const [cur, fc, air] = await Promise.all([
      getCurrentWeather(city.lat, city.lon),
      getForecast(city.lat, city.lon),
      getAirQuality(city.lat, city.lon).catch(() => null),
    ])
    const current = mapCurrent(cur)
    Object.assign(city, current, mapForecast(fc, current.tz), mapAir(air), { live: true })
  }

  async function loadAll() {
    if (!hasApiKey) {
      errorMessage.value = 'OpenWeather API 키가 설정되지 않아 샘플 데이터를 보여줍니다.'
      status.value = 'ready'
      return
    }
    status.value = 'loading'
    errorMessage.value = ''

    // allSettled: 한 도시가 실패해도 나머지 도시는 정상적으로 채워진다
    const results = await Promise.allSettled(cities.value.map((city) => loadCity(city)))
    const failed = results.find((r) => r.status === 'rejected')
    if (failed) errorMessage.value = failed.reason?.message ?? '일부 도시를 불러오지 못했습니다.'

    lastUpdated.value = new Date()
    status.value = 'ready'
  }

  // 검색창에서 Enter → Geocoding 으로 좌표를 찾아 목록에 추가
  async function addCity(name) {
    if (!hasApiKey) throw new Error('API 키가 없어서 도시를 검색할 수 없습니다.')

    const [found] = await searchCity(name.trim())
    if (!found) throw new Error(`'${name}' 도시를 찾을 수 없습니다.`)

    // 좌표가 거의 같으면 이미 있는 도시로 본다 (서울을 또 추가하는 것 방지)
    const dup = cities.value.find(
      (c) => Math.abs(c.lat - found.lat) < 0.05 && Math.abs(c.lon - found.lon) < 0.05,
    )
    if (dup) throw new Error(`${dup.name}은(는) 이미 목록에 있습니다.`)

    const base = {
      id: `geo_${Date.now()}`,
      name: found.local_names?.ko ?? found.name,
      region: [found.state, found.country].filter(Boolean).join(' '),
      lat: found.lat,
      lon: found.lon,
      img: null,
      pos: null,
      custom: true,
    }
    cities.value.push(buildCity(base))
    // push 한 원본이 아니라 배열 안의 (반응형 프록시) 객체를 꺼내서 채워야 화면이 갱신된다
    const city = cities.value[cities.value.length - 1]
    await loadCity(city)
    persistCustomCities()
    return city
  }

  function removeCity(id) {
    cities.value = cities.value.filter((c) => c.id !== id)
    persistCustomCities()
  }

  function persistCustomCities() {
    const custom = cities.value
      .filter((c) => c.custom)
      .map(({ id, name, region, lat, lon, custom }) => ({ id, name, region, lat, lon, custom }))
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(custom))
  }

  return {
    cities,
    status,
    errorMessage,
    lastUpdated,
    isLive,
    liveCount,
    hottestCity,
    cityById,
    loadAll,
    addCity,
    removeCity,
  }
})
