<script setup>
/* =========================================================
   WeatherCard.vue - 도시 하나를 그리는 카드 컴포넌트

   Props : 도시 객체(city), 선택 여부(isSelected), 즐겨찾기 여부(isFavorite)
   Emits : select-card  - 카드 클릭
           click-detail - 상세보기 버튼 / 더블클릭
           open-menu    - 마우스 오른쪽 버튼
           remove-city  - ✕ 버튼 (검색으로 추가한 도시에만 표시)

   [마우스 이벤트 정리]
   @click               클릭 → 선택
   @dblclick            더블클릭 → 바로 상세 페이지
   @click.right.prevent 오른쪽 버튼 → 브라우저 기본 메뉴 막고 우리 메뉴 열기
   @click.stop          상세보기 버튼 클릭이 카드 클릭으로 번지지 않게
   ========================================================= */

import { computed } from 'vue'
import { useConfigStore } from '@/stores/configStore'
import { iconUrl, statusGradient, DUST_TAG_TYPE } from '@/utils/weather'

const props = defineProps({
  city: {
    type: Object,
    required: true,
  },
  isSelected: {
    type: Boolean,
    default: false,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['select-card', 'click-detail', 'open-menu', 'remove-city'])

/* ===== 표시용 기온 (configStore 단위 설정 반영) ===== */
const configStore = useConfigStore()
const displayTemp = computed(() => configStore.convertTemp(props.city.temp))

/* ===== 배경: 사진이 있으면 사진, 없으면(검색으로 추가한 도시) 날씨별 그라데이션 ===== */
const photoStyle = computed(() =>
  props.city.img
    ? { backgroundImage: `url(${props.city.img})`, backgroundPosition: props.city.pos }
    : { backgroundImage: statusGradient(props.city.status) },
)

const dustTagType = computed(() => DUST_TAG_TYPE[props.city.dust] ?? 'info')

const onSelect = () => emit('select-card', props.city)
const onDetail = () => emit('click-detail', props.city)
const onRemove = () => emit('remove-city', props.city)

// 메뉴를 어디에 띄울지 알아야 하니까 마우스 좌표도 같이 보낸다
const onMenu = (e) => emit('open-menu', { city: props.city, x: e.clientX, y: e.clientY })
</script>

<template>
  <div
    class="card"
    :class="{ selected: isSelected, favorite: isFavorite }"
    @click="onSelect"
    @dblclick="onDetail"
    @click.right.prevent="onMenu"
  >
    <!-- 사진(또는 그라데이션)은 따로 한 겹으로 깔아둔다 (흑백 → 컬러 효과용) -->
    <div class="card-photo" :style="photoStyle"></div>

    <!-- 사진 위에 반투명 검정을 덮어야 흰 글씨가 잘 보인다 -->
    <div class="card-cover">
      <div>
        <p class="city-name">
          {{ city.name }} ({{ city.status }})
          <span v-if="isFavorite" class="star" title="즐겨찾기">⭐</span>
          <span v-if="!city.live" class="sample-mark">샘플</span>
        </p>

        <p class="temp">
          <!-- 실시간 데이터면 OpenWeather 아이콘 이미지, 아니면 이모지 -->
          <img v-if="city.iconCode" class="owm-icon" :src="iconUrl(city.iconCode)" :alt="city.status" />
          <span v-else class="weather-icon">{{ city.icon }}</span>
          {{ displayTemp }}{{ configStore.unitSymbol }}
        </p>

        <p class="sub-text">
          <el-tag size="small" :type="dustTagType" effect="dark" round disable-transitions>미세먼지 {{ city.dust }}</el-tag>
          <el-tag size="small" :type="city.rainProb >= 60 ? 'primary' : 'info'" effect="dark" round disable-transitions>
            ☔ 강수확률 {{ city.rainProb }}%
          </el-tag>
        </p>

        <!-- 더움/선선함 판정은 단위와 무관하게 원본 섭씨(city.temp) 기준 -->
        <el-tag v-if="city.temp >= 25" type="danger" effect="dark" round disable-transitions>🔥 더움 (25도 이상)</el-tag>
        <el-tag v-else type="primary" effect="dark" round disable-transitions>❄ 선선함 (25도 미만)</el-tag>
      </div>

      <!-- el-tag 는 나타날 때 zoom 애니메이션이 있는데, 검색으로 카드가 계속 다시 그려지면
           태그가 매번 튀어서 disable-transitions 로 껐다 -->
      <!-- .stop 을 붙여서 부모(카드)로 클릭이 퍼지는 것을 막음 -->
      <el-button class="detail-btn" round @click.stop="onDetail">상세보기</el-button>
    </div>

    <!-- 검색으로 추가한 도시만 지울 수 있다 (기본 5개는 고정). 우클릭 메뉴에도 같은 항목이 있다 -->
    <el-button
      v-if="city.custom"
      class="remove-btn"
      circle
      size="small"
      title="목록에서 제거"
      @click.stop="onRemove"
    >
      ✕
    </el-button>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  border-radius: 16px;
  margin-bottom: 18px;
  cursor: pointer;
  overflow: hidden;
  transition:
    transform 0.25s,
    box-shadow 0.25s;
}
.card:hover {
  transform: translateY(-4px);
}

/* 카드 바닥에 깔리는 사진 레이어 */
.card-photo {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background-size: cover;
  filter: grayscale(80%);
  transition: filter 0.25s;
}
.card:hover .card-photo {
  filter: grayscale(35%);
}

/* ===== 선택된 카드 효과 ===== */
.card.selected .card-photo {
  filter: grayscale(0%);
}
.card.selected {
  transform: scale(1.02);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.28);
  outline: 4px solid #4a90d9;
}
.card.selected:hover {
  transform: scale(1.02) translateY(-4px);
}
/* 즐겨찾기 카드는 테두리 색만 살짝 다르게 */
.card.favorite:not(.selected) {
  outline: 3px solid rgba(245, 197, 66, 0.8);
}

/* 사진 위에 덮는 반투명 막 */
.card-cover {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 190px;
  padding: 26px;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.65), rgba(0, 0, 0, 0.3));
  color: white;
  box-sizing: border-box;
}
.card-cover p {
  margin: 3px 0;
}
.city-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 22px;
  font-weight: bold;
}
.star {
  font-size: 18px;
}
.sample-mark {
  padding: 2px 8px;
  border-radius: 10px;
  background-color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
  font-weight: normal;
}
.temp {
  display: flex;
  align-items: center;
  font-size: 42px;
  font-weight: bold;
}
.weather-icon {
  margin-right: 8px;
  font-size: 34px;
}
.owm-icon {
  width: 64px;
  height: 64px;
  margin: -8px 0 -8px -12px;
  /* 아이콘 이미지가 흐릿해서 살짝 진하게 */
  filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.5));
}
.sub-text {
  display: flex;
  gap: 6px;
  margin-bottom: 10px !important;
}
.detail-btn {
  flex-shrink: 0;
}
.remove-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0.75;
}
.remove-btn:hover {
  opacity: 1;
}
</style>
