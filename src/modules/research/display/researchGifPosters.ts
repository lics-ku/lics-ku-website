import type { StaticImageData } from "next/image";

import hologram3 from "@/assets/research-posters/10-hologram/3.webp";
import eeg2 from "@/assets/research-posters/11-eeg/2.webp";
import eeg3 from "@/assets/research-posters/11-eeg/3.webp";
import wireless2 from "@/assets/research-posters/12-wireless/2.webp";
import wireless3 from "@/assets/research-posters/12-wireless/3.webp";
import quantum2 from "@/assets/research-posters/13-quantum/2.webp";
import its1 from "@/assets/research-posters/1-its/1.webp";
import distributed3 from "@/assets/research-posters/2-distributed/3.webp";
import distributed4 from "@/assets/research-posters/2-distributed/4.webp";
import zebrafish2 from "@/assets/research-posters/3-zebrafish/2.webp";
import zebrafish3 from "@/assets/research-posters/3-zebrafish/3.webp";
import iot1 from "@/assets/research-posters/4-iot/1.webp";
import iot2 from "@/assets/research-posters/4-iot/2.webp";
import mass5 from "@/assets/research-posters/5-mass/5.webp";
import mass6 from "@/assets/research-posters/5-mass/6.webp";
import blockchain2 from "@/assets/research-posters/6-blockchain/2.webp";
import nano2 from "@/assets/research-posters/7-nano/2.webp";
import social1 from "@/assets/research-posters/8-social/1.webp";
import social2 from "@/assets/research-posters/8-social/2.webp";
import social3 from "@/assets/research-posters/8-social/3.webp";
import social4 from "@/assets/research-posters/8-social/4.webp";
import social5 from "@/assets/research-posters/8-social/5.webp";
import hpc4 from "@/assets/research-posters/9-hpc/4.webp";
import hpc5 from "@/assets/research-posters/9-hpc/5.webp";

const RESEARCH_GIF_POSTERS = {
  "/research/1-its/1.gif": its1,
  "/research/2-distributed/3.gif": distributed3,
  "/research/2-distributed/4.gif": distributed4,
  "/research/3-zebrafish/2.gif": zebrafish2,
  "/research/3-zebrafish/3.gif": zebrafish3,
  "/research/4-iot/1.gif": iot1,
  "/research/4-iot/2.gif": iot2,
  "/research/5-mass/5.gif": mass5,
  "/research/5-mass/6.gif": mass6,
  "/research/6-blockchain/2.gif": blockchain2,
  "/research/7-nano/2.gif": nano2,
  "/research/8-social/1.gif": social1,
  "/research/8-social/2.gif": social2,
  "/research/8-social/3.gif": social3,
  "/research/8-social/4.gif": social4,
  "/research/8-social/5.gif": social5,
  "/research/9-hpc/4.gif": hpc4,
  "/research/9-hpc/5.gif": hpc5,
  "/research/10-hologram/3.gif": hologram3,
  "/research/11-eeg/2.gif": eeg2,
  "/research/11-eeg/3.gif": eeg3,
  "/research/12-wireless/2.gif": wireless2,
  "/research/12-wireless/3.gif": wireless3,
  "/research/13-quantum/2.gif": quantum2,
} satisfies Record<string, StaticImageData>;

export function getResearchGifPoster(src: string) {
  return RESEARCH_GIF_POSTERS[src as keyof typeof RESEARCH_GIF_POSTERS];
}
