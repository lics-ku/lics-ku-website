/**
 * Typographic wordmark. The crimson "signal dot" ties the mark to the accent
 * system and the lab's communications identity without leaning on the 3D logo
 * image (kept for the favicon / OG asset instead).
 */
export const Logo = ({ hideIcon = false }: { hideIcon?: boolean }) => {
  return (
    <span className="flex items-baseline gap-2 select-none">
      <span className="text-lg font-extrabold tracking-tight text-foreground">
        LICS
        <span className="text-crimson">.</span>
      </span>
      {!hideIcon && (
        <span className="hidden font-mono text-[0.62rem] tracking-[0.2em] text-muted-foreground sm:inline">
          KOREA&nbsp;UNIV.
        </span>
      )}
    </span>
  );
};
