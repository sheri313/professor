"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef } from "react";
import type { CSSProperties, ReactNode, Ref } from "react";
import { springEase } from "@/utils/sectionMotion";

gsap.registerPlugin(ScrollTrigger);

interface HorizontalTrackProps {
  children: ReactNode;
  label: string;
  ghostText: string;
  cardCount: number;
  // Changes whenever the cards do, which rebuilds the stage around the new set.
  cardsKey?: string;
  // Stays in the frame while the track moves past, or under the track on a carousel.
  toolbar?: ReactNode;
  frameRef?: Ref<HTMLDivElement>;
  // Stacks the cards in 3D instead of linking them. A card's first child must be its
  // tile, and the tile's first child the opaque backing that fades behind the front.
  stacked?: boolean;
}

interface Port {
  x: number;
  y: number;
}

// Matches the media query that gives .track-stage its scrolling height.
const STAGE_QUERY = "(min-width: 1024px) and (prefers-reduced-motion: no-preference)";
const CAROUSEL_QUERY = "(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)";

const TILE_SPREAD_RATIO = 0.27;
const MAX_TILE_SPREAD = 320;
const TILE_DEPTH = 240;
const TILE_TURN_DEGREES = 30;
const TILE_SHRINK = 0.08;
const TILE_BLUR = 1.8;
// Tiles fade out by this far from the front, which leaves five on screen.
const HIDDEN_DEPTH = 2.6;
// The gap kept between the intro and the first tile while they share the screen.
const INTRO_CLEARANCE = 32;
// A scroll can stop anywhere, and two tiles collide halfway between places. This hurries
// through that point and rests on each tile, as the snap used to when the stack spun.
const settleTile = gsap.parseEase("power2.inOut");

function getBoxWithin(element: HTMLElement, ancestor: HTMLElement) {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;

  while (current && current !== ancestor) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  return { left, top, width: element.offsetWidth, height: element.offsetHeight };
}

function getLinkPath(from: Port, to: Port): string {
  const bend = (to.x - from.x) / 2;
  return `M${from.x} ${from.y}C${from.x + bend} ${from.y} ${to.x - bend} ${to.y} ${to.x} ${to.y}`;
}

function getSlots(cards: HTMLElement[], track: HTMLElement): number[] {
  return cards.map((card) => {
    const { left, width } = getBoxWithin(card, track);
    return left + width / 2;
  });
}

// Sets a tile by how far it sits from the front of the stack, in tiles. x is measured
// from the tile's own slot in the track.
function placeTile(tile: HTMLElement, offset: number, fan: number, x: number) {
  const depth = Math.abs(offset);
  const placed = offset * fan;
  const placedDepth = depth * fan;
  const turn = gsap.utils.clamp(-1.4, 1.4, placed) * -TILE_TURN_DEGREES;
  const scale = 1 - Math.min(placedDepth, HIDDEN_DEPTH) * TILE_SHRINK;
  const opacity = depth <= 2 ? 1 - depth * 0.35 : 0.3 * Math.max(0, (HIDDEN_DEPTH - depth) / 0.6);
  const blur = Math.min(placedDepth, 2) * TILE_BLUR;

  tile.style.transform = `translate3d(${x}px, 0, ${placedDepth * -TILE_DEPTH}px) rotateY(${turn}deg) scale(${scale})`;
  tile.style.opacity = String(opacity);
  tile.style.filter = blur > 0.05 ? `blur(${blur}px)` : "none";
  tile.style.visibility = depth < HIDDEN_DEPTH ? "visible" : "hidden";

  // The front tile's opaque backing fades away to leave bare glass behind it. A scroll
  // can stop between tiles, so the nearest one always keeps it and stays readable.
  (tile.firstElementChild as HTMLElement).style.opacity = String(gsap.utils.clamp(0, 1, 2 - depth * 2));
  (tile.parentElement as HTMLElement).style.zIndex = String(100 - Math.round(depth * 10));
}

function releaseTile(tile: HTMLElement) {
  tile.style.transform = tile.style.opacity = tile.style.filter = tile.style.visibility = "";
  (tile.firstElementChild as HTMLElement).style.opacity = "";
  (tile.parentElement as HTMLElement).style.zIndex = "";
}

