interface NavigationItem {
  label: string;
  url: string;
}

/**
 * 주의: 추가 시 각 아이템에 해당하는 페이지도 생성해야 합니다.
 * 예: /new 페이지 생성 시 apps > new 폴더 생성 후 page.tsx 파일 생성
 */
export const DEFAULT_NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: "Home",
    url: "/",
  },
  {
    label: "Research",
    url: "/research",
  },
  {
    label: "Publications",
    url: "/publications",
  },
  {
    label: "People",
    url: "/people",
  },
  {
    label: "Contact",
    url: "/contact",
  },
];
