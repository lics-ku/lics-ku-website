import {
  MASTER_STUDENTS,
  PHD_STUDENTS,
  UNDERGRADUATE_STUDENTS,
  Student,
} from "@data/index";
import { Reveal } from "@/components/Reveal";
import { StudentCard } from "@/modules/people/StudentCard";

const StudentGrid = ({
  title,
  count,
  students,
}: {
  title: string;
  count: number;
  students: Student[];
}) => (
  <section className="flex flex-col gap-6">
    <div className="flex items-baseline gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <span className="font-mono text-xs text-muted-foreground">
        {String(count).padStart(2, "0")}
      </span>
    </div>
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {students.map((student, idx) => (
        <Reveal key={idx} variant="scale" delay={(idx % 4) * 60}>
          <StudentCard student={student} />
        </Reveal>
      ))}
    </div>
  </section>
);

const StudentsPage = () => {
  return (
    <div className="flex flex-col gap-16">
      {PHD_STUDENTS.length > 0 && (
        <StudentGrid
          title="Ph.D. Candidates"
          count={PHD_STUDENTS.length}
          students={PHD_STUDENTS}
        />
      )}
      {MASTER_STUDENTS.length > 0 && (
        <StudentGrid
          title="Master's Candidates"
          count={MASTER_STUDENTS.length}
          students={MASTER_STUDENTS}
        />
      )}
      {UNDERGRADUATE_STUDENTS.length > 0 && (
        <StudentGrid
          title="Undergraduate Researchers"
          count={UNDERGRADUATE_STUDENTS.length}
          students={UNDERGRADUATE_STUDENTS}
        />
      )}
    </div>
  );
};

export default StudentsPage;
