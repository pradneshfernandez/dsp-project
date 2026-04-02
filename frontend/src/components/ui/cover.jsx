"use client";
import React, { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Cover = ({
  children,
  className,
}) => {
  const [hovered, setHovered] = useState(false);
  const ref = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [beamPositions, setBeamPositions] = useState([]);

  useEffect(() => {
    if (ref.current) {
      setContainerWidth(ref.current.clientWidth);
      const beamCount = 12; // More beams
      const positions = Array.from(
        { length: beamCount },
        (_, i) => (i * ref.current.clientWidth) / (beamCount - 1)
      );
      setBeamPositions(positions);
    }
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className={cn(
        "relative group/cover inline-block bg-transparent px-2 py-0.5 transition-all duration-200 rounded-sm cursor-default overflow-visible",
        className
      )}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full w-full absolute inset-0 z-0"
          >
            <div className="absolute inset-0 bg-[#c88cae]/20 rounded-sm blur-md" />
            <Beam containerWidth={containerWidth} beamPositions={beamPositions} />
          </motion.div>
        )}
      </AnimatePresence>
      <span className={cn(
        "relative z-10 transition-all duration-200 group-hover/cover:text-white group-hover/cover:drop-shadow-[0_0_20px_rgba(200,140,174,1)]",
      )}>
        {children}
      </span>
    </div>
  );
};

const Beam = ({
  containerWidth,
  beamPositions,
}) => {
  return (
    <svg
      width={containerWidth}
      height="100%"
      viewBox={`0 0 ${containerWidth} 1`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full opacity-100"
    >
      {beamPositions.map((position, index) => (
        <motion.rect
          key={index}
          x={position}
          y="0"
          width="3"
          height="1"
          fill="#c88cae"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0], x: [position - 20, position + 20] }}
          transition={{
            duration: Math.random() * 0.5 + 0.2, // Much faster
            repeat: Infinity,
            delay: Math.random() * 0.5,
          }}
        />
      ))}
    </svg>
  );
};
