import { onMounted, onUnmounted } from 'vue'

/* =========================================================
   useShortcuts - 페이지 단위 키보드 단축키 등록

   템플릿의 @keyup.enter 같은 수식어는 "그 요소에 포커스가 있을 때"만 먹는다.
   페이지 어디서든 눌러도 되는 단축키(/, R, 숫자 등)는 window 에
   직접 리스너를 달아야 해서 composable 로 뺐다.

   사용법:
     useShortcuts({ '/': focusSearch, Escape: clear, '1': () => pick(0) })

   - 입력창에 타이핑 중일 때는 Escape 만 통과시킨다 (글자 입력 방해 금지)
   - Ctrl/Cmd/Alt 가 눌린 조합은 브라우저 단축키와 겹치니 건드리지 않는다
   - 컴포넌트가 사라질 때 리스너도 같이 정리한다
   ========================================================= */
export function useShortcuts(handlers) {
  const onKeydown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return

    const tag = e.target.tagName
    const typing = tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable
    if (typing && e.key !== 'Escape') return

    const handler = handlers[e.key]
    if (typeof handler === 'function') {
      e.preventDefault()
      handler(e)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
