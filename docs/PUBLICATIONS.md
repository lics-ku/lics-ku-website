# 출판물 데이터 운영 안내

이 문서는 개발자가 아니어도 출판물 목록을 검토·수정할 수 있도록 정리한 안내입니다.
실제 목록은 `data/publications/publications.json`에 있고, 웹사이트는 이 파일을 읽습니다.

## 자동 수집과 검토

매월 1일에 OpenAlex 공개 학술 데이터베이스를 조회합니다. 새 항목이 있으면 웹사이트에 바로 반영하지 않고 `pending` 상태의 Pull Request(PR)를 만듭니다.

1. GitHub에서 제목에 `review pending OpenAlex works`가 포함된 PR을 엽니다.
2. 논문 제목, 저자, 연도, 학회/저널, DOI 또는 링크를 원문(출판사 페이지, DOI 페이지 등)과 대조합니다.
3. 맞는 논문이면 해당 항목의 `"status": "pending"`을 `"status": "verified"`로 바꿉니다.
4. 틀렸거나 연구실과 무관한 항목이면 그 항목 전체를 삭제합니다.
5. 검토가 끝나면 PR을 머지합니다.

자동 수집은 고려대학교 소속 정보, 등록된 연구 키워드, 그리고 현재 검증 목록의 최신 연도보다 새롭다는 조건을 모두 만족하는 저작만 후보로 삼습니다. 과거 누락 논문은 아래의 수동 추가 방법으로 넣습니다. 그래도 동명이인·메타데이터 오류가 있을 수 있으므로 반드시 사람이 검토합니다.

## 논문을 수동으로 추가하기

`papers` 배열 끝에 아래 형식으로 한 항목을 추가합니다. `id`는 DOI가 있으면 `doi:` 뒤에 DOI를 붙이고, DOI가 없으면 중복되지 않는 `manual:` 식별자를 사용합니다.

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

`type`은 `journal`, `conference`, `book-chapter` 중 하나여야 합니다. 확실하지 않은 값은 억지로 채우지 말고 `null`을 사용합니다.

## 잘못 들어온 논문 제거

자동 수집 PR에서는 잘못된 `pending` 항목 전체를 삭제한 뒤 PR을 머지합니다. 이미 검증되어 공개된 항목을 지울 때는 원문을 확인하고, 삭제 이유를 PR 설명 또는 커밋 메시지에 남깁니다. 다른 항목의 `raw` 원문은 수정하지 마세요.

## 저자 추가

`data/publications/authors.json`에 새 객체를 추가합니다. OpenAlex의 저자 ID(`A...`)와 기관 ID(`I...`)는 OpenAlex에서 직접 확인해야 합니다. 같은 이름의 후보 저작 제목을 기존 목록과 정규화해 비교한 뒤, 가장 많이 겹치고 소속이 맞는 후보만 등록합니다. `affiliationKeywords`에는 기관명과 공식 이메일 도메인처럼 소속을 확인할 수 있는 단어를 넣고, `researchTitleKeywords`에는 연구 분야를 판별할 제목 키워드를 넣습니다.

```json
{
  "name": "이름",
  "openAlexAuthorId": "A123456789",
  "institutionId": "I123456789",
  "institutionName": "기관명",
  "affiliationKeywords": ["기관명", "example.ac.kr"],
  "researchTitleKeywords": ["wireless", "network"]
}
```

## 장애 복구

자동 수집이 실패해도 기존 `publications.json`은 바뀌지 않습니다. GitHub Actions 로그에서 OpenAlex 오류 또는 JSON 형식 오류를 확인합니다.

- OpenAlex 네트워크 오류라면 다음 정기 실행을 기다리거나 Actions의 **Run workflow**를 눌러 다시 실행합니다.
- `authors.json` 또는 `publications.json` 형식 오류라면 최근 수정 내용을 되돌려 유효한 JSON인지 확인합니다.
- 목록 파일이 손상되어도 사이트는 기존 TypeScript 레거시 목록으로 자동 대체해 표시합니다. 복구 후에는 `npm run update:pubs`를 실행해 정상 동작을 확인합니다.
