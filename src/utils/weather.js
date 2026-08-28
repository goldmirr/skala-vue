/* =========================================================
   weather.js - API 응답을 화면용 값으로 바꾸는 작은 함수들

   OpenWeather의 lang=kr 설명(description)이 "온흐림", "실 비"처럼
   어색하게 와서, 영어 main 값을 직접 한글로 매핑했다.
   ========================================================= */

const MAIN_KO = {
  Clear: '맑음',
  Clouds: '구름',
  Rain: '비',
  Drizzle: '이슬비',
  Thunderstorm: '천둥번개',
  Snow: '눈',
  Mist: '안개',
  Fog: '안개',
  Haze: '연무',
  Dust: '황사',
  Sand: '황사',
  Smoke: '연기',
  Squall: '돌풍',
  Tornado: '토네이도',
}

const EMOJI = {
  맑음: '☀️',
  구름: '⛅',
  흐림: '☁️',
  비: '🌧️',
  이슬비: '🌦️',
  천둥번개: '⛈️',
  눈: '❄️',
  안개: '🌫️',
  연무: '🌫️',
  황사: '🌫️',
}

// Clouds 라도 구름량(clouds.all)이 85% 넘으면 '흐림'으로 구분
export const toStatus = (main, clouds = 0) => {
  if (main === 'Clouds' && clouds >= 85) return '흐림'
  return MAIN_KO[main] ?? main
}

// 아이콘 코드가 'n'으로 끝나면 밤 → 맑음일 때만 달로 바꿔준다
export const toEmoji = (status, iconCode = '') => {
  if (status === '맑음' && iconCode.endsWith('n')) return '🌙'
  return EMOJI[status] ?? '🌡️'
}

// OpenWeather 가 제공하는 날씨 아이콘 이미지 주소
export const iconUrl = (code) => `https://openweathermap.org/img/wn/${code}@2x.png`

/* ===== 미세먼지 등급 (환경부 기준) =====
   PM10  : 좋음 0~30 / 보통 31~80 / 나쁨 81~150 / 매우나쁨 151~
   PM2.5 : 좋음 0~15 / 보통 16~35 / 나쁨 36~75  / 매우나쁨 76~ */
export const pm10Grade = (v) => {
  if (v == null) return '정보없음'
  if (v <= 30) return '좋음'
  if (v <= 80) return '보통'
  if (v <= 150) return '나쁨'
  return '매우나쁨'
}
export const pm25Grade = (v) => {
  if (v == null) return '정보없음'
  if (v <= 15) return '좋음'
  if (v <= 35) return '보통'
  if (v <= 75) return '나쁨'
  return '매우나쁨'
}

export const DUST_COLOR = {
  좋음: '#3498db',
  보통: '#2ecc71',
  나쁨: '#f39c12',
  매우나쁨: '#e74c3c',
  정보없음: '#999999',
}

// el-tag 의 type 값으로 쓰려고 등급 → 색상 타입 매핑
export const DUST_TAG_TYPE = {
  좋음: 'primary',
  보통: 'success',
  나쁨: 'warning',
  매우나쁨: 'danger',
  정보없음: 'info',
}

/* ===== 시간 표시 =====
   API 의 시각은 UTC 초 단위. 도시별 timezone(초)을 더한 뒤
   getUTC* 로 읽으면 브라우저 위치와 상관없이 그 도시의 현지 시각이 나온다 */
const pad = (n) => String(n).padStart(2, '0')

export const formatClock = (unixSec, tzOffset = 32400) => {
  if (!unixSec) return '-'
  const d = new Date((unixSec + tzOffset) * 1000)
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`
}

export const formatHourLabel = (unixSec, tzOffset = 32400) => {
  const d = new Date((unixSec + tzOffset) * 1000)
  const h = d.getUTCHours()
  // 날짜가 넘어가는 0시에는 며칠인지도 같이 보여준다
  return h === 0 ? `${d.getUTCDate()}일 0시` : `${h}시`
}

// 사진이 없는 도시 카드에 깔아줄 날씨별 배경 그라데이션
export const statusGradient = (status) => {
  switch (status) {
    case '맑음':
      return 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)'
    case '구름':
      return 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)'
    case '흐림':
    case '안개':
    case '연무':
      return 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)'
    case '비':
    case '이슬비':
    case '천둥번개':
      return 'linear-gradient(135deg, #4b6cb7 0%, #182848 100%)'
    case '눈':
      return 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)'
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  }
}