// The tiles stay in the track's slots, so the carousel can fall back on them, but on
// the stage each one cancels the track's movement and goes where the stack puts it.
function createStack(
  intro: HTMLElement,
  cards: HTMLElement[],
  viewport: HTMLElement,
  track: HTMLElement,
  getDistance: () => number,
) {
  const tiles = cards.map((card) => card.firstElementChild as HTMLElement);
  const motion = { progress: 0, fan: 0 };
  let slots: number[] = [];
  let distance = 0;
  let middle = 0;
  let spread = 0;
  let lead = 0;

  const render = () => {
    const { progress, fan } = motion;
    const travelled = progress * (cards.length - 1);
    const passed = Math.floor(travelled);
    const position = passed + settleTile(travelled - passed);
    const trackX = -distance * progress;
    // The front tile starts beside the intro and reaches the middle as the intro leaves.
    const drift = lead * Math.max(0, 1 - position);

    // Fades on its way out, so a short stack can't end with text over its side tiles.
    intro.style.opacity = String(gsap.utils.clamp(0, 1, 1.5 - position * 2));

    tiles.forEach((tile, index) => {
      const offset = index - position;
      const stacked = middle + drift + offset * fan * spread;
      placeTile(tile, offset, fan, stacked - slots[index] - trackX);
    });
  };

  // Separate from render, which would otherwise force a style recalculation every frame.
  const layOut = () => {
    const { left, width } = getBoxWithin(intro, track);

    slots = getSlots(cards, track);
    distance = getDistance();
    middle = viewport.clientWidth / 2;
    spread = Math.min(viewport.clientWidth * TILE_SPREAD_RATIO, MAX_TILE_SPREAD);
    lead = Math.max(0, left + width + INTRO_CLEARANCE + (tiles[0]?.offsetWidth ?? 0) / 2 - middle);
    render();
  };

  const release = () => {
    intro.style.opacity = "";
    tiles.forEach(releaseTile);
  };

  return { motion, render, layOut, release };
}

