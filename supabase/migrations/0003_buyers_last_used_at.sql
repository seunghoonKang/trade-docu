-- 거래처 최근 사용순 정렬(#49): picker에서 선택된 시점을 기록한다.
alter table buyers add column if not exists last_used_at timestamptz;
