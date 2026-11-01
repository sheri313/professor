"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { SMOOTH_EASE, prefersReducedMotion } from "@/utils/animations";
import { springEase } from "@/utils/sectionMotion";

interface PostcardFlipProps {
  front: ReactNode;
  children: ReactNode;
}

const PICTURE_HOLD_SECONDS = 0.9;

// Turns the card over once it's in view. The writing side is the resting state, so
// it's what renders without JavaScript or with reduced motion.
//
// Timed rather than scrubbed: a scrubbed flip either ends before the picture is ever
// fully on screen, or leaves a link to #contact landing on a card that's mid-turn.
export default function PostcardFlip({ front, children }: PostcardFlipProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const card = cardRef.current;
    if (!root || !card || prefersReducedMotion()) return;

    let turnOver: gsap.core.Timeline | undefined;

    // Tabbing into the form can beat the flip there, and it can't wait behind the picture.
    const finish = () => turnOver?.progress(1);

    const context = gsap.context(() => {
      gsap.set(card, { rotationY: -180, rotationZ: -4, y: 80, transformPerspective: 1800 });

      turnOver = gsap
        .timeline({
          paused: true,
          // Clears the transform, so the form's text and inputs rest perfectly crisp.
          onComplete: () => {
            gsap.set(card, { clearProps: "transform" });
          },
        })
        .to(card, { y: 0, rotationZ: 0, duration: 0.9, ease: SMOOTH_EASE }, PICTURE_HOLD_SECONDS)
        .to(card, { rotationY: 0, duration: 1.5, ease: springEase(0.62, 8) }, PICTURE_HOLD_SECONDS);

      ScrollTrigger.create({
        trigger: root,
        start: "top 62%",
        end: "max",
        onEnter: (self) => {
          self.kill();
          turnOver?.play();
        },
      });
    }, root);

    card.addEventListener("focusin", finish);

    return () => {
      card.removeEventListener("focusin", finish);
      context.revert();
    };
  }, []);

  return (
    <div ref={rootRef}>
      <div ref={cardRef} className="relative transform-3d">
        <div className="relative backface-hidden">{children}</div>
        <div
          aria-hidden="true"
          className="absolute inset-0 backface-hidden transform-[rotateY(180deg)]"
        >
          {front}
        </div>
      </div>
    </div>
  );
}
