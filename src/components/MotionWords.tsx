import { Fragment } from "react";

/**
 * Keeps the semantic heading intact while exposing word masks for the shared
 * Reveal transition. The aria-label prevents screen readers from announcing
 * the decorative per-word spans one by one.
 */
export function MotionWords({ text }: { text: string }) {
  return (
    <span aria-hidden="true">
      {text.split(/\s+/).map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          {index > 0 && " "}
          <span data-word-mask>
            <span
              data-motion-word
              style={{ ["--word-delay" as string]: `${index * 52}ms` }}
            >
              {word}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  );
}
