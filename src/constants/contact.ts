/**
 * Single source of truth for the lab's real contact details.
 *
 * Values are taken from the professor page (`data/people/professor` context) and
 * Korea University's public address. The previous footer phone (+82-2-880-1234)
 * was a placeholder and has been dropped in favour of the professor's line.
 * See OPEN_QUESTION notes for the office-room discrepancy (#407 vs. 534).
 */
export const CONTACT = {
  labName: "Lab for Informatics, Communications, and Systems",
  professor: "Prof. Sang Hyun Lee",
  school: "School of Electrical Engineering, Korea University",
  office: "Engineering Building, Room 407",
  tel: "+82-2-3290-3218",
  fax: "+82-2-921-0544",
  professorEmail: "sanghyunlee@korea.ac.kr",
  labEmail: "lics@korea.ac.kr",
  addressLines: [
    "Korea University",
    "145 Anam-ro, Seongbuk-gu",
    "Seoul 02841, Republic of Korea",
  ],
  mapQuery: "Korea University Engineering Building Seoul",
} as const;
