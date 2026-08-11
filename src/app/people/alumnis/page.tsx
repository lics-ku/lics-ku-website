import {
  MS_ALUMNIS,
  PHD_ALUMNIS,
  UNDERGRADUATE_ALUMNIS,
} from "@data/people/alumnis";
import { Reveal } from "@/components/Reveal";
import { AlumniCard } from "@/modules/people/AlumniCard";
import { type Alumni } from "@data/index";

const AlumniGroup = ({
  title,
  count,
  alumni,
}: {
  title: string;
  count: number;
  alumni: Alumni[];
}) => (
  <section className="flex flex-col gap-6">
    <div className="flex items-baseline gap-3">
      <h2 className="text-xl font-bold tracking-tight">{title}</h2>
      <span className="font-mono text-xs text-muted-foreground">
        {String(count).padStart(2, "0")}
      </span>
    </div>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {alumni.map((person, idx) => (
        <Reveal key={idx} delay={(idx % 2) * 60}>
          <AlumniCard alumni={person} />
        </Reveal>
      ))}
    </div>
  </section>
);

const AlumniPage = () => {
  return (
    <div className="flex flex-col gap-16">
      {PHD_ALUMNIS.length > 0 && (
        <AlumniGroup
          title="Ph.D. Alumni"
          count={PHD_ALUMNIS.length}
          alumni={PHD_ALUMNIS}
        />
      )}
      {MS_ALUMNIS.length > 0 && (
        <AlumniGroup
          title="M.S. Alumni"
          count={MS_ALUMNIS.length}
          alumni={MS_ALUMNIS}
        />
      )}
      {UNDERGRADUATE_ALUMNIS.length > 0 && (
        <AlumniGroup
          title="Undergraduate Alumni"
          count={UNDERGRADUATE_ALUMNIS.length}
          alumni={UNDERGRADUATE_ALUMNIS}
        />
      )}
    </div>
  );
};

export default AlumniPage;
