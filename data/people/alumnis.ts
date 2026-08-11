import { Alumni } from "@data/_types/people_types";

/**
 * 졸업생 목록. 학위 과정별로 나뉘어 있고, 각 배열의 순서대로 화면에 표시됩니다.
 * `field`에는 졸업 후 진로를 적습니다 (선택 사항).
 * 사진은 `public/people/alumni/` 폴더에 두세요.
 */
export const PHD_ALUMNIS: Alumni[] = [
  {
    image: "/people/alumni/heesoo-kim.jpg",
    name: "Heesoo Kim",
    website: "https://github.com/happywater12",
    field: "Postdoctoral Researcher, Center for ICT & Society, Korea University",
  },
  {
    image: "/people/alumni/hongki-kim.jpg",
    name: "Hong Ki Kim",
    website:
      "https://ihatemushroom.notion.site/About-Hong-Ki-Kim-129a76a7e22e80139125c0f2d66d2d09",
    field: "Professor, Gachon University",
  },
  {
    image: "/people/alumni/sungil-choi.jpg",
    name: "Sung Il Choi",
    website: "https://sites.google.com/view/kucsi",
  },
];

export const MS_ALUMNIS: Alumni[] = [
  {
    image: "/people/alumni/youngjin-song.jpg",
    name: "Youngjin Song",
    website: "https://www.linkedin.com/in/youngjinsong4090/",
    field: "SK Telecom",
  },
  {
    image: "/people/alumni/minji-kim.jpg",
    name: "Minji Kim",
    website: "https://github.com/kimminji1013",
    field: "Hyundai AutoEver",
  },
  {
    image: "/people/alumni/soohyeok-park.jpg",
    name: "Soohyeok Park",
    website: "https://github.com/dippingconda",
  },
  {
    image: "/people/alumni/yunjae-choi.jpg",
    name: "Yunjae Choi",
    website: "https://github.com/YunjaeChoi",
    field: "Samsung Research",
  },
  {
    image: "/people/alumni/sunho-kim.jpg",
    name: "Sunho Kim",
    website: "https://github.com/Preference-Kim",
    field: "Special Research Agent",
  },
  {
    image: "/people/alumni/yoonku-lee.jpg",
    name: "Yoon Ku Lee",
    website: "https://www.linkedin.com/in/yoon-ku-lee/",
    field: "Samsung Electronics, DX Division",
  },
];

export const UNDERGRADUATE_ALUMNIS: Alumni[] = [
  {
    image: "/people/alumni/juseung-lee.jpg",
    name: "Juseung Lee",
    website: "https://github.com/gitchobo-lee",
  },
  {
    name: "Sungho Jo",
  },
  {
    image: "/people/alumni/jaeyoung-kang.png",
    name: "Jaeyoung Kang",
    website: "https://tycheyoung.github.io/",
    field: "Machine Learning Engineer, Apple",
  },
  {
    image: "/people/alumni/minsu-zhang.png",
    name: "Minsu Zhang",
    website: "https://minsuzhang.github.io/",
  },
  {
    name: "Yesol Yun",
    field: "NC Soft",
  },
];
