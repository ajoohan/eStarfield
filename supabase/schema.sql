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
  reply      text default '',
  replied_at timestamptz,
  created_at timestamptz not null default now()
);

-- 기존 테이블에 회신 컬럼 추가(이미 있으면 무시)
alter table public.inquiries add column if not exists reply      text default '';
alter table public.inquiries add column if not exists replied_at timestamptz;

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

-- ---------- 6) 게시판(posts): 계약절차안내(process) / 부동산정책(policy) ----------
create table if not exists public.posts (
  id            bigint generated always as identity primary key,
  board         text    not null check (board in ('process','policy')),
  category      text    default '',   -- 분야
  title         text    not null,     -- 제목
  department    text    default '',   -- 담당부서
  phone         text    default '',   -- 전화번호
  duration      text    default '',   -- 처리기간
  fee           text    default '',   -- 수수료
  how_to_apply  text    default '',   -- 신청/접수방법
  required_docs text    default '',   -- 구비서류
  steps         text    default '',   -- 처리절차
  related_law   text    default '',   -- 관계법령
  etc_note      text    default '',   -- 기타사항
  content       text    default '',   -- 본문
  attachments   jsonb   not null default '[]',  -- [{name, path, size}]
  views         int     not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.posts enable row level security;

-- 공개: 활성 게시물만 조회
drop policy if exists "posts_public_read" on public.posts;
create policy "posts_public_read" on public.posts
  for select using (is_active = true);

-- 관리자: 전체 관리
drop policy if exists "posts_admin_all" on public.posts;
create policy "posts_admin_all" on public.posts
  for all to authenticated using (true) with check (true);

-- 조회수 증가(익명 호출 가능)
create or replace function public.increment_post_views(pid bigint)
returns void
language sql
security definer
set search_path = public
as $$
  update public.posts set views = views + 1 where id = pid and is_active = true;
$$;
grant execute on function public.increment_post_views(bigint) to anon, authenticated;

-- ---------- 7) 게시판 첨부파일 스토리지 버킷 ----------
insert into storage.buckets (id, name, public)
values ('post-files', 'post-files', true)
on conflict (id) do nothing;

drop policy if exists "post_files_public_read" on storage.objects;
create policy "post_files_public_read" on storage.objects
  for select using (bucket_id = 'post-files');

drop policy if exists "post_files_admin_insert" on storage.objects;
create policy "post_files_admin_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'post-files');

drop policy if exists "post_files_admin_update" on storage.objects;
create policy "post_files_admin_update" on storage.objects
  for update to authenticated using (bucket_id = 'post-files');

drop policy if exists "post_files_admin_delete" on storage.objects;
create policy "post_files_admin_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'post-files');

-- ---------- 8) 게시판 시드(최초 1회만) ----------
insert into public.posts
  (board, category, title, department, phone, duration, fee, how_to_apply, required_docs, steps, related_law, etc_note, content)
