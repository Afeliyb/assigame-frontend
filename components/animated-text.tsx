"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";

export function AnimatedText({
  text,
  className = "",
  once = true,
}: {
  text: string;
  className?: string;
  once?: boolean;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1
      ref={ref}
      className={className}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {text.split(" ").map((word, index) => (
        <motion.span
          variants={child as any}
          key={index}
          className="inline-block mr-[0.25em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}

export function Reveal({
  children,
  delay = 0,
  once = true,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  once?: boolean;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, margin: "-10% 0px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.6, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
