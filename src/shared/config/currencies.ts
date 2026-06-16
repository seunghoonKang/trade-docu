/** 앱 전역에서 쓰는 통화 목록. 서류 작성·환율 환산이 같은 소스를 쓰도록 shared로 내림. */
export const CURRENCY_OPTIONS = [
  { value: "USD", label: "USD" },
  { value: "EUR", label: "EUR" },
  { value: "KRW", label: "KRW" },
  { value: "JPY", label: "JPY" },
  { value: "CNY", label: "CNY" },
  { value: "GBP", label: "GBP" },
];

export const CURRENCY_CODES = CURRENCY_OPTIONS.map((c) => c.value);
