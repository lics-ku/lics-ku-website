/**
 * 출판물 구조화 스키마 — UI(src/)와 수집 파이프라인(scripts/)이 공유하는 계약.
 *
 * 소유권 규칙 (Orchestra):
 * - 이 파일 자체는 디스패처가 관리하며 실행자는 수정하지 않는다.
 * - 파이프라인 측은 이 스키마를 만족하는 data/publications/publications.json 과
 *   검증·폴백이 포함된 로더 data/publications/loadPublications.ts 를 제공한다.
 * - UI 측은 loadPublications() 반환값(PublicationsData)만 소비한다.
 */

export type PaperType = "journal" | "conference" | "book-chapter";

/** verified: 사람이 확인 완료 / pending: 자동 수집됨, 검토 대기(노출 여부는 UI 정책) */
export type PaperStatus = "verified" | "pending";

export type PaperSource = "openalex" | "manual" | "legacy";

export interface Paper {
  /** 안정 식별자: "doi:10..." > "openalex:W..." > "legacy:<종류>-<번호>" 우선순위 */
  id: string;
  type: PaperType;
  title: string;
  authors: string[];
  year: number | null;
  /** 저널명 또는 학회명 */
  venue: string | null;
  doi: string | null;
  /** 원문/출판사 링크 */
  url: string | null;
  status: PaperStatus;
  source: PaperSource;
  /** legacy 항목의 원본 한 줄 문자열. 파싱 불완전 시 UI가 이 값을 그대로 표시해도 된다. */
  raw?: string;
}

export interface Patent {
  id: string;
  title: string;
  inventors: string[];
  year: number | null;
  /** 출원/등록 번호 */
  number: string | null;
  country: "domestic" | "international";
  raw?: string;
}

export interface PublicationsData {
  /** 마지막 갱신 시각 (ISO 8601) */
  updatedAt: string;
  papers: Paper[];
  patents: Patent[];
}