select * from (values
  ('process','매매','부동산 매매 계약 절차 안내','e스타필드 공인중개사사무소','031-793-9500','','상담 무료',
   '전화(031-793-9500) 또는 방문 상담',
   '매수인: 신분증, 계약금, 도장' || chr(10) || '매도인: 신분증, 등기권리증, 인감증명서, 도장',
   '① 매물 확인·상담 → ② 현장 방문 → ③ 조건 협의 → ④ 계약 체결 → ⑤ 잔금·소유권 이전',
   '공인중개사법, 부동산 거래신고 등에 관한 법률','',
   '매매 계약은 등기부등본·권리관계 확인부터 잔금·소유권 이전까지 전 과정을 함께 진행해 드립니다. 계약 전 중개대상물 확인·설명서를 반드시 확인하세요.'),
  ('process','임대차','전·월세(임대차) 계약 절차 안내','e스타필드 공인중개사사무소','031-793-9500','','상담 무료',
   '전화(031-793-9500) 또는 방문 상담',
   '임차인: 신분증, 계약금, 도장' || chr(10) || '임대인: 신분증, 등기권리증, 도장',
   '① 매물 확인·상담 → ② 현장 방문 → ③ 조건 협의 → ④ 계약 체결 → ⑤ 잔금·입주(확정일자)',
   '주택임대차보호법, 상가건물 임대차보호법','',
   '임대차 계약 시 등기부등본으로 선순위 권리관계를 확인하고, 잔금 후 전입신고와 확정일자를 받아 보증금을 보호하세요. 세부 절차는 매물 상황에 따라 달라질 수 있습니다.'),
  ('policy','중개보수','부동산 중개보수 요율 안내','e스타필드 공인중개사사무소','031-793-9500','','',
   '','',
   '','공인중개사법 시행규칙, 경기도 주택 중개보수 등에 관한 조례','실제 중개보수는 거래금액·유형에 따라 법정 한도 내에서 상호 협의로 결정됩니다.',
   '주택 매매·교환: 거래금액 구간별 0.4% ~ 0.7%' || chr(10) || '주택 임대차: 거래금액 구간별 0.3% ~ 0.6%' || chr(10) || '오피스텔(주거용 요건): 매매 0.5% / 임대차 0.4%' || chr(10) || '상가·사무실·토지 등: 매매·임대차 0.9% 이내 협의' || chr(10) || chr(10) || '정확한 금액은 계약 전 안내해 드립니다.'),
  ('policy','거래 유의사항','부동산 거래 시 유의사항 안내','e스타필드 공인중개사사무소','031-793-9500','','',
   '','',
   '','부동산 거래신고 등에 관한 법률','',
   '1. 계약 전 등기부등본으로 소유자·근저당 등 권리관계를 확인하세요.' || chr(10) || '2. 중개대상물 확인·설명서를 교부받고 내용을 확인하세요.' || chr(10) || '3. 계약금·잔금은 등기부상 소유자 명의 계좌로 이체하세요.' || chr(10) || '4. 주택 매매 계약 체결 시 30일 이내 부동산 거래신고 대상입니다.' || chr(10) || '5. 임대차는 전입신고·확정일자로 보증금을 보호하세요.')
) as seed(board, category, title, department, phone, duration, fee, how_to_apply, required_docs, steps, related_law, etc_note, content)
where not exists (select 1 from public.posts);

-- ---------- 8.5) 주변단지(complexes) ----------
create table if not exists public.complexes (
  id          bigint generated always as identity primary key,
  name        text    not null,
  category    text    default '',
  description text    default '',
  tags        jsonb   not null default '[]',
  sort_order  int     not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- 기존 테이블에 대표 이미지 컬럼 추가(이미 있으면 무시)
alter table public.complexes add column if not exists image text default '';

alter table public.complexes enable row level security;

drop policy if exists "complexes_public_read" on public.complexes;
create policy "complexes_public_read" on public.complexes
  for select using (is_active = true);

drop policy if exists "complexes_admin_all" on public.complexes;
create policy "complexes_admin_all" on public.complexes
  for all to authenticated using (true) with check (true);

-- 주변단지 시드(최초 1회만)
insert into public.complexes (name, category, description, tags, sort_order)
select * from (values
  ('하남에일린의뜰','아파트 · 단지내 상가','본 사무소가 위치한 단지. 미사·유니온 생활권 중심으로 단지 내 상가와 배후 세대를 두루 안내합니다.','["본사무소","단지내상가"]'::jsonb,1),
  ('미사강변센트럴자이','아파트','미사강변도시 대단지. 학교·마트·공원 등 생활 인프라가 가까워 실거주 선호가 높은 단지입니다.','["대단지","학군"]'::jsonb,2),
  ('미사강변리버뷰자이','아파트','한강·녹지 접근성이 좋은 미사강변 생활권 단지. 조망과 쾌적한 주거환경이 강점입니다.','["한강생활권","조망"]'::jsonb,3),
  ('미사강변골든센트로','주상복합 · 상가','역세권 접근성과 상권을 함께 갖춘 주상복합. 사무실·상가 수요 문의가 많은 지역입니다.','["역세권","상권"]'::jsonb,4),
  ('하남유니온시티 일대','아파트 · 상업지역','유니온로를 따라 형성된 신규 주거·상업지역. 지식산업센터·상가 등 업무용 매물이 풍부합니다.','["유니온로","업무·상가"]'::jsonb,5)
) as seed(name, category, description, tags, sort_order)
where not exists (select 1 from public.complexes);

-- ---------- 9) 매물 시드(최초 1회만) ----------
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
