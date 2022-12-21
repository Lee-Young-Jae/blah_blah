/**
 * 단어에 맞게 조사를 붙여주는 함수
 */
export function addJosa(word: string, josa: string) {
  const cho = word.charCodeAt(word.length - 1) - 0xac00;
  const jong = cho % 28;
  if (jong === 0) {
    return word + josa;
  }
  return word + josa.substring(1);
}
