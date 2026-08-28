<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { ElMessage, ElMessageBox } from 'element-plus'

import { useWeatherStore } from '@/stores/weatherStore'
import { useFavoriteStore } from '@/stores/favoriteStore'
import { useHistoryStore } from '@/stores/historyStore'
import { useConfigStore } from '@/stores/configStore'
import { useShortcuts } from '@/composables/useShortcuts'
import { josa } from '@/utils/korean'

/* ===== 부품 컴포넌트 (components/exercise/ 격리 폴더) ===== */
import BaseDashboardCard from '@/components/exercise/BaseDashboardCard.vue'
import SearchBar from '@/components/exercise/SearchBar.vue'
import WeatherCard from '@/components/exercise/WeatherCard.vue'
import UmbrellaList from '@/components/exercise/UmbrellaList.vue'
import StatusBar from '@/components/exercise/StatusBar.vue'
import CardContextMenu from '@/components/exercise/CardContextMenu.vue'

/* =========================================================
   WeatherHomeView.vue - 메인 날씨 대시보드 (/ 경로)

   과제 4: 상세보기 → router.push()
   과제 5: 단위 설정은 configStore, 방문 기록은 historyStore
   과제 6: 날씨 배열이 weatherStore 로 올라가고 실시간 데이터로 채워짐
   과제 7: Element Plus 적용 + 키보드 단축키 / 마우스 조작

   이 페이지는 이제 "무엇을 보여줄지"만 정하고
   데이터를 가져오고 보관하는 일은 전부 store 가 한다.
   ========================================================= */

const router = useRouter()
const weatherStore = useWeatherStore()
const favoriteStore = useFavoriteStore()
const historyStore = useHistoryStore()
const configStore = useConfigStore()

// 데이터(state/getters)는 storeToRefs로 꺼내야 반응형이 유지된다
const { cities, status, isLive, liveCount, errorMessage, lastUpdated } = storeToRefs(weatherStore)
const { recentRecords } = storeToRefs(historyStore)

// 처음 들어왔을 때만 불러온다. 상세 페이지 갔다 와도 status 가 ready 라 다시 안 부른다
onMounted(() => {
  if (status.value === 'idle') weatherStore.loadAll()
})

/* ===== 1) 검색 ===== */
const keyword = ref('')
const searchBarRef = ref(null)
const showFavoritesOnly = ref(false)

const filteredCities = computed(() => {
  const q = keyword.value.trim()
  return cities.value.filter((city) => {
    if (showFavoritesOnly.value && !favoriteStore.isFavorite(city.id)) return false
    return q === '' || city.name.includes(q)
  })
})

const onUpdateQuery = (newQuery) => {
  keyword.value = newQuery
}

// 검색창에서 Enter: 결과가 있으면 첫 번째 선택, 없으면 추가할지 물어보고 OpenWeather 에서 찾아서 추가
const onSubmitQuery = (q) => {
  if (q.trim() === '') return
  if (filteredCities.value.length > 0) {
    onSelectCard(filteredCities.value[0])
    return
  }
  confirmAddCity(q)
}

// 오타로 엉뚱한 도시가 추가되는 걸 막으려고 한 번 물어본다
const confirmAddCity = async (name) => {
  try {
    await ElMessageBox.confirm(
      `'${name}' 은(는) 목록에 없는 도시입니다. OpenWeather 에서 찾아서 카드로 추가할까요?`,
      '도시 추가',
      { confirmButtonText: '추가', cancelButtonText: '취소', type: 'info' },
    )
  } catch {
    return // 취소
  }
  addCity(name)
}

const isAdding = ref(false)
const addCity = async (name) => {
  if (isAdding.value) return
  isAdding.value = true
  try {
    const city = await weatherStore.addCity(name)
    keyword.value = ''
    onSelectCard(city)
    ElMessage.success(`${josa(city.name, '을/를')} 목록에 추가했습니다.`)
  } catch (e) {
    ElMessage.error(e.message)
  } finally {
    isAdding.value = false
  }
}

/* ===== 2) 카드 선택 / 상세보기 / 즐겨찾기 ===== */
const selectedId = ref('')
const statusMsg = ref('카드를 클릭하거나 검색해 보세요.')

const onSelectCard = (city) => {
  selectedId.value = city.id
  statusMsg.value = `${josa(city.name, '이/가')} 선택되었습니다.`
}

