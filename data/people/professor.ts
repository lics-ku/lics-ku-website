type Experience = {
  title: string;
  date: string;
  institution: string;
  institution_desc?: string;
};

export const PROFESSOR_EXPERIENCES: Experience[] = [
  {
    title:
      "Research Staff Member, Electronics and Telecommunications Research Institute, Daejeon, Korea",
    date: "2001 - 2011",
    institution:
      "Electronics and Telecommunications Research Institute, Daejeon, Korea",
  },
  {
    title:
      "Research Staff Member, Samsung Advanced Instititute of Technology, Yongin, Korea",
    date: "2011 - 2014",
    institution: "Samsung Advanced Instititute of Technology, Yongin, Korea",
  },
  {
    title: "Professor, Sejong University, Seoul, Korea",
    date: "2014 - 2016",
    institution: "Sejong University, Seoul, Korea",
  },
  {
    title: "Assistant Professor, Pusan National University, Busan, Korea",
    date: "2016 - 2017",
    institution: "Pusan National University, Busan, Korea",
  },
  {
    title: "Professor, Korea University, Seoul, Korea",
    date: "2017 - Present",
    institution: "Korea University, Seoul, Korea",
  },
];

type Education = {
  title: string;
  date: string;
  institution: string;
  institution_desc?: string;
};

export const PROFESSOR_EDUCATION: Education[] = [
  {
    title: "B.S. in Electrical Engineering",
    date: "1995 - 1999",
    institution: "KAIST",
    institution_desc: "Korea Advanced Institute of Science and Technology",
  },
  {
    title: "M.S. in Electrical Engineering",
    date: "1999 - 2001",
    institution: "KAIST",
    institution_desc: "Korea Advanced Institute of Science and Technology",
  },
  {
    title: "Ph.D. in Electrical Engineering",
    date: "2006 - 2011",
    institution: "University of Texas at Austin",
  },
];
