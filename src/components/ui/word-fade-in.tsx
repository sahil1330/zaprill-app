"use client";

import { motion, type Variants } from "motion/react";

import { cn } from "@/lib/utils";

interface WordFadeInProps {
  words: string;
  className?: string;
  delay?: number;
  variants?: Variants;
}

export function WordFadeIn({
  words,
  delay = 0.15,
  variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: delay,
      },
    },
  },
  className,
}: WordFadeInProps) {
  const _words = words.split(" ");

  return (
    <motion.h1
      variants={variants}
      initial="hidden"
      animate="show"
      className={cn(
        "font-display text-center text-4xl font-bold tracking-[-0.02em] text-black drop-shadow-sm md:text-7xl md:leading-[5rem] dark:text-white",
        className,
      )}
    >
      {_words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          variants={variants}
          custom={i}
          className="inline-block pr-[0.3em]"
        >
          {word}
        </motion.span>
      ))}
    </motion.h1>
  );
}
