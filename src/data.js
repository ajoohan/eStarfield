export const company = {
  name: 'e스타필드 공인중개사사무소',
  ceo: '이훈희',
  phone: '031-793-9500',
  mobiles: ['010-7705-4600', '010-7607-3161'],
  fax: '031-794-2444',
  email: 'estarhanam@naver.com',
  address: '경기도 하남시 하남유니온로 70-1, 110호',
  addressDetail: '하남에일린의뜰 단지내 상가 內 공인중개사사무소',
  brokerLicense: '41450-2022-00016',
  bizNumber: '307-12-93306',
  hours: '평일 10:00 - 19:00 · 토요일 10:00 - 19:00 · 일요일 예약 상담',
  region: '하남 미사·유니온시티',
}

// 회사소개 인사말 (문단 배열)
export const greeting = [
  'e스타필드공인중개사사무소는 부동산에 관한 전문성과 노하우를 바탕으로 고객만족과 이익의 증진을 목표로 업무에 임하고 있습니다.',
  '고객님의 소중한 자산을 지켜드릴 수 있도록 신뢰를 바탕으로 가족처럼 편안하고 친근하게 다가오실 수 있도록 따뜻한 회사가 되도록 최선을 다하겠습니다.',
  '언제나 성실한 중개, 책임있는 중개로 보답하겠습니다.',
]

// 주변단지 소개 (초안 — 실제 정보로 교체 예정)
export const complexes = [
  { name: '하남에일린의뜰', category: '아파트 · 단지내 상가', desc: '본 사무소가 위치한 단지. 미사·유니온 생활권 중심으로 단지 내 상가와 배후 세대를 두루 안내합니다.', tags: ['본사무소', '단지내상가'] },
  { name: '미사강변센트럴자이', category: '아파트', desc: '미사강변도시 대단지. 학교·마트·공원 등 생활 인프라가 가까워 실거주 선호가 높은 단지입니다.', tags: ['대단지', '학군'] },
  { name: '미사강변리버뷰자이', category: '아파트', desc: '한강·녹지 접근성이 좋은 미사강변 생활권 단지. 조망과 쾌적한 주거환경이 강점입니다.', tags: ['한강생활권', '조망'] },
  { name: '미사강변골든센트로', category: '주상복합 · 상가', desc: '역세권 접근성과 상권을 함께 갖춘 주상복합. 사무실·상가 수요 문의가 많은 지역입니다.', tags: ['역세권', '상권'] },
  { name: '하남유니온시티 일대', category: '아파트 · 상업지역', desc: '유니온로를 따라 형성된 신규 주거·상업지역. 지식산업센터·상가 등 업무용 매물이 풍부합니다.', tags: ['유니온로', '업무·상가'] },
]

export const propertyTypes = [
  { key: 'store', label: '상가/점포', desc: '근린상가·1층 점포·프랜차이즈 자리', icon: '🏪' },
  { key: 'office', label: '사무실/오피스', desc: '사무실·지식산업센터·오피스텔(업무용)', icon: '🏢' },
  { key: 'home', label: '아파트/주택', desc: '아파트·빌라·오피스텔(주거용)', icon: '🏠' },
  { key: 'land', label: '토지/건물', desc: '토지·건물(빌딩) 통매매', icon: '🏞️' },
]

export const dealTypes = [
  { key: 'sale', label: '매매' },
  { key: 'jeonse', label: '전세' },
  { key: 'monthly', label: '월세' },
]

