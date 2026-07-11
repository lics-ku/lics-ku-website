### 0. 테스트 방법

git clone 후 로컬에서 돌려주세요.
node, npm은 필수입니다!

#### 로컬 테스트

```js
npm i // 필수 패키지 다운로드
npm run dev // 로컬에서 돌려보기. localhost:3000 에서 확인 가능
npm run build // 수정사항 문제 없이 통과되는지 확인
```

#### 배포

깃허브에 push하면 바로 배포됩니다 (vercel 참고)

```js
git add .
git commit -m "chore: update information"
git push
```

- 이미지는 `public` 폴더에,
- 그 외 데이터는 `data` 폴더에 있습니다

최대한 커서의 자동완성을 활용합시다.
기존 데이터 복사해서 새로 추가하는걸 추천드려요

---
### 1. 사람을 추가/수정하는 방법 (`/people`)

#### STUDENTS

1. public 폴더 내 `public/people/students`에 학생 사진을 추가해 주세요.

   - 예: `public/students/gildong-hong.png`

2. 학생 정보를 `data/people/students`에 등록해주세요.
   `people/students` 파일 내 사람을 아래 객체 중 하나에 추가하세요.

   - PHD_STUDENTS
   - MASTER_STUDENTS
   - UNDERGRADUATE_STUDENTS

양식은 아래와 같아요. 양식이 틀리면 빨간줄로 표시될거예요.

```tsx
{
  // 방금 추가한 이미지 경로 (없다면 그냥 회색 영역으로 표시됩니다)
  image: "/people/students/gildong-hong.png",
  // * 필수: 이름
  name: "Gil Dong Hong",
  // 아래 정보들은 전부 optional합니다. 넣으면 뜨고, 안넣어도 괜찮아요.
  email: "gildonghong@korea.ac.kr",
  github: "https://github.com/gildong",
  website: "https://gildong.github.io/",
  github: "https://github.com/gildong",
  linkedin: "https://linkedin/gildong"
},
```

#### ALUMNI

Alumni는 다른 파일에서 관리하고 있어요. (`data/people/alumnis`)

학생 이미지 파일을 students -> alumni로 옮겨주면 추후 관리하기 용이합니다.
에를 들어 홍길동이 학생에서 alumni가 되었다면,

- `public/people/students` -> `public/people/alumni` 로 옮겨주세요

Alumni 양식은 조금 다릅니다. email, github, linkedin 등이 없어요.
대표 사이트 하나만 website에 등록할 수 있습니다. 필수는 아닙니다.
`field`에는 어느 분야를 가게 되었는지를 작성합니다. 마찬가지로 필수값은 아니에요.

```ts
{
  // ALUMNI 폴더 안에 있는 이미지
  image: "/people/alumni/gildong-hong.png",
  name: "Jaeyoung Kang",
  // 아래 두개는 optional합니다.
  website: "https://tycheyoung.github.io/",
  field: "Engineer, Google",
},
```

추가했다면 로컬에서 테스트는 필수에요!

---

### 2. 공지사항 추가/수정하는 방법

공지사항 위치는 `data/home/NotificationList.ts`에 있습니다.

![Image](/explanation_assets/notification.png)
 
 공시사항은 객체에 정의된 순서대로 쌓입니다. (id, created기준이 아님.)

```ts
  {
    id: 3, // incrementing 고유값으로 입력해주세요. 
    title: "대학원생 모집 공고",
    description: "현재 LICS 연구실에서 대학원생을 모집하고 있습니다.",
    createdAt: "2025-08-08",
    resources: [ // 이미지는 아래와 같이 추가해주세요.
      {
        url: "/research/2-distributed/3.gif",
        description: "예시 이미지입니다.",
      },
    ],
  },
```


우측에는 **주요공지**가 있습니다. 

주로 모집공고에 사용되겠지만 내용은 자유롭게 변경이 가능해요.
`MainAnnouncement.ts`의 `endDate` 기준으로 노출되니, 쭉 올려두고 싶다면 2099년으로 설정해두면 됩니다.  
클릭 시 열리는 팝업은 공지사항 팝업입니다.

✅ 공지사항에 부여된 id를 `MainAnnouncement`의 `noticeId에` 넣어주세요! 

---

### 3. Research 추가/수정하는 방법

research는 ResearchList에 적혀진 대로 정렬되어 보여집니다.
연구목록 위치는 `data/research/ResearchList.ts`에 있어요.

![Image](/explanation_assets/research.png)

이미지들은 아래와 같이 `Resources` 배열에 추가하면 됩니다.
```tsx
  {
    id: 1,
    title: "지능형 차량 통신 네트워크",
    subtitle: "IEEE,Vehicular Technology Magazine, 2024",
    description: `LTE 차량 네트워크에서의 지능형 차량 서비스(ITS) 를 지원하는 네트워크
		기지국 등의 인프라를 통하지 않고, 차량 간의 직접 통신이 가능한 환경에서의 분산 협력 측위 시스템 구축
		상대 차량의 방위각, 상대거리 정보 (평균, 분산) 만 주고 받고 정확한 측위 
		실제 도심 지역 (서울시) 지리정보를 기반하여 ITS 디지털 트윈 구형  `,
    resources: [
      {
        url: "/research/1-its/1.gif",
        description: "ITS 측위 시뮬레이터",
      },
      {
        url: "/research/1-its/2.png",
        description: "서울시 지역 ITS 디지털 트윈",
      },
      {
        url: "/research/1-its/3.png",
        description: "서울시 지역 ITS 디지털 트윈",
      },
    ],
  },
```

