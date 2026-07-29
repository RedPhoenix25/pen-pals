"use client";

import React, { useEffect, useState } from "react";
import { useTutorial } from "./TutorialContext";
import { X } from "lucide-react";

export function TutorialOverlay() {
  const { isActive, currentStepIndex, currentStep, nextStep, skipTour } = useTutorial();
  const [targetRect, setTargetRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const updatePosition = () => {
      const element = document.querySelector(`[data-tutorial="${currentStep.id}"]`);
      if (element) {
        const rect = element.getBoundingClientRect();
        // Add a little padding around the cutout
        setTargetRect({
          x: rect.left - 8,
          y: rect.top - 8,
          w: rect.width + 16,
          h: rect.height + 16,
        });
        
        // Ensure element is in view
        element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      } else {
        // If element is completely missing from DOM (maybe on wrong route), skip or fallback
        setTargetRect(null);
      }
    };

    // Delay slightly to allow DOM transitions/renders
    const timeoutId = setTimeout(updatePosition, 50);
    window.addEventListener("resize", updatePosition);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  // Calculate tooltip position based on target rect
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 10000,
    width: "300px",
    background: "rgba(30, 27, 25, 0.65)", // Warm black glass
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
    transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    opacity: targetRect ? 1 : 0,
    pointerEvents: "auto",
  };

  if (targetRect) {
    const { x, y, w, h } = targetRect;
    // Default position is bottom
    let top = y + h + 16;
    let left = x;

    if (currentStep.position === "right") {
      top = y;
      left = x + w + 16;
    } else if (currentStep.position === "left") {
      top = y;
      left = x - 300 - 16;
    } else if (currentStep.position === "top") {
      top = y - 150 - 16; // approx height of tooltip
      left = x;
    }

    // Boundary checks to keep tooltip on screen
    if (left + 300 > window.innerWidth) left = window.innerWidth - 320;
    if (left < 20) left = 20;
    if (top + 150 > window.innerHeight) top = y - 160;
    if (top < 20) top = 20;

    tooltipStyle.top = `${top}px`;
    tooltipStyle.left = `${left}px`;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        pointerEvents: "auto", // blocks clicks on elements underneath
      }}
    >
      {/* SVG Mask for the sharp cutout spotlight */}
      <svg width="100%" height="100%">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.x}
                y={targetRect.y}
                width={targetRect.w}
                height={targetRect.h}
                fill="black"
                rx="6" // slightly rounded sharp corners
                ry="6"
                style={{ transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(12, 10, 9, 0.85)" // Warm ultra dark background
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Tooltip Dialog */}
      <div style={tooltipStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>
            {currentStep.title}
          </h3>
          <button
            onClick={skipTour}
            style={{ background: "transparent", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: 0 }}
            aria-label="Close tour"
          >
            <X size={16} />
          </button>
        </div>
        <p style={{ margin: "0 0 20px", fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          {currentStep.description}
        </p>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", opacity: 0.6 }}>
            Step {currentStepIndex + 1} of 5
          </span>
          <button
            onClick={nextStep}
            style={{
              background: "var(--text-primary)",
              color: "var(--bg-primary)",
              border: "none",
              borderRadius: "6px",
              padding: "6px 16px",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "opacity 0.2s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
            onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
          >
            {currentStepIndex === 4 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
