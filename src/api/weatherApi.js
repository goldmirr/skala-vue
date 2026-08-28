import axios from 'axios'

/* =========================================================
   weatherApi.js - 외부 API 호출 모음

   컴포넌트마다 axios.get(...) 을 흩뿌리지 않고 여기 한 곳에 모았다.
   axios.create 로 인스턴스를 만들면
   - baseURL / timeout 을 한 번만 적으면 되고
   - interceptor 로 모든 요청에 API 키를 자동으로 붙일 수 있다

   1) OpenWeatherMap
      - /data/2.5/weather   현재 날씨
      - /data/2.5/forecast  3시간 간격 예보 (5일치, cnt 로 개수 제한)
      - /geo/1.0/direct     도시 이름 → 위도/경도 (Geocoding)
   2) Open-Meteo Air Quality (키 없이 사용 가능)
      - /v1/air-quality     미세먼지 PM10 / PM2.5
   ========================================================= */

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY

// .env.example 을 복사만 하고 키를 안 바꾼 경우도 "키 없음"으로 취급
export const hasApiKey = Boolean(API_KEY) && !API_KEY.includes('여기에')

/* ===== OpenWeatherMap 인스턴스 ===== */
const owm = axios.create({
  baseURL: 'https://api.openweathermap.org',
  timeout: 8000,
})

// 요청 인터셉터: 매 요청마다 appid / units / lang 을 자동으로 붙인다
owm.interceptors.request.use((config) => {
  config.params = { appid: API_KEY, units: 'metric', lang: 'kr', ...config.params }
  return config
})

// 응답 인터셉터: 성공이면 response.data 만 돌려주고,
// 실패면 화면에 바로 띄울 수 있는 한글 메시지로 바꿔서 던진다
owm.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    let message = '날씨 정보를 가져오지 못했습니다.'
    if (status === 401) message = 'API 키가 없거나 아직 활성화되지 않았습니다. (.env 확인)'
    else if (status === 404) message = '해당 위치의 날씨 정보가 없습니다.'
    else if (status === 429) message = 'API 호출 한도를 넘었습니다. 잠시 후 다시 시도하세요.'
    else if (error.code === 'ECONNABORTED') message = '요청 시간이 초과되었습니다.'
    console.error('[OpenWeather]', status ?? error.code, error.message)
    return Promise.reject(new Error(message))
  },
)

export const getCurrentWeather = (lat, lon) => owm.get('/data/2.5/weather', { params: { lat, lon } })

// cnt=8 → 3시간 × 8 = 앞으로 24시간 예보
export const getForecast = (lat, lon, cnt = 8) =>
  owm.get('/data/2.5/forecast', { params: { lat, lon, cnt } })

// 도시 이름으로 좌표 검색. 한글 이름도 잘 찾는다 (예: '대전', '광주')
export const searchCity = (q) => owm.get('/geo/1.0/direct', { params: { q, limit: 1 } })

/* ===== Open-Meteo 미세먼지 (키 불필요) ===== */
const meteo = axios.create({
  baseURL: 'https://air-quality-api.open-meteo.com',
  timeout: 8000,
})

export const getAirQuality = async (lat, lon) => {
  const { data } = await meteo.get('/v1/air-quality', {
    params: { latitude: lat, longitude: lon, current: 'pm10,pm2_5', timezone: 'Asia/Seoul' },
  })
  return data
}
