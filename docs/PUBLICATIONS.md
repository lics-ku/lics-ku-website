# 출판물 데이터 운영 안내

이 문서는 개발자가 아니어도 자동 수집 결과를 검토하고 출판물 목록을 관리할 수 있도록 정리한 안내입니다. 실제 목록은 `data/publications/publications.json`에 있고, 웹사이트에는 `verified` 논문만 표시됩니다. `pending` 논문은 검토 전까지 비공개입니다.

## 자동 수집 방식

매월 1일에 OpenAlex 공개 학술 데이터베이스를 조회하고 변경이 있으면 Pull Request(PR)를 만듭니다. 수집기는 최신 연도 이후의 논문만 보는 것이 아니라 과거 저작 전체를 다시 확인하므로, 예전에 빠진 논문도 이후 실행에서 찾을 수 있습니다.

동명이인 논문을 막기 위해 저자 ID나 제목 단어 하나만으로 결정하지 않습니다. 다음 신호를 함께 사용합니다.

- 기존 `verified` 논문의 공저자와 현재 학생·졸업생 이름
- 제목과 OpenAlex의 topics·concepts가 연구실 분야에 맞는지
- 해당 저작에 기록된 소속과 기존 출판 venue
- OpenAlex 저자 프로필 조사에서 주 ID인지, 오병합 논문 탐색용 보조 ID인지

강한 신호가 함께 맞으면 `verified`, 관련 가능성은 있지만 근거가 부족하면 `pending`으로 저장합니다. 명백한 타 분야 논문은 저장하지 않습니다. 보조 저자 ID는 잡음이 많으므로 신뢰 공저자 두 명 이상과 별도 보강 신호가 있어야 자동 승인됩니다.

중복은 DOI와 OpenAlex work ID를 먼저 확인합니다. DOI가 없는 기존 항목은 제목뿐 아니라 연도, 유형, 공저자, venue를 함께 비교합니다. 같은 제목이어도 conference와 journal처럼 유형이 다르거나 서로 다른 DOI가 있으면 별개 논문으로 보존합니다. 온라인 선공개와 인쇄판의 연도·venue 표기 차이는 공저자까지 일치할 때만 같은 판본으로 판단합니다.

## 자동 수집 PR 검토

1. GitHub에서 제목에 `review classified OpenAlex works`가 포함된 PR을 엽니다.
2. PR 본문에서 각 논문의 자동 판정(`verified` 또는 `pending`)을 확인합니다.
3. `verified` 항목도 제목, 저자, 연도, venue, DOI를 원문과 표본 대조합니다. 동명이인 논문이 자동 승인됐다면 해당 항목 전체를 삭제하고 판정 규칙의 보강이 필요한지 개발자에게 알립니다.
4. `pending` 항목은 모두 원문과 대조합니다. 연구실 논문이면 해당 항목의 `"status": "pending"`을 `"status": "verified"`로 바꿉니다.
5. 다른 사람의 논문이거나 잘못 연결된 판본이면 그 `papers` 항목 전체를 삭제합니다. 주변 논문이나 기존 `raw` 값은 수정하지 않습니다.
6. 검토가 끝나면 PR을 머지합니다. 머지 후 `verified`만 사이트에 표시됩니다.

판정이 어려우면 억지로 승인하지 말고 `pending`을 유지한 채 저자 소속, 공저자, DOI 원문을 추가 확인합니다.

## 논문을 수동으로 추가하기

`papers` 배열 끝에 아래 형식으로 한 항목을 추가합니다. `id`는 DOI가 있으면 `doi:` 뒤에 정규화한 DOI를 붙이고, DOI가 없으면 중복되지 않는 `manual:` 식별자를 사용합니다.

```json
{
  "id": "doi:10.0000/example",
  "type": "journal",
  "title": "논문 제목",
  "authors": ["저자 1", "저자 2"],
  "year": 2026,
  "venue": "저널 또는 학회명",
  "doi": "10.0000/example",
  "url": "https://doi.org/10.0000/example",
  "status": "verified",
  "source": "manual"
}
```

`type`은 `journal`, `conference`, `book-chapter` 중 하나여야 합니다. 확실하지 않은 서지정보는 창작하지 말고 OpenAlex나 출판사 원문에서 확인합니다.

## 잘못 들어온 논문 제거

새 PR의 잘못된 `pending` 또는 자동 `verified` 항목은 객체 전체를 삭제합니다. 이미 배포된 `verified` 항목을 지워야 한다면 원문을 다시 확인하고 삭제 이유를 PR 설명이나 커밋 메시지에 남깁니다. 다른 기존 `verified` 항목의 제목·저자·연도·venue·DOI와 `raw` 원문은 함께 고치지 않습니다.

같은 동명이인 분야가 반복 유입되면 `data/publications/authors.json`의 `excludedTopicKeywords`를 보강할 수 있습니다. 이때 실제 연구실의 제브라피시·나노복합체처럼 통신 외 연구 분야까지 막지 않는지 테스트와 다음 자동 수집 결과로 확인해야 합니다.

## 저자 ID 조사와 설정

`data/publications/authors.json`의 `openAlexAuthorIds`에는 ORCID, 소속, 기존 제목 교집합으로 확인한 주 ID를 넣습니다. 다른 사람의 프로필에 연구실 논문이 일부 오병합된 경우에만 `secondaryOpenAlexAuthorIds`에 넣습니다. 보조 ID는 엄격한 공저자 규칙으로 처리됩니다.

후보를 추가하거나 제외할 때는 `identification.candidates`에 조사 날짜, ORCID, 조회 건수, 기존 제목 일치 수, 포함·제외 이유를 남깁니다. 프로필 전체의 ORCID는 병합된 모든 work에 복사될 수 있으므로 개별 논문의 자동 승인 근거로 사용하지 않습니다.

다른 언어로 번역된 메타데이터처럼 자동 비교만으로 판별하기 어려운 확정 중복은 `knownDuplicateOpenAlexWorkIds`에 OpenAlex work ID를 넣고, `identification.knownDuplicates`에 기존 항목과의 일치 근거를 함께 남깁니다. 설정된 ID라도 연도·유형·전체 저자·venue가 기존 항목과 맞을 때만 건너뛰며, 메타데이터가 달라지면 일반 후보처럼 다시 판정합니다.

## 실행과 장애 복구

로컬에서 다음 명령을 사용합니다.

```bash
npm run test:pubs
npm run update:pubs
npm run build
```

수집은 모든 OpenAlex 호출과 판정을 마친 뒤 임시 파일을 원자적으로 교체합니다. 네트워크 오류, 잘못된 JSON, 쓰기 오류가 나면 기존 `publications.json`은 바뀌지 않습니다.

- OpenAlex 네트워크 오류라면 다음 정기 실행을 기다리거나 Actions의 **Run workflow**를 눌러 다시 실행합니다.
- `authors.json` 또는 `publications.json` 형식 오류라면 최근 수정 내용을 되돌려 유효한 JSON인지 확인합니다.
- 목록 파일이 손상되어도 사이트는 기존 TypeScript 레거시 목록으로 대체해 표시합니다. 복구 후 위 세 명령을 다시 실행합니다.
