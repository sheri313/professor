"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SMOOTH_EASE, getRevealStates, prefersReducedMotion } from "@/utils/animations";

type SlideDirection = "left" | "right" | "up" | "down";

interface BatchStates {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
}

const BENTO_DISTANCE = 72;
const BATCH_STAGGER = 0.09;

const slideOffsets: Record<SlideDirection, gsap.TweenVars> = {
  left: { x: -BENTO_DISTANCE },
  right: { x: BENTO_DISTANCE },
  up: { y: BENTO_DISTANCE },
  down: { y: -BENTO_DISTANCE },
};

// A damped spring's step response. elastic.out rings for a set time however soft it
// is, while this settles the way a real spring does, with one small overshoot.
export function springEase(damping = 0.6, frequency = 9): gsap.EaseFunction {
  const decay = damping * frequency;
  const ringing = frequency * Math.sqrt(1 - damping ** 2);

  return (progress) => {
    if (progress >= 1) return 1;

    const envelope = Math.exp(-decay * progress);
    const wave = Math.cos(ringing * progress) + (decay / ringing) * Math.sin(ringing * progress);
    return 1 - envelope * wave;
  };
}

function getBatchStates(element: HTMLElement): BatchStates {
  const { from, to } = getRevealStates(20);

  if (prefersReducedMotion()) {
    return { from, to: { ...to, duration: 0.7, ease: SMOOTH_EASE } };
  }

  const direction = (element.dataset.from ?? "up") as SlideDirection;
  return {
    from: { opacity: 0, scale: 0.97, ...slideOffsets[direction] },
    to: { ...to, x: 0, scale: 1, duration: 1.15, ease: springEase() },
  };
}

// Reveals each [data-batch] element in root. Elements that enter together stagger
// as a group, and the returned cleanup kills the triggers and any running reveal.
export function batchReveal(root: HTMLElement): () => void {
  const targets = gsap.utils.toArray<HTMLElement>("[data-batch]", root);
  const reveals: gsap.core.Tween[] = [];

  const triggers = ScrollTrigger.batch(targets, {
    start: "top 88%",
    end: "max",
    // Killed by hand rather than with `once`, for the same reason as scrollReveal.
    onEnter: (batch, batchTriggers) => {
      batchTriggers.forEach((trigger) => trigger.kill());

      (batch as HTMLElement[]).forEach((element, index) => {
        const { from, to } = getBatchStates(element);
        reveals.push(gsap.fromTo(element, from, { ...to, delay: index * BATCH_STAGGER }));
      });
    },
  });

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    reveals.forEach((reveal) => reveal.revert());
  };
}