export const listings = [
  { id: 1, title: '미사역 초역세권 1층 코너 상가', typeKey: 'store', dealKey: 'monthly', area: '49.5㎡(15평)', price: '', deposit: '5,000만원', monthly: '350만원', location: '하남시 미사강변대로', floor: '1층', desc: '유동인구 풍부한 코너 자리, 다양한 업종 가능. 권리금 협의.', thumb: '' },
  { id: 2, title: '에일린의뜰 단지내 상가', typeKey: 'store', dealKey: 'sale', area: '33.0㎡(10평)', price: '4억 2,000만원', deposit: '', monthly: '', location: '하남유니온로', floor: '1층', desc: '배후세대 탄탄한 단지내 상가. 안정적 임대수익.', thumb: '' },
  { id: 3, title: '유니온시티 지식산업센터 사무실', typeKey: 'office', dealKey: 'monthly', area: '82.6㎡(25평)', price: '', deposit: '2,000만원', monthly: '150만원', location: '하남시 유니온로', floor: '7층', desc: '신축 지산, 주차 편리, 즉시 입주 가능.', thumb: '' },
  { id: 4, title: '미사강변도시 오피스텔(업무용)', typeKey: 'office', dealKey: 'jeonse', area: '39.6㎡(12평)', price: '', deposit: '1억 5,000만원', monthly: '', location: '하남시 미사강변동로', floor: '12층', desc: '역세권 오피스텔, 재택·1인 사무실 적합.', thumb: '' },
  { id: 5, title: '미사강변 브라이튼 아파트 84㎡', typeKey: 'home', dealKey: 'sale', area: '84.9㎡(34평)', price: '9억 8,000만원', deposit: '', monthly: '', location: '하남시 미사강변한강로', floor: '15층', desc: '한강 조망, 학군·교통 우수. 남향 로열층.', thumb: '' },
  { id: 6, title: '풍산동 신축 빌라 전세', typeKey: 'home', dealKey: 'jeonse', area: '59.5㎡(18평)', price: '', deposit: '3억 2,000만원', monthly: '', location: '하남시 풍산동', floor: '3층', desc: '신축 풀옵션, 즉시 입주. 주차 가능.', thumb: '' },
  { id: 7, title: '하남 감일지구 근린생활용지', typeKey: 'land', dealKey: 'sale', area: '330㎡(100평)', price: '12억원', deposit: '', monthly: '', location: '하남시 감일동', floor: '-', desc: '상업지역 인접 근생용지, 개발 가치 우수.', thumb: '' },
  { id: 8, title: '미사동 상가건물 통매매', typeKey: 'land', dealKey: 'sale', area: '660㎡(200평)', price: '38억원', deposit: '', monthly: '', location: '하남시 미사동', floor: '지하1~지상4층', desc: '수익형 상가건물, 임대수익률 4%대. 투자문의 환영.', thumb: '' },
]

export const steps = [
  { no: 1, title: '매물 확인·상담', desc: '원하는 조건(지역·예산·용도)을 알려주시면 맞는 매물을 정리해 안내합니다.' },
  { no: 2, title: '현장 방문', desc: '실제 매물을 함께 둘러보고 입지·상태·주변 환경을 꼼꼼히 확인합니다.' },
  { no: 3, title: '조건 협의', desc: '가격·입주일·특약 등 거래 조건을 조율하고 등기·권리관계를 확인합니다.' },
  { no: 4, title: '계약 체결', desc: '계약서 작성 및 계약금 납부. 중개대상물 확인·설명서를 교부합니다.' },
  { no: 5, title: '잔금·이전/입주', desc: '잔금 지급, 소유권 이전 또는 입주까지 안전하게 마무리합니다.' },
]

export const feeTable = [
  { category: '매매·교환 (주택)', range: '거래금액 구간별', rate: '0.4% ~ 0.7%', note: '9억 이상 0.7% 이내 협의' },
  { category: '임대차 (주택)', range: '거래금액 구간별', rate: '0.3% ~ 0.6%', note: '6억 이상 0.6% 이내 협의' },
  { category: '오피스텔 (주거용 요건)', range: '매매/임대차', rate: '0.4% ~ 0.5%', note: '요건 충족 시 주택 준용' },
  { category: '상가·사무실·토지 등', range: '매매·임대차', rate: '0.9% 이내', note: '상호 협의로 결정' },
]

export const faqs = [
  { q: '중개보수(수수료)는 어떻게 계산되나요?', a: '거래금액과 매물 유형에 따라 법정 요율 범위 내에서 상호 협의로 결정됩니다. 계약 전 정확한 금액을 안내해 드립니다.' },
  { q: '매물을 내놓고 싶은데 어떻게 하나요?', a: '전화(031-793-9500) 또는 문의 페이지로 연락 주시면 방문/전화 상담 후 매물을 등록해 드립니다.' },
  { q: '허위매물은 없나요?', a: '현장 확인을 거친 매물만 안내하며, 등기·권리관계를 사전에 점검합니다.' },
  { q: '외지에서도 상담 가능한가요?', a: '전화·문자 상담 후 방문 일정을 잡아 드립니다. 하남 미사·유니온 권역 매물을 전문으로 합니다.' },
]

export const useMethods = [
  { no: 1, title: '전화·방문 상담', desc: '가장 빠릅니다. 031-793-9500 으로 전화하거나 사무소로 방문해 조건을 말씀해 주세요.' },
  { no: 2, title: '간편 문의 접수', desc: '문의 페이지에 조건을 남기시면 맞는 매물을 정리해 연락드립니다.' },
  { no: 3, title: '매물 직접 검색', desc: '매물정보 페이지에서 유형·거래유형으로 골라 관심 매물을 확인하세요.' },
]
