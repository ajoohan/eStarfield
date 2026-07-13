-- =====================================================================
-- e스타필드 공인중개사사무소 — Supabase 스키마
-- 사용법: Supabase 대시보드 → SQL Editor 에 전체 붙여넣고 [Run].
-- 재실행해도 안전하도록 작성(테이블 존재 시 시드는 건너뜀).
-- =====================================================================

-- ---------- 1) 매물(listings) ----------
create table if not exists public.listings (
  id          bigint generated always as identity primary key,
  title       text    not null,
  type_key    text    not null check (type_key in ('store','office','home','land')),
  deal_key    text    not null check (deal_key in ('sale','jeonse','monthly')),
  area        text    default '',
  price       text    default '',
  deposit     text    default '',
  monthly     text    default '',
  location    text    default '',
  floor       text    default '',
  description text    default '',
  thumb       text    default '',
  is_active   boolean not null default true,
  sort_order  int     not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------- 2) 문의(inquiries) ----------
create table if not exists public.inquiries (
  id         bigint generated always as identity primary key,
  name       text not null,
  phone      text not null,
  kind       text default '',
  message    text default '',
  handled    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- 3) RLS 활성화 ----------
alter table public.listings  enable row level security;
alter table public.inquiries enable row level security;

-- ---------- 4) 정책(listings) ----------
-- 공개: 활성 매물만 조회 가능
drop policy if exists "listings_public_read" on public.listings;
create policy "listings_public_read" on public.listings
  for select using (is_active = true);

-- 관리자(로그인 사용자): 전체 조회/등록/수정/삭제
drop policy if exists "listings_admin_all" on public.listings;
create policy "listings_admin_all" on public.listings
  for all to authenticated using (true) with check (true);

-- ---------- 5) 정책(inquiries) ----------
-- 누구나(익명 포함) 문의 등록 가능
drop policy if exists "inquiries_anon_insert" on public.inquiries;
create policy "inquiries_anon_insert" on public.inquiries
  for insert to anon, authenticated with check (true);

-- 관리자만 조회/수정/삭제(개인정보 보호)
drop policy if exists "inquiries_admin_read" on public.inquiries;
create policy "inquiries_admin_read" on public.inquiries
  for select to authenticated using (true);

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update" on public.inquiries
  for update to authenticated using (true) with check (true);

drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete" on public.inquiries
  for delete to authenticated using (true);

-- ---------- 6) 매물 시드(최초 1회만) ----------
-- listings가 비어 있을 때만 데모 매물을 넣는다.
insert into public.listings
  (title, type_key, deal_key, area, price, deposit, monthly, location, floor, description, sort_order)
select * from (values
  ('미사역 초역세권 1층 코너 상가','store','monthly','49.5㎡(15평)','','5,000만원','350만원','하남시 미사강변대로','1층','유동인구 풍부한 코너 자리, 다양한 업종 가능. 권리금 협의.',1),
  ('에일린의뜰 단지내 상가','store','sale','33.0㎡(10평)','4억 2,000만원','','','하남유니온로','1층','배후세대 탄탄한 단지내 상가. 안정적 임대수익.',2),
  ('유니온시티 지식산업센터 사무실','office','monthly','82.6㎡(25평)','','2,000만원','150만원','하남시 유니온로','7층','신축 지산, 주차 편리, 즉시 입주 가능.',3),
  ('미사강변도시 오피스텔(업무용)','office','jeonse','39.6㎡(12평)','','1억 5,000만원','','하남시 미사강변동로','12층','역세권 오피스텔, 재택·1인 사무실 적합.',4),
  ('미사강변 브라이튼 아파트 84㎡','home','sale','84.9㎡(34평)','9억 8,000만원','','','하남시 미사강변한강로','15층','한강 조망, 학군·교통 우수. 남향 로열층.',5),
  ('풍산동 신축 빌라 전세','home','jeonse','59.5㎡(18평)','','3억 2,000만원','','하남시 풍산동','3층','신축 풀옵션, 즉시 입주. 주차 가능.',6),
  ('하남 감일지구 근린생활용지','land','sale','330㎡(100평)','12억원','','','하남시 감일동','-','상업지역 인접 근생용지, 개발 가치 우수.',7),
  ('미사동 상가건물 통매매','land','sale','660㎡(200평)','38억원','','','하남시 미사동','지하1~지상4층','수익형 상가건물, 임대수익률 4%대. 투자문의 환영.',8)
) as seed(title,type_key,deal_key,area,price,deposit,monthly,location,floor,description,sort_order)
where not exists (select 1 from public.listings);
