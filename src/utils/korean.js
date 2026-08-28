/* =========================================================
   korean.js - 조사(이/가, 을/를) 자동 선택

   과제 문구는 "{도시}이 선택되었습니다." 인데 제주, 대구처럼
   받침이 없는 도시는 "제주이 선택" 이 돼서 어색했다.
   마지막 글자의 유니코드로 받침 유무를 계산한다.
   (한글 음절 = 0xAC00 + (초성*21 + 중성)*28 + 종성 → 종성이 0이면 받침 없음)
   ========================================================= */
const hasBatchim = (word) => {
  const code = word.charCodeAt(word.length - 1)
  if (code < 0xac00 || code > 0xd7a3) return false // 한글이 아니면(영문 등) 받침 없는 걸로
  return (code - 0xac00) % 28 !== 0
}

// josa('서울', '이/가') → '서울이', josa('제주', '이/가') → '제주가'
export const josa = (word, pair) => {
  const [withBatchim, without] = pair.split('/')
  return word + (hasBatchim(word) ? withBatchim : without)
}
