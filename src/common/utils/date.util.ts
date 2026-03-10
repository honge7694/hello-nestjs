/**
 * 오늘 날짜를 갖고오는 Util 메서드
 * @param withDash 대시 포함 여부
 * @returns YYYY-MM-DD 형식의 문자열
 */
export const getTodayString = (withDash: boolean): string => {
	const today = new Date();
	const y = today.getFullYear();
	const m = String(today.getMonth() + 1).padStart(2, '0');
	const d = String(today.getDate()).padStart(2, '0');

	return withDash ? `${y}-${m}-${d}` : `${y}${m}${d}`;
};
