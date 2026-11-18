import { useEffect, useRef, useState } from "react";
import type { SiteData } from "@/lib/site/types";
import { PREVIEW_PAGE, PREVIEW_READY, PREVIEW_SITE } from "../lib/preview";

/**
 * A site drawn in a frame `width` by `height` pixels, shrunk to fit the space
 * it is given. Unless `interactive`, it is a picture: it cannot be clicked or
 * tabbed into.
 */
export function SitePreview({
  site,
  width,
  height,
  title,
  interactive = false,
}: {
  site: SiteData;
  width: number;
  height: number;
  title: string;
  interactive?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLIFrameElement>(null);
  const [scale, setScale] = useState(0);
  const [ready, setReady] = useState(false);

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
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== frame.current?.contentWindow) return;
      if (event.data?.type === PREVIEW_READY) setReady(true);
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    frame.current?.contentWindow?.postMessage(
      { type: PREVIEW_SITE, site },
      window.location.origin,
    );
  }, [ready, site]);

  return (
    <div
      ref={box}
      className="overflow-hidden bg-white"
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <iframe
        ref={frame}
        src={PREVIEW_PAGE}
        title={title}
        loading="lazy"
        tabIndex={interactive ? undefined : -1}
        aria-hidden={interactive ? undefined : true}
        className={`origin-top-left border-0 ${interactive ? "" : "pointer-events-none"}`}
        style={{ width, height, transform: `scale(${scale})` }}
      />
    </div>
  );
}
