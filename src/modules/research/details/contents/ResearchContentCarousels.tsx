"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

import {
  Carousel,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  CarouselContent,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Resource } from "@data/index";

export const ResearchContentCarousels = ({
  resources,
}: {
  resources: Resource[];
}) => {
  const showNavigation = resources.length > 1;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  return (
    <figure className="flex flex-col gap-3">
      <Carousel
        setApi={setApi}
        opts={{ loop: showNavigation }}
        className="w-full"
      >
        <CarouselContent>
          {resources.map((resource, index) => (
            <CarouselItem key={index}>
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border bg-muted">
                <Image
                  src={resource.url}
                  alt={resource.description ?? "Research figure"}
                  fill
                  sizes="(max-width: 900px) 100vw, 900px"
                  className="object-contain"
                  unoptimized={resource.url.endsWith(".gif")}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showNavigation && (
          <>
            <CarouselPrevious className="left-3 border-border bg-background/80 text-foreground backdrop-blur hover:bg-background" />
            <CarouselNext className="right-3 border-border bg-background/80 text-foreground backdrop-blur hover:bg-background" />
          </>
        )}
      </Carousel>

      <div className="flex items-center justify-between gap-4">
        <figcaption className="min-h-5 flex-1 text-sm text-muted-foreground">
          {resources[current]?.description}
        </figcaption>
        {showNavigation && (
          <span className="shrink-0 font-mono text-xs text-muted-foreground">
            {String(current + 1).padStart(2, "0")} /{" "}
            {String(resources.length).padStart(2, "0")}
          </span>
        )}
      </div>
    </figure>
  );
};
