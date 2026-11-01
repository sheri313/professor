"use client";

import type gsap from "gsap";

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
