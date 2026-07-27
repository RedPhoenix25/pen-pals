"use client";

import { useEffect } from 'react';

export function ScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
