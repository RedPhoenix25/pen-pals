# Pen Pals Project Rules

This document outlines the core behaviors, style guidelines, and rules for developing the Pen Pals collaborative novel writing platform.

## Design Guidelines
1. **Color Palette**: The application MUST use a minimal, warm black color scheme. 
   - Backgrounds should be a warm, deep black (e.g., `#171513`, `#1c1917`).
   - Text should be a soft, readable off-white/cream to reduce eye strain.
2. **Minimalism**: The UI must be as minimal as possible to avoid cluttering the writing space.
3. **Icons**: Use small, simple, and unobtrusive icons. Hide menus behind toggleable sidebars or small floating action buttons if possible.
4. **CSS**: Use Vanilla CSS for styling. Avoid Tailwind CSS. Focus on a premium, modern aesthetic using CSS variables for theme consistency.
5. **Notifications & Dialogs**: All notifications, alerts, and confirmations MUST be themed and not browser native (e.g. avoid native `alert()` or `confirm()`).

## Workflow Rules
1. **Timeline Updates**: After EVERY significant change, new feature, or bug fix, you MUST update the `timeline.md` document at the root of the project to document the changes.
2. **Synchronous Focus**: Always consider how changes affect the real-time synchronous writing experience. Ensure data models support collaborative editing.