// The children render on the server. Each [data-stop] among them is a stop on the
// track, either a node on the neural path or a tile in the stack. Without the stage
// query, such as on touch screens, the track stays a native snap carousel.
export default function HorizontalTrack({
  children,
  label,
  ghostText,
  cardCount,
  cardsKey,
  toolbar,
  frameRef,
  stacked = false,
}: HorizontalTrackProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const placedCards = useRef(cardsKey);

  useEffect(() => {
    const stage = stageRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const ghost = ghostRef.current;
    const bar = barRef.current;
    const counter = counterRef.current;
    if (!stage || !viewport || !track || !ghost || !bar || !counter) return;

    const newCards = placedCards.current !== cardsKey;

    // A shorter stage could leave the page past its end, so new cards start from the
    // first. A carousel isn't pinned, so moving the page would only lose the controls.
    if (newCards) {
      placedCards.current = cardsKey;
      viewport.scrollLeft = 0;

      const { top } = stage.getBoundingClientRect();
      if (top < 0 && window.matchMedia(STAGE_QUERY).matches) {
        window.scrollBy({ top, behavior: "instant" });
      }
    }

    const media = gsap.matchMedia();

    media.add(STAGE_QUERY, () => {
      const stops = gsap.utils.toArray<HTMLElement>("[data-stop]", track);
      const cards = stops.slice(1);
      const wires = gsap.utils.toArray<SVGPathElement>("[data-wire]", track);
      const pulses = gsap.utils.toArray<SVGPathElement>("[data-pulse]", track);
      const synapses = gsap.utils.toArray<SVGCircleElement>("[data-synapse]", track);

      // Measured from layout, so a card's tilt or reveal can't bend the wires.
      const drawLinks = () => {
        cards.forEach((card, index) => {
          const from = getBoxWithin(stops[index], track);
          const to = getBoxWithin(card, track);
          const start = { x: from.left + from.width, y: from.top + from.height / 2 };
          const end = { x: to.left, y: to.top + to.height / 2 };
          const path = getLinkPath(start, end);

          wires[index].setAttribute("d", path);
          pulses[index].setAttribute("d", path);
          synapses[index].setAttribute("cx", String(end.x));
          synapses[index].setAttribute("cy", String(end.y));
        });
      };

      const getDistance = () => Math.max(0, track.offsetWidth - viewport.clientWidth);
      const stack = stacked ? createStack(stops[0], cards, viewport, track, getDistance) : null;
      const layOutCards = stack?.layOut ?? drawLinks;
      const setBar = gsap.quickSetter(bar, "scaleX");
      let activeStop = 1;

      setBar(0);
      counter.textContent = "01";
      gsap.set(viewport, { overflow: "clip" });
      viewport.removeAttribute("tabindex");
      if (stack) stack.motion.fan = newCards ? 0.2 : 0;
      layOutCards();

      const stageRange = { trigger: stage, start: "top top", end: "bottom bottom" };

      const scroll = gsap.to(track, {
        x: () => -getDistance(),
        ease: "none",
        scrollTrigger: { ...stageRange, scrub: 0.8, invalidateOnRefresh: true, onRefresh: layOutCards },
      });

      const followScroll = () => {
        const progress = scroll.progress();
        setBar(progress);

        if (stack) {
          stack.motion.progress = progress;
          stack.render();
        }

        const stop = 1 + Math.round(progress * (cards.length - 1));
        if (stop === activeStop) return;
        activeStop = stop;
        counter.textContent = String(stop).padStart(2, "0");
      };

      // Follows the tween rather than the trigger, to stay in step with the scrub's lag.
      // Added afterward because a scrubbed tween first updates while it's being created.
      scroll.eventCallback("onUpdate", followScroll);

      // A page restored partway down the stage gets its progress from a refresh, silently.
      ScrollTrigger.addEventListener("refresh", followScroll);

      const standDown = () => {
        ScrollTrigger.removeEventListener("refresh", followScroll);
        viewport.setAttribute("tabindex", "0");
      };

      gsap.to(ghost, {
        xPercent: -28,
        ease: "none",
        scrollTrigger: { ...stageRange, scrub: 1.4 },
      });

      if (!stack) {
        cards.forEach((card, index) => {
          const horizontal = { trigger: card, containerAnimation: scroll, scrub: true };

          gsap.fromTo(
            card,
            { opacity: 0.12, scale: 0.9, rotationY: -22, transformPerspective: 1200 },
            {
              opacity: 1,
              scale: 1,
              rotationY: 0,
              ease: "none",
              scrollTrigger: { ...horizontal, start: "left 98%", end: "left 64%" },
            },
          );

          // A separate range for each link, so only the wire being drawn repaints.
          gsap.fromTo(
            pulses[index],
            { strokeDashoffset: 1 },
            {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: { ...horizontal, start: "left 100%", end: "left 72%" },
            },
          );

          gsap.fromTo(
            synapses[index],
            { opacity: 0, scale: 0, transformOrigin: "50% 50%" },
            {
              opacity: 1,
              scale: 1,
              ease: "none",
              scrollTrigger: { ...horizontal, start: "left 74%", end: "left 70%" },
            },
          );
        });

        return standDown;
      }

      // Paused rather than attached to the triggers, which would measure every frame of it.
      const fanOut = gsap.to(stack.motion, {
        fan: 1,
        duration: newCards ? 1 : 1.5,
        ease: springEase(0.7, 7),
        paused: true,
        onUpdate: stack.render,
      });

      const idle = gsap.to(viewport, {
        y: -12,
        rotationX: 1.6,
        rotationY: -2,
        transformPerspective: 1400,
        duration: 3.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      if (newCards) fanOut.play();
      else {
        ScrollTrigger.create({
          trigger: stage,
          start: "top 78%",
          end: "max",
          onEnter: (self) => {
            self.kill();
            fanOut.play();
          },
        });
      }

      // Nothing on the rest of the page should pay for a loop nobody can see.
      ScrollTrigger.create({
        trigger: stage,
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => idle.paused(!isActive),
      });

      const scrollToCard = (card: HTMLElement) => {
        const { start, end } = scroll.scrollTrigger!;
        const share = cards.indexOf(card) / Math.max(1, cards.length - 1);
        window.scrollTo({ top: start + share * (end - start) });
      };

      const findCard = (element: HTMLElement) =>
        cards.find((card) => card.contains(element));

      // The clipped viewport can't scroll to a control that takes focus, so the page does.
      // Clicks are left out, since a tile that can be clicked is already in view.
      const followFocus = ({ target }: FocusEvent) => {
        const card = findCard(target as HTMLElement);
        if (card && (target as HTMLElement).matches(":focus-visible")) scrollToCard(card);
      };

      // A side tile comes forward when pressed, while its button still opens it directly.
      const bringForward = ({ target }: MouseEvent) => {
        const card = findCard(target as HTMLElement);
        if (card && !(target as HTMLElement).closest("button")) scrollToCard(card);
      };

      const listeners = new AbortController();
      track.addEventListener("focusin", followFocus, { signal: listeners.signal });
      track.addEventListener("click", bringForward, { signal: listeners.signal });

      return () => {
        listeners.abort();
        stack.release();
        standDown();
      };
    });

    if (stacked) {
      // Native scrolling already moves a carousel, so its tiles only have to turn.
      media.add(CAROUSEL_QUERY, () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stop]", track).slice(1);
        const tiles = cards.map((card) => card.firstElementChild as HTMLElement);
        let slots: number[] = [];
        let middle = 0;
        let pitch = 1;

        const turnTiles = () => {
          const center = viewport.scrollLeft + middle;
          tiles.forEach((tile, index) => placeTile(tile, (slots[index] - center) / pitch, 1, 0));
        };

        const measure = new ResizeObserver(() => {
          slots = getSlots(cards, track);
          middle = viewport.clientWidth / 2;
          pitch = cards[0]?.offsetWidth || 1;
          turnTiles();
        });

        viewport.addEventListener("scroll", turnTiles, { passive: true });
        measure.observe(viewport);

        return () => {
          viewport.removeEventListener("scroll", turnTiles);
          measure.disconnect();
          tiles.forEach(releaseTile);
        };
      });
    }

    return () => media.revert();
  }, [cardsKey, stacked]);

  return (
    <div
      ref={stageRef}
      style={{ "--track-stops": cardCount } as CSSProperties}
      className="track-stage"
    >
      {/* With a toolbar, the padding centers the track in the room left underneath it. */}
      <div
        ref={frameRef}
        className={`relative z-10 flex flex-col justify-center overflow-clip py-20 lg:sticky lg:top-0 lg:h-svh lg:min-h-160 ${
          toolbar ? "lg:pb-0 lg:pt-20" : "lg:py-0"
        }`}
      >
        <span
          ref={ghostRef}
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap font-display text-[24vw] font-extrabold leading-none tracking-tighter text-white/[0.025] lg:block"
        >
          {ghostText}
        </span>

        {toolbar && (
          <div className="z-10 px-(--track-pad) max-lg:order-1 max-lg:mt-6 lg:absolute lg:inset-x-0 lg:top-20">
            {toolbar}
          </div>
        )}

        {/* Focusable so keyboards can scroll it while it's a carousel. The stage drops
            this when it takes over, since the page's scroll moves it from then on. */}
        <div
          ref={viewportRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          className={`snap-x snap-mandatory overflow-x-auto scroll-px-(--track-pad) [scrollbar-color:var(--color-navy-600)_transparent] [scrollbar-width:thin] ${
            stacked ? "perspective-[1400px]" : ""
          }`}
        >
          {/* The stack's empty slots sit in front of its deeper tiles, so only the tiles
              take presses. Children that need them back opt in with pointer-events-auto. */}
          <div
            ref={trackRef}
            className={`track-rail relative ${stacked ? "pointer-events-none transform-3d" : ""}`}
          >
            {!stacked && (
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 hidden size-full overflow-visible lg:block"
              >
                {Array.from({ length: cardCount }, (_, index) => (
                  <g key={index}>
                    <path data-wire fill="none" strokeDasharray="2 7" className="stroke-white/15" />
                    <path
                      data-pulse
                      fill="none"
                      pathLength={1}
                      strokeDasharray={1}
                      strokeDashoffset={1}
                      strokeLinecap="round"
                      strokeWidth={2}
                      className="stroke-accent-400"
                    />
                    <circle data-synapse r={5} opacity={0} className="fill-accent-300" />
                  </g>
                ))}
              </svg>
            )}
            {children}
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-(--track-pad) bottom-8 hidden items-center gap-4 font-mono text-xs text-navy-300 ${
            cardCount > 0 ? "lg:motion-safe:flex" : ""
          }`}
        >
          <span>
            <span ref={counterRef}>01</span> / {String(cardCount).padStart(2, "0")}
          </span>
          <span className="h-px flex-1 bg-white/10">
            <span
              ref={barRef}
              className="block h-full origin-left scale-x-0 bg-linear-to-r from-accent-500 to-accent-300"
            />
          </span>
        </div>
      </div>
    </div>
  );
}
