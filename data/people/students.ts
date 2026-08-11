import { Student } from "@data/_types/people_types";

/**
 * 재학생 목록. 각 배열의 순서대로 화면에 표시되며, 빈 배열은 화면에서 숨겨집니다.
 * 사진은 `public/people/students/` 폴더에 두세요.
 * 졸업하면 `data/people/alumnis.ts`로 옮기고 사진도 `public/people/alumni/`로 옮겨주세요.
 */
export const PHD_STUDENTS: Student[] = [
  {
    image: "/people/students/yonghun-jang.jpg",
    name: "Yong Hun Jang",
    email: "disclose@korea.ac.kr",
    github: "https://github.com/gyh1238",
    website: "https://gyh1238.github.io/",
  },
  {
    image: "/people/students/wookjin-lee.jpg",
    name: "Wookjin Lee",
    website: "https://sites.google.com/view/eightymile/",
  },
  {
    image: "/people/students/wonyoung-kang.jpg",
    name: "Won-Young Kang",
    website: "https://github.com/dogs0667LICS",
  },
  {
    image: "/people/students/seunghyun-oh.jpg",
    name: "Seung Hyun Oh",
    email: "seunghyunoh@korea.ac.kr",
    github: "https://github.com/DragonTrainerTristana",
  },
  {
    image: "/people/students/jungbum-lee.jpg",
    name: "JungBum Lee",
    email: "felix9698@korea.ac.kr",
    github: "https://github.com/felix9698",
    website: "https://scholar.google.co.kr/citations?user=h5rKGYAAAAAJ&hl=ko",
  },
  {
    image: "/people/students/gun-kim.jpg",
    name: "Gun Kim",
    github: "https://github.com/brandonkims",
  },
];

export const MASTER_STUDENTS: Student[] = [
  {
    image: "/people/students/seungeui-byun.jpg",
    name: "Seungeui Byun",
    email: "shoreview01@korea.ac.kr",
  },
  {
    image: "/people/students/seunggwan-oh.jpg",
    name: "SeungGwan Oh",
  },
];

export const UNDERGRADUATE_STUDENTS: Student[] = [];
