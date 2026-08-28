/* =========================================================
   cities.js - 대시보드 기본 도시 목록

   과제 4까지는 WeatherHomeView와 WeatherDetailView가
   똑같은 도시 배열을 각자 들고 있었는데, axios 적용하면서
   위도/경도가 필요해져서 한 파일로 합쳤다.

   mock: API 키가 없거나 요청이 실패했을 때 대신 보여줄 값.
         (배포 후 키가 만료돼도 화면이 비어 보이지 않게 하려고 남겨둠)
   ========================================================= */
import seoulImg from '@/assets/images/seoul.jpg'
import suwonImg from '@/assets/images/suwon.jpg'
import busanImg from '@/assets/images/busan.jpg'
import jejuImg from '@/assets/images/jeju.jpg'
import gangneungImg from '@/assets/images/gangneung.jpg'

export const BASE_CITIES = [
  {
    id: 'city_01',
    name: '서울',
    region: '대한민국 서울특별시',
    lat: 37.5665,
    lon: 126.978,
    img: seoulImg,
    pos: 'center 10%',
    mock: { temp: 28, status: '맑음', icon: '☀️', humidity: 55, wind: 2.5, dust: '나쁨', rainProb: 10 },
  },
  {
    id: 'city_02',
    name: '수원',
    region: '대한민국 경기도 수원시',
    lat: 37.2636,
    lon: 127.0286,
    img: suwonImg,
    pos: 'center 55%',
    mock: { temp: 24, status: '비', icon: '🌧️', humidity: 88, wind: 4.1, dust: '좋음', rainProb: 80 },
  },
  {
    id: 'city_03',
    name: '부산',
    region: '대한민국 부산광역시',
    lat: 35.1796,
    lon: 129.0756,
    img: busanImg,
    pos: 'center 60%',
    mock: { temp: 26, status: '구름', icon: '⛅', humidity: 65, wind: 5.8, dust: '보통', rainProb: 30 },
  },
  {
    id: 'city_04',
    name: '제주',
    region: '대한민국 제주특별자치도',
    lat: 33.4996,
    lon: 126.5312,
    img: jejuImg,
    pos: 'center 40%',
    mock: { temp: 30, status: '흐림', icon: '☁️', humidity: 72, wind: 7.2, dust: '좋음', rainProb: 65 },
  },
  {
    id: 'city_05',
    name: '강릉',
    region: '대한민국 강원특별자치도 강릉시',
    lat: 37.7519,
    lon: 128.8761,
    img: gangneungImg,
    pos: 'center 45%',
    mock: { temp: 22, status: '비', icon: '🌧️', humidity: 91, wind: 6.4, dust: '보통', rainProb: 75 },
  },
]

// 검색으로 새로 추가한 도시는 사진이 없으니 값도 대충 비워둔다
export const EMPTY_MOCK = {
  temp: 0,
  status: '정보 없음',
  icon: '❔',
  humidity: 0,
  wind: 0,
  dust: '정보없음',
  rainProb: 0,
}
