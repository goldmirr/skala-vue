<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

/* =========================================================
   SearchBar.vue - 검색 입력창 컴포넌트 (Element Plus 적용판)

   Props : 부모가 들고 있는 검색어(query)와 검색 결과 개수
   Emits : update-query - 글자가 바뀔 때마다 (한글 조합 중에도)
           submit-query - Enter 를 눌렀을 때

   검색어의 주인은 어디까지나 부모다. 자식은 "바꿔주세요"라고 요청만 한다.

   [키보드 수식어]
   @keyup.enter → 첫 번째 검색 결과 선택 / 결과가 없으면 도시 추가
   @keyup.esc   → 검색어 지우고 입력창에서 빠져나오기

   [한글 입력 주의]
   el-input 은 한글 조합(자음+모음 합치는 중) 동안에는 input 이벤트를
   안 보내준다. 그러면 '서' 를 치는 중에는 검색이 안 되고 '서울' 을 다
   치고 나서야 반응한다.
   처음엔 @compositionupdate 로 받았는데, 이 이벤트는 DOM 값이 바뀌기
   "전"에 발생해서 e.target.value 가 한 글자 늦었다 ('수원' 을 쳐도 '수워').
   그래서 el-input 이 expose 하는 안쪽 <input> 요소에 네이티브 input
   리스너를 직접 달았다. 네이티브 input 은 조합 중에도 글자가 바뀔 때마다
   바뀐 값으로 발생한다.
   ========================================================= */

const props = defineProps({
  query: {
    type: String,
    required: true,
  },
  // 현재 검색어로 걸러진 도시 수 (안내 문구용)
  resultCount: {
    type: Number,
    default: 0,
  },
  // 도시 추가 요청이 진행 중인지 (Enter 연타 방지용 표시)
  isAdding: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update-query', 'submit-query'])

const inputRef = ref(null)

// el-input 의 @input 은 이벤트 객체가 아니라 값(문자열) 자체를 넘겨준다
const onInput = (value) => {
  emit('update-query', value)
}

// 안쪽 <input> 의 네이티브 input 이벤트 (한글 조합 중에도 매 글자 발생)
const onNativeInput = (e) => {
  emit('update-query', e.target.value)
}

onMounted(() => {
  inputRef.value?.input?.addEventListener('input', onNativeInput)
})
onUnmounted(() => {
  inputRef.value?.input?.removeEventListener('input', onNativeInput)
})

const onEnter = () => {
  emit('submit-query', props.query)
}

const onEsc = () => {
  emit('update-query', '')
  inputRef.value?.blur()
}

// 부모가 단축키(/)로 포커스를 줄 수 있게 열어둔다
defineExpose({
  focus: () => inputRef.value?.focus(),
})
</script>

<template>
  <div>
    <el-input
      ref="inputRef"
      :model-value="query"
      size="large"
      clearable
      placeholder="도시 이름 입력 후 Enter  (단축키: /)"
      @input="onInput"
      @clear="onInput('')"
      @keyup.enter="onEnter"
      @keyup.esc="onEsc"
    >
      <template #prefix>🔍</template>
    </el-input>

    <!-- 입력한 내용이 있으면 결과 수를, 없으면 안내 문구를 보여준다 -->
    <p v-if="query !== ''" class="search-result">
      검색 중인 도시: <strong>{{ query }}</strong>
      <span class="count">— {{ resultCount }}곳</span>
      <span v-if="isAdding" class="hint">OpenWeather 에서 찾는 중…</span>
      <span v-else-if="resultCount > 0" class="hint">Enter: 첫 번째 결과 선택</span>
      <span v-else class="hint">Enter: OpenWeather 에서 찾아서 목록에 추가</span>
    </p>
    <p v-else class="sub-text">예) 서울, 부산 / 목록에 없는 도시(대전, 광주, Tokyo…)는 Enter 로 추가</p>
  </div>
</template>

<style scoped>
.search-result {
  margin: 12px 0 0;
  font-size: 16px;
  color: #2f6bb5;
}
.count {
  margin-left: 4px;
  color: #5a6b7d;
}
.hint {
  margin-left: 10px;
  font-size: 14px;
  color: #999;
}
.sub-text {
  margin: 12px 0 0;
  font-size: 15px;
  color: #666;
}
</style>
