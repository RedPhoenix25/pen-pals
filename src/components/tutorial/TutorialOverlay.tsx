"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTutorial } from "./TutorialContext";
import { X } from "lucide-react";

const TOOLTIP_WIDTH = 300;
const TOOLTIP_HEIGHT = 150; // approximate
const PADDING = 10; // cutout padding around element

export function TutorialOverlay() {
  const { isActive, currentStepIndex, currentStep, nextStep, skipTour } = useTutorial();
  const [rect, setRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const animFrameRef = useRef<number | null>(null);
  const highlightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isActive || !currentStep) {
      setRect(null);
      return;
    }

    const measure = () => {
      const element = document.querySelector(`[data-tutorial="${currentStep.id}"]`);

      if (element) {
        const r = element.getBoundingClientRect();

        // Only treat as valid if it's actually on screen
        if (r.width === 0 && r.height === 0) {
          setRect(null);
          computeFallbackTooltip();
          return;
        }

        const cutout = {
          x: r.left - PADDING,
          y: r.top - PADDING,
          w: r.width + PADDING * 2,
          h: r.height + PADDING * 2,
        };
        setRect(cutout);
        computeTooltipPos(cutout);

        // Apply highlight ring directly to the element
        const el = element as HTMLElement;
        el.style.outline = "2px solid rgba(214, 158, 46, 0.8)";
        el.style.outlineOffset = "4px";
        el.style.borderRadius = "6px";
        el.style.transition = "outline 0.3s ease";
        highlightRef.current = el as HTMLDivElement;
      } else {
        setRect(null);
        computeFallbackTooltip();
      }
    };

    const computeTooltipPos = (cutout: { x: number; y: number; w: number; h: number }) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const pos = currentStep.position || "bottom";

      let top = 0;
      let left = 0;

      if (pos === "bottom") {
        top = cutout.y + cutout.h + 16;
        left = cutout.x + cutout.w / 2 - TOOLTIP_WIDTH / 2;
      } else if (pos === "top") {
        top = cutout.y - TOOLTIP_HEIGHT - 16;
        left = cutout.x + cutout.w / 2 - TOOLTIP_WIDTH / 2;
      } else if (pos === "right") {
        top = cutout.y + cutout.h / 2 - TOOLTIP_HEIGHT / 2;
        left = cutout.x + cutout.w + 16;
      } else if (pos === "left") {
        top = cutout.y + cutout.h / 2 - TOOLTIP_HEIGHT / 2;
        left = cutout.x - TOOLTIP_WIDTH - 16;
      }

      // Clamp to viewport
      if (left + TOOLTIP_WIDTH > vw - 16) left = vw - TOOLTIP_WIDTH - 16;
      if (left < 16) left = 16;
      if (top + TOOLTIP_HEIGHT > vh - 16) top = vh - TOOLTIP_HEIGHT - 16;
      if (top < 16) top = 16;

      setTooltipPos({ top, left });
    };

    const computeFallbackTooltip = () => {
      setTooltipPos({
        top: window.innerHeight / 2 - TOOLTIP_HEIGHT / 2,
        left: window.innerWidth / 2 - TOOLTIP_WIDTH / 2,
      });
    };

    // Slight delay for DOM to settle, then measure
    const timeout = setTimeout(() => {
      measure();
    }, 80);

    const onResize = () => measure();
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", onResize);
      // Remove outline from previous element
      if (highlightRef.current) {
        highlightRef.current.style.outline = "";
        highlightRef.current.style.outlineOffset = "";
        highlightRef.current.style.borderRadius = "";
        highlightRef.current = null;
      }
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isActive, currentStep]);

  // Clean up highlight on tour end
  useEffect(() => {
    if (!isActive && highlightRef.current) {
      highlightRef.current.style.outline = "";
      highlightRef.current.style.outlineOffset = "";
      highlightRef.current = null;
    }
  }, [isActive]);

  if (!isActive || !currentStep) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;

  // Build the SVG path for the overlay with rectangular cutout
  // We draw the full viewport rect and subtract the cutout using clipPath evenodd
  const buildClipPath = () => {
    if (!rect) {
      // No cutout — just a centered semi-transparent box with no hole
      return null;
    }
    const { x, y, w, h } = rect;
    // Outer rect (full screen) then inner rect (hole) — evenodd fill rule creates the cutout
    return `M0 0 L${vw} 0 L${vw} ${vh} L0 ${vh} Z M${x} ${y} L${x + w} ${y} L${x + w} ${y + h} L${x} ${y + h} Z`;
  };

  const clipPath = buildClipPath();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "none", // Default: let clicks through
      }}
    >
      {/* SVG overlay with cutout hole */}
      <svg
        width={vw}
        height={vh}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      >
        {clipPath ? (
          <path
            d={clipPath}
            fill="rgba(12, 10, 9, 0.82)"
            fillRule="evenodd"
            style={{ transition: "d 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
          />
        ) : (
          // No target found — just a soft vignette, no hard block
          <rect
            width={vw}
            height={vh}
            fill="rgba(12, 10, 9, 0.82)"
          />
        )}
      </svg>

      {/* Tooltip — always visible, always clickable */}
      <div
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TOOLTIP_WIDTH,
          zIndex: 10000,
          background: "rgba(28, 24, 22, 0.72)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(214, 158, 46, 0.25)",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 24px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)",
          pointerEvents: "auto",
          transition: "top 0.4s cubic-bezier(0.16, 1, 0.3, 1), left 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            {currentStep.title}
          </h3>
          <button
            onClick={skipTour}
            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 0, lineHeight: 1, flexShrink: 0, marginLeft: 8 }}
            aria-label="Close tour"
          >
            <X size={15} />
          </button>
        </div>

        {/* Description */}
        <p style={{ margin: "0 0 20px", fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: 1.6 }}>
          {currentStep.description}
        </p>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Step dots */}
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: i === currentStepIndex ? "16px" : "6px",
                  height: "6px",
                  borderRadius: "4px",
                  background: i === currentStepIndex ? "rgba(214, 158, 46, 0.9)" : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={skipTour}
              style={{
                background: "transparent",
                color: "var(--text-secondary)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "6px",
                padding: "6px 14px",
                fontSize: "12px",
                cursor: "pointer",
              }}
            >
              Skip
            </button>
            <button
              onClick={nextStep}
              style={{
                background: "rgba(214, 158, 46, 0.9)",
                color: "#1a1612",
                border: "none",
                borderRadius: "6px",
                padding: "6px 16px",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "background 0.2s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = "rgba(214, 158, 46, 1)")}
              onMouseOut={(e) => (e.currentTarget.style.background = "rgba(214, 158, 46, 0.9)")}
            >
              {currentStepIndex === 4 ? "Finish" : "Next →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
