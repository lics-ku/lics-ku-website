/**
 * Single source of truth for the lab's real contact details.
 *
 * Confirmed by the lab (2026-07): professor office is Engineering Building
 * Room 407, the student lab is New Engineering Hall Room 534, and the
 * representative email is the professor's address.
 */
export const CONTACT = {
  labName: "Lab for Informatics, Communications, and Systems",
  professor: "Prof. Sang Hyun Lee",
  school: "School of Electrical Engineering, Korea University",
  professorOffice: "Engineering Building (공학관), Room 407",
  labRoom: "New Engineering Hall (신공학관), Room 534",
  tel: "+82-2-3290-3218",
  fax: "+82-2-921-0544",
  professorEmail: "sanghyunlee@korea.ac.kr",
  addressLines: [
    "Korea University",
    "145 Anam-ro, Seongbuk-gu",
    "Seoul 02841, Republic of Korea",
  ],
  mapQuery: "Korea University Engineering Building Seoul",
} as const;
