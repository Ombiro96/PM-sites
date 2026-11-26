import { useEffect, useRef, useState } from "react";
import type { SiteData } from "@/lib/site/types";
import {
  PREVIEW_DRAWN,
  PREVIEW_PAGE,
  PREVIEW_GO,
  PREVIEW_PICK,
  PREVIEW_READY,
  PREVIEW_SITE,
} from "../lib/preview";

const BONE = "bg-line rounded-[0.4em]";

/**
 * The outline of a website's first screen (header, heading, button, picture
 * and a row of cards) shown while the real one is on its way. Sizes are in
 * `cqw`, so it keeps its proportions at any size.
 */
function Skeleton({ narrow }: { narrow: boolean }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{ containerType: "inline-size" }}
    >
      <div
        className="flex h-full animate-pulse flex-col motion-reduce:animate-none"
        style={{ fontSize: narrow ? "4cqw" : "1.6cqw" }}
      >
        <div className="border-line flex items-center gap-[1.2em] border-b px-[2.4em] py-[1.3em]">
          <div className={`${BONE} h-[1.8em] w-[1.8em] rounded-full`} />
          <div className={`${BONE} h-[0.9em] w-[9em]`} />
          {narrow ? (
            <div className={`${BONE} ml-auto h-[1.6em] w-[2em]`} />
          ) : (
            <>
              <div className={`${BONE} ml-auto h-[0.7em] w-[4em]`} />
              <div className={`${BONE} h-[0.7em] w-[4em]`} />
              <div className={`${BONE} h-[0.7em] w-[4em]`} />
              <div className={`${BONE} h-[2.2em] w-[7em]`} />
            </>
          )}
        </div>
        <div
          className={`flex gap-[2.4em] px-[2.4em] py-[2.6em] ${narrow ? "flex-col" : "items-center"}`}
        >
          <div className="flex flex-1 flex-col gap-[0.9em]">
            <div className={`${BONE} h-[2.2em] w-[90%]`} />
            <div className={`${BONE} h-[2.2em] w-[65%]`} />
            <div className={`${BONE} mt-[0.6em] h-[0.8em] w-[85%]`} />
            <div className={`${BONE} h-[0.8em] w-[70%]`} />
            <div className="mt-[0.8em] flex gap-[0.8em]">
              <div className={`${BONE} h-[2.6em] w-[9em]`} />
              <div className={`${BONE} h-[2.6em] w-[7em]`} />
            </div>
          </div>
          <div
            className={`${BONE} ${narrow ? "h-[14em]" : "h-[17em] flex-1"}`}
          />
        </div>
        <div
          className={`grid min-h-0 flex-1 gap-[1.4em] px-[2.4em] pb-[2em] ${narrow ? "grid-cols-1" : "grid-cols-3"}`}
        >
          {(narrow ? [0] : [0, 1, 2]).map((card) => (
            <div
              key={card}
              className="border-line flex flex-col gap-[0.8em] overflow-hidden rounded-[0.8em] border p-[1em]"
            >
              <div className={`${BONE} min-h-[4em] flex-1`} />
              <div className={`${BONE} h-[0.9em] w-[70%]`} />
              <div className={`${BONE} h-[0.7em] w-[45%]`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * A site drawn in a frame `width` by `height` pixels, shrunk to fit the space
 * it is given. Unless `interactive`, it is a picture: it cannot be clicked or
 * tabbed into. With `onPick`, a click on a section of the page reports that
 * section; `path` is the page shown and `selected` the section marked.
 *
 * The frame is only started once it is near the screen, and a placeholder
 * holds its place until the site is drawn, so a page of these does not flash.
 */
export function SitePreview({
  site,
  width,
  height,
  title,
  interactive = false,
  path,
  selected,
  onPick,
  onGo,
}: {
  site: SiteData;
  width: number;
  height: number;
  title: string;
  interactive?: boolean;
  path?: string;
  selected?: string;
  onPick?: (sectionId: string) => void;
  /** While picking: a link in the menu or the footer was clicked, with the path it leads to. */
  onGo?: (path: string) => void;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const [drawn, setDrawn] = useState(false);
  const picking = onPick !== undefined;
  const pick = useRef(onPick);
  const go = useRef(onGo);
  useEffect(() => {
    pick.current = onPick;
    go.current = onGo;
  });

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setScale(entry.contentRect.width / width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [width]);

  useEffect(() => {
    const element = box.current;
    if (!element || near) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: "300px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [near]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === PREVIEW_READY) setReady(true);
      if (event.data?.type === PREVIEW_DRAWN) setDrawn(true);
      if (
        event.data?.type === PREVIEW_PICK &&
        typeof event.data.section === "string"
      )
        pick.current?.(event.data.section);
      if (
        event.data?.type === PREVIEW_GO &&
        typeof event.data.path === "string"
      )
        go.current?.(event.data.path);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_SITE, site, path, selected, picking: picking },
      window.location.origin,
    );
  }, [ready, site, path, selected, picking]);

  return (
    <div
      ref={box}
      className="relative overflow-hidden bg-white"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      {drawn ? null : <Skeleton narrow={width < 600} />}
      {near ? (
        <iframe
          ref={frame}
          src={PREVIEW_PAGE}
          title={title}
          tabIndex={interactive ? undefined : -1}
          aria-hidden={interactive ? undefined : true}
          className={`origin-top-left border-0 transition-opacity duration-300 motion-reduce:transition-none ${drawn ? "opacity-100" : "opacity-0"} ${interactive ? "" : "pointer-events-none"}`}
          style={{ width, height, transform: `scale(${scale})` }}
        />
      ) : null}
    </div>
  );
}
