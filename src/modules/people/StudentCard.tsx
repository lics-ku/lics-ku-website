import Image from "next/image";

import { type Student } from "@data/index";
import { StudentLinks } from "./StudentLinks";

export const StudentCard = ({ student }: { student: Student }) => {
  const image = student.image ?? "/people/default_profile.png";

  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-crimson/40">
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={image}
          alt={student.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="p-4">
        <StudentLinks student={student} />
      </div>
    </div>
  );
};
