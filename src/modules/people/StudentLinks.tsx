"use client";

import { type Student } from "@data/index";
import { Check, Copy, Github, Globe, Linkedin } from "lucide-react";
import { toast } from "sonner";

export const StudentLinks = ({ student }: { student: Student }) => {
  const copyEmail = () => {
    if (!student.email) return;
    navigator.clipboard.writeText(student.email);
    toast("Email copied", {
      description: student.email,
      icon: <Check className="size-3.5" />,
    });
  };

  const iconClass =
    "text-muted-foreground transition-colors hover:text-crimson focus-visible:outline-none focus-visible:text-crimson";

  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold tracking-tight text-foreground">
        {student.name}
      </p>

      {student.email && (
        <button
          type="button"
          onClick={copyEmail}
          className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
          aria-label={`Copy email address for ${student.name}`}
        >
          <span className="truncate">{student.email}</span>
          <Copy className="size-3 shrink-0" />
        </button>
      )}

      <div className="mt-1 flex items-center gap-3">
        {student.github && (
          <a
            href={student.github}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${student.name} on GitHub`}
            className={iconClass}
          >
            <Github className="size-[18px]" />
          </a>
        )}
        {student.linkedin && (
          <a
            href={student.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${student.name} on LinkedIn`}
            className={iconClass}
          >
            <Linkedin className="size-[18px]" />
          </a>
        )}
        {student.website && (
          <a
            href={student.website}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${student.name}'s website`}
            className={iconClass}
          >
            <Globe className="size-[18px]" />
          </a>
        )}
      </div>
    </div>
  );
};
