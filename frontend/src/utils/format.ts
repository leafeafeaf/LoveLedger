/**
 * 숫자에 천 단위로 콤마를 추가하여 반환합니다.
 * @param value 숫자 또는 숫자 문자열
 * @returns 콤마가 추가된 문자열
 */
export function formatNumberWithCommas(value: string | number): string {
  // 값이 없거나 0인 경우 그대로 반환
  if (!value || value === "0") return "0";

  // 문자열로 변환하고 모든 콤마 제거
  const stringValue = String(value).replace(/,/g, "");

  // 숫자 포맷팅 (천 단위 콤마 추가)
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
