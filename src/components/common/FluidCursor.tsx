import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export const FluidCursor: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const followerConfig = { damping: 20, stiffness: 200, mass: 0.8 };
  const followerX = useSpring(cursorX, followerConfig);
  const followerY = useSpring(cursorY, followerConfig);

  useEffect(() => {
    // Disable on touch devices or reduced-motion
    if (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsTouchDevice(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isVisible) setIsVisible(true);

      // Check if target or parent is interactive
      const target = e.target as HTMLElement | null;
      if (
        target?.closest('button') ||
        target?.closest('a') ||
        target?.closest('input') ||
        target?.closest('[role="button"]') ||
        target?.closest('.cursor-pointer')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible, cursorX, cursorY]);

  if (isTouchDevice || !isVisible) return null;

  return (
    <>
      {/* Outer fluid follower ring */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-9999 rounded-full border border-orange-500/50 dark:border-orange-400/60"
        style={{
          x: followerX,
          y: followerY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 48 : isClicking ? 26 : 34,
          height: isHovered ? 48 : isClicking ? 26 : 34,
          backgroundColor: isHovered
            ? 'rgba(249, 115, 22, 0.12)'
            : 'rgba(249, 115, 22, 0.04)',
          borderColor: isHovered ? 'rgba(249, 115, 22, 0.8)' : 'rgba(249, 115, 22, 0.4)',
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      />

      {/* Center pinpoint */}
      <motion.div
        className="pointer-events-none fixed top-0 left-0 z-9999 rounded-full bg-orange-600 dark:bg-orange-500 shadow-xs"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: isHovered ? 8 : isClicking ? 12 : 6,
          height: isHovered ? 8 : isClicking ? 12 : 6,
          scale: isClicking ? 0.8 : 1,
        }}
        transition={{ type: 'spring', damping: 30, stiffness: 450 }}
      />
    </>
  );
};
