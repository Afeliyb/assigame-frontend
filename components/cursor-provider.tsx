"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { motion, useSpring } from "motion/react";

type CursorContextType = {
  setCursorLabel: (label: string | null) => void;
  setCursorActive: (active: boolean) => void;
};

const CursorContext = createContext<CursorContextType>({
  setCursorLabel: () => {},
  setCursorActive: () => {},
});

export function CursorProvider({ children }: { children: React.ReactNode }) {
  const [label, setCursorLabel] = useState<string | null>(null);
  const [active, setCursorActive] = useState<boolean>(false);

  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const cursorX = useSpring(0, { stiffness: 800, damping: 50, mass: 0.5 });
  const cursorY = useSpring(0, { stiffness: 800, damping: 50, mass: 0.5 });

  useEffect(() => {
    // Check if device is touch-enabled
    if (window.matchMedia("(pointer: coarse)").matches) {
      setIsTouchDevice(true);
      return;
    }

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mouseout", handleMouseLeave);
    window.addEventListener("mouseover", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mouseout", handleMouseLeave);
      window.removeEventListener("mouseover", handleMouseEnter);
    };
  }, [cursorX, cursorY, isVisible]);

  return (
    <CursorContext.Provider value={{ setCursorLabel, setCursorActive }}>
      {children}
      {!isTouchDevice && (
        <motion.div
          className={`fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] flex items-center justify-center mix-blend-difference transition-transform duration-200 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{
            x: cursorX,
            y: cursorY,
            backgroundColor: "white",
            scale: active || label ? 1.5 : 0.5,
          }}
        >
          {label && (
            <span className="text-[8px] font-bold text-black uppercase tracking-widest whitespace-nowrap px-2">
              {label}
            </span>
          )}
        </motion.div>
      )}
    </CursorContext.Provider>
  );
}

export const useCursor = () => useContext(CursorContext);