// router.push: JS 코드가 원하는 순간에 직접 이동시키는 Programmatic Navigation
const onClickDetail = (city) => {
  router.push('/weather/' + city.id)
}

const onToggleFavorite = (city) => {
  const added = favoriteStore.toggle(city.id)
  statusMsg.value = added
    ? `⭐ ${josa(city.name, '을/를')} 즐겨찾기에 추가했습니다.`
    : `${josa(city.name, '을/를')} 즐겨찾기에서 뺐습니다.`
}

/* ===== 3) 우클릭 메뉴 ===== */
const menu = ref({ visible: false, x: 0, y: 0, city: null })

const onOpenMenu = ({ city, x, y }) => {
  menu.value = { visible: true, x, y, city }
  onSelectCard(city)
}

const closeMenu = () => {
  menu.value.visible = false
}

const onMenuAction = async (action) => {
  const city = menu.value.city
  closeMenu()

  if (action === 'detail') {
    onClickDetail(city)
  } else if (action === 'favorite') {
    onToggleFavorite(city)
  } else if (action === 'copy') {
    const text = `${city.name} ${city.icon} ${city.status}, ${configStore.convertTemp(city.temp)}${configStore.unitSymbol}, 습도 ${city.humidity}%, 미세먼지 ${city.dust}`
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success('클립보드에 복사했습니다.')
    } catch {
      ElMessage.error('복사에 실패했습니다.')
    }
  } else if (action === 'remove') {
    confirmRemoveCity(city)
  }
}

// 추가한 도시 제거 (카드의 ✕ 버튼, 우클릭 메뉴 둘 다 여기로 온다)
const confirmRemoveCity = async (city) => {
  try {
    await ElMessageBox.confirm(`${josa(city.name, '을/를')} 목록에서 제거할까요?`, '도시 제거', {
      confirmButtonText: '제거',
      cancelButtonText: '취소',
      type: 'warning',
    })
  } catch {
    return
  }
  weatherStore.removeCity(city.id)
  favoriteStore.remove(city.id)
  if (selectedId.value === city.id) selectedId.value = ''
  statusMsg.value = `${josa(city.name, '을/를')} 목록에서 제거했습니다.`
}

/* ===== 4) 새로고침 ===== */
const refresh = async () => {
  if (status.value === 'loading') return
  await weatherStore.loadAll()
  if (isLive.value) ElMessage.success(`${liveCount.value}개 도시의 실시간 날씨를 다시 불러왔습니다.`)
  else ElMessage.warning(errorMessage.value)
}

const updatedText = computed(() =>
  lastUpdated.value
    ? lastUpdated.value.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    : '',
)

/* ===== 5) 페이지 단축키 =====
   검색창의 Enter / Esc 는 SearchBar 템플릿의 @keyup.enter / @keyup.esc 가 처리한다.
   아래 두 개는 포커스가 어디 있든 먹어야 해서 composable 로 window 에 등록한다.
   - /   : 검색창으로 포커스 (GitHub, YouTube 등에서 쓰는 관례)
   - Esc : 우클릭 메뉴 닫기 + 카드 선택 해제 */
useShortcuts({
  '/': () => searchBarRef.value?.focus(),
  Escape: () => {
    closeMenu()
    selectedId.value = ''
    statusMsg.value = '선택을 해제했습니다.'
  },
})
</script>