---

### 4. Publications 수정 방법

⚠️ 리디자인 이후로 방식이 바뀌었어요! 더 이상 TS 배열(`conferences.ts`, `patents.ts` 등)을 손으로 고치지 않습니다.

- 실제 데이터: `data/publications/publications.json` (논문/특허), `data/publications/authors.json` (저자 목록)
- 매달 1일, 서버가 자동으로 OpenAlex(공개 학술 DB)에서 우리 연구실 관련 신규 논문을 찾아 `pending` 상태로 Pull Request(PR)를 만들어줘요.
- 사람이 할 일은 그 PR에서 논문이 맞는지 확인하고 `pending` → `verified`로 바꾼 뒤 머지하는 것뿐입니다.
- 옛날 논문을 누락했거나, 저자를 새로 등록해야 하거나, 자동 수집이 실패했을 때 복구하는 방법까지 전부 **[`docs/PUBLICATIONS.md`](docs/PUBLICATIONS.md)** 에 정리되어 있어요. 논문 관련 작업은 이 문서를 따라주세요.
- 참고로 `conferences.ts` / `patents.ts` / `publicationContent.ts`는 예전 데이터로, 혹시 `publications.json`이 깨지더라도 사이트가 자동으로 이 레거시 데이터를 보여주는 안전장치 용도로만 남아있어요. 이제 이 파일들을 직접 고칠 필요는 없습니다.

---

### 5. 연락처 / 주소 수정하는 방법

연락처 정보(전화번호, 팩스, 이메일, 주소, 사무실 호실 등)는 **`src/constants/contact.ts`** 한 곳에서만 관리돼요. 사이트 하단 Footer와 `/contact` 페이지가 전부 이 파일을 읽어서 보여주기 때문에, 여기 값만 고치면 사이트 전체에 반영됩니다.

```ts
export const CONTACT = {
  labName: "Lab for Informatics, Communications, and Systems",
  professor: "Prof. Sang Hyun Lee",
  school: "School of Electrical Engineering, Korea University",
  office: "Engineering Building, Room 407",
  tel: "+82-2-3290-3218",
  fax: "+82-2-921-0544",
  professorEmail: "sanghyunlee@korea.ac.kr",
  labEmail: "lics@korea.ac.kr",
  addressLines: [...],
  mapQuery: "Korea University Engineering Building Seoul",
};
```

값 하나 바꾸고 로컬에서 `/contact` 페이지랑 Footer만 확인하면 끝이에요.

---

### 6. 메인 화면(히어로) 영상/이미지 교체하는 방법

첫 화면(홈 히어로 섹션)은 기본적으로 코드로 그려지는 움직이는 그래픽(신호가 퍼지는 네트워크 애니메이션)이 나와요. 나중에 연구실 대표 영상이나 이미지가 준비되면 코드 몇 줄만 바꿔서 교체할 수 있게 만들어뒀습니다.

- 히어로 영상을 그려주는 컴포넌트: `src/modules/home/_components/HeroMedia.tsx` — `videoSrc` prop을 받으면 자동 애니메이션 대신 그 영상을 재생합니다.
- 실제로 히어로에 컴포넌트를 배치하는 곳: `src/modules/home/MainHeroSection.tsx`

교체 방법:

1. 영상 파일(mp4/webm 등)을 `public` 폴더에 넣습니다. 예: `public/hero.webm`
2. `src/modules/home/MainHeroSection.tsx`에서 아래처럼 `videoSrc`를 넘겨주세요.

```tsx
<HeroMedia videoSrc="/hero.webm" />
```

이게 끝이에요. `videoSrc`를 안 넘기면 원래의 자동 애니메이션이 그대로 나옵니다.

---

### 7. 새 페이지: `/contact`

문의/오시는 길 페이지가 새로 생겼어요 (`src/app/contact/page.tsx`). 주소, 전화, 팩스, 이메일, 대학원 지원 안내가 여기 담겨 있고, 이 페이지에 뜨는 연락처 정보도 위 5번의 `src/constants/contact.ts`를 그대로 읽어옵니다. 즉, 연락처를 바꾸고 싶으면 이 페이지가 아니라 `contact.ts`만 고치면 됩니다.

---

### 8. 배포가 잘못됐을 때 (복구 방법)

- 배포 방식은 그대로예요: main 브랜치(혹은 배포 대상 브랜치)에 push하면 Vercel이 자동으로 빌드/배포합니다.
- 배포 후 화면이 이상하거나 에러가 난다면, 가장 안전한 방법은 **문제가 생기기 전 커밋으로 되돌리는 것**이에요.

```js
git log // 이전 커밋들을 확인
git revert <되돌리고 싶은 커밋의 해시> // 그 커밋의 변경사항만 취소하는 새 커밋을 만듦
git push
```

  `git revert`는 히스토리를 지우지 않고 "취소하는 커밋"을 새로 추가하는 방식이라 안전해요.

- 참고로 출판물 데이터(`data/publications/publications.json`)가 실수로 깨지거나 형식이 잘못돼도, 사이트가 다운되지 않고 예전 레거시 목록으로 자동 대체되어 보여집니다. 그래도 원인 파악과 복구는 [`docs/PUBLICATIONS.md`](docs/PUBLICATIONS.md)의 "장애 복구" 섹션을 참고해주세요.

---
> 궁금한점이나 막히는 부분 있다면 언제든 아래 연락처로 문의주세요!
> hayeongpark@naver.com
