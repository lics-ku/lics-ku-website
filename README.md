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

- `public/people/students` -> `data/people/alumni` 로 옮겨주세요

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
endedAt 기준으로 노출되니, 쭉 올려두고 싶다면 2099년으로 설정해두면 됩니다.  
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

- conference: `/data/publications/conferences.ts`
- patents:  `/data/publications/patents.ts`
- publicationContents:  `/data/publications/publicationContents.ts`

에 배열로 존재해요. 각 배열의 마지막 항목에 추가하면 됩니다.

---
> 궁금한점이나 막히는 부분 있다면 언제든 아래 연락처로 문의주세요!
> hayeongpark@naver.com
