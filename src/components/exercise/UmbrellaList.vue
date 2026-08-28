<script setup>
import { computed } from 'vue'

/* =========================================================
   UmbrellaList.vue - 우산이 필요한 도시 배너

   Props로 도시 목록과 기준값을 받아서, 걸러내는 계산은 스스로 한다.
   기준값(threshold)을 prop으로 뺀 덕분에 60% 말고 다른 기준으로도 재활용할 수 있다.

   처음엔 카드 목록 아래에 별도 박스였는데, 스크롤을 내려야 보여서
   검색창 바로 아래 한 줄 배너로 올렸다. (날씨 앱들이 경보를 위에 두는 것처럼)
   도시 칩을 누르면 상세 페이지로 간다.

   rainProb 는 OpenWeather 예보 API 의 pop(강수확률) 중 앞으로 12시간 최대값.
   ========================================================= */

const props = defineProps({
  cities: {
    type: Array,
    default: () => [],
  },
  threshold: {
    type: Number,
    default: 60,
  },
})

const emit = defineEmits(['pick-city'])

// 강수확률 높은 순으로 정렬해서 보여준다
const rainyCities = computed(() =>
  props.cities
    .filter((city) => city.rainProb >= props.threshold)
    .sort((a, b) => b.rainProb - a.rainProb),
)
</script>

<template>
  <div class="umbrella" :class="{ clear: rainyCities.length === 0 }">
    <template v-if="rainyCities.length > 0">
      <span class="label">☔ 오늘 우산이 필요한 도시</span>
      <el-tag
        v-for="city in rainyCities"
        :key="city.id"
        class="chip"
        type="primary"
        effect="dark"
        round
        disable-transitions
        :title="`${city.name} 상세 보기`"
        @click="emit('pick-city', city)"
      >
        {{ city.name }} {{ city.rainProb }}%
      </el-tag>
    </template>
    <span v-else class="label">☀️ 12시간 내 강수확률 {{ threshold }}% 를 넘는 도시가 없습니다. 우산은 두고 가도 될 듯.</span>
  </div>
</template>

<style scoped>
.umbrella {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  padding: 12px 18px;
  border-radius: 12px;
  background-color: #dbe9ff;
  color: #2f6bb5;
  font-size: 16px;
}
.umbrella.clear {
  background-color: #fff6d6;
  color: #8a6d1a;
}
.label {
  font-weight: bold;
  margin-right: 4px;
}
.chip {
  cursor: pointer;
  font-size: 14px;
}
</style>
