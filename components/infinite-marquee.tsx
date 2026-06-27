"use client";

import React from "react";

export function InfiniteMarquee({
  children,
  speed = 40,
  className = "",
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden flex whitespace-nowrap group ${className}`}
    >
      <div
        className="flex whitespace-nowrap items-center min-w-full"
        style={{
          animation: `marquee ${speed}s linear infinite`,
        }}
      >
        {children}
        {children}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .group:hover > div {
          animation-play-state: paused;
        }
      `,
        }}
      />
    </div>
  );
}