<template>
  <div class="page">
    <!-- 실시간 데이터를 못 받은 경우 안내 (키 없음 / 키 미활성화 / 네트워크) -->
    <el-alert
      v-if="status === 'ready' && !isLive"
      type="warning"
      show-icon
      :closable="false"
      title="샘플 데이터를 표시하고 있습니다"
      :description="errorMessage"
      class="top-alert"
    />
    <el-alert
      v-else-if="status === 'ready' && errorMessage"
      type="info"
      show-icon
      :closable="false"
      :title="`일부 도시는 샘플 데이터입니다 — ${errorMessage}`"
      class="top-alert"
    />

    <!-- ========== 1) 도시 검색 ==========
         SearchBar는 화면상 BaseDashboardCard 안에 있지만
         슬롯 내용은 이 페이지의 스코프에서 컴파일되므로 직접 통신할 수 있다 -->
    <BaseDashboardCard icon="🔍" title="도시 검색">
      <template #action>
        <span v-if="updatedText" class="updated">
          {{ isLive ? '실시간' : '샘플' }} · {{ updatedText }} 기준
        </span>
        <el-button size="small" :loading="status === 'loading'" @click="refresh">
          새로고침
        </el-button>
      </template>

      <SearchBar
        ref="searchBarRef"
        :query="keyword"
        :result-count="filteredCities.length"
        :is-adding="isAdding"
        @update-query="onUpdateQuery"
        @submit-query="onSubmitQuery"
      />

      <!-- 최근 본 상세 페이지 (historyStore) - 검색창 밑 "최근 검색어" 칩처럼.
           페이지를 오가도 store 의 기록은 유지된다. 칩을 누르면 바로 상세로 -->
      <div v-if="recentRecords.length > 0" class="recent">
        <span class="recent-label">🕘 최근 본 도시</span>
        <el-tag
          v-for="record in recentRecords"
          :key="record.id"
          class="recent-chip"
          effect="plain"
          round
          disable-transitions
          :title="`${record.time} 조회`"
          @click="router.push('/weather/' + record.id)"
        >
          {{ record.icon }} {{ record.name }}
        </el-tag>
        <el-button size="small" text @click="historyStore.clearHistory">비우기</el-button>
      </div>
    </BaseDashboardCard>

    <!-- ========== 2) 우산 챙기기 배너 (검색창 바로 아래) ========== -->
    <UmbrellaList :cities="cities" :threshold="60" @pick-city="onClickDetail" />

    <!-- ========== 3) 지역별 날씨 현황 ========== -->
    <BaseDashboardCard icon="🌤" title="지역별 날씨 현황">
      <template #action>
        <span class="count-text">총 {{ cities.length }}곳</span>
        <el-checkbox v-model="showFavoritesOnly" :disabled="favoriteStore.count === 0">
          ⭐ 즐겨찾기만
        </el-checkbox>
      </template>

      <!-- 첫 로딩 중에는 스켈레톤 -->
      <el-skeleton v-if="status === 'loading' && !lastUpdated" :rows="6" animated />

      <template v-else>
        <WeatherCard
          v-for="city in filteredCities"
          :key="city.id"
          :city="city"
          :is-selected="selectedId === city.id"
          :is-favorite="favoriteStore.isFavorite(city.id)"
          @select-card="onSelectCard"
          @click-detail="onClickDetail"
          @open-menu="onOpenMenu"
          @remove-city="confirmRemoveCity"
        />

        <!-- 검색 결과가 없을 때 -->
        <el-empty
          v-if="filteredCities.length === 0"
          :image-size="80"
          :description="
            showFavoritesOnly
              ? '즐겨찾기에 해당하는 도시가 없습니다'
              : `'${keyword}' 과 일치하는 도시가 없습니다`
          "
        >
          <el-button
            v-if="!showFavoritesOnly && keyword.trim() !== ''"
            type="primary"
            :loading="isAdding"
            @click="confirmAddCity(keyword)"
          >
            OpenWeather 에서 '{{ keyword }}' 찾아서 추가
          </el-button>
        </el-empty>
      </template>
    </BaseDashboardCard>

    <!-- ========== 4) 상태바 (화면 하단 고정) ========== -->
    <StatusBar :message="statusMsg" />

    <!-- ========== 우클릭 메뉴 (Teleport 로 body 에 붙는다) ========== -->
    <CardContextMenu
      :visible="menu.visible"
      :x="menu.x"
      :y="menu.y"
      :city="menu.city"
      :is-favorite="menu.city ? favoriteStore.isFavorite(menu.city.id) : false"
      @close="closeMenu"
      @action="onMenuAction"
    />
  </div>
</template>

<style scoped>
.page {
  font-size: 18px;
}
.top-alert {
  margin-bottom: 18px;
}
.updated {
  margin-right: 10px;
  font-size: 14px;
  color: #999;
}
.count-text {
  margin-right: 10px;
}

/* ===== 최근 본 도시 칩 (검색창 아래) ===== */
.recent {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  font-size: 14px;
}
.recent-label {
  margin-right: 4px;
  color: #5a6b7d;
}
.recent-chip {
  cursor: pointer;
}
</style>
