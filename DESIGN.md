---
name: Web Admin
description: A fleet-management admin dashboard with operational data, billing, accounts, and live monitoring views.
colors:
  primary: "#6366f1"
  primary-deep: "#4f46e5"
  secondary: "#a855f7"
  accent: "#ec4899"
  success: "#10b981"
  warning: "#f59e0b"
  danger: "#ef4444"
  info: "#0ea5e9"
  neutral-bg: "#f8fafc"
  surface: "rgba(255, 255, 255, 0.8)"
  neutral-text: "#1e293b"
  secondary-text: "#64748b"
  muted-text: "#94a3b8"
typography:
  display:
    fontFamily: "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "0.375rem"
  md: "0.75rem"
  lg: "1.25rem"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  card-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.neutral-text}"
    rounded: "{rounded.lg}"
    padding: "1.25rem"
---

# Design System: Web Admin

## 1. Overview

**Creative North Star: "Operational clarity with premium confidence."**

The interface is a data-first admin surface built for fleet operations, account administration, and billing oversight. The current system favors restrained color, clear hierarchy, and dense but legible panels over decorative motion or dense visual metaphor. It needs to feel trustworthy and fast, not flashy.

**Key Characteristics:**
- Indigo-violet accent color with a neutral slate canvas
- Roboto-based typography for crisp operational readability
- Glassy surface treatment and soft shadows on cards and tables
- Dark-mode support via theme tokens and semantic surface variables

## 2. Colors

The palette is anchored in a deep indigo/violet accent system, with a light neutral background and layered glass surfaces for dashboards and data cards.

### Primary
- **Indigo Accent** (#6366f1): Primary action color, selection states, and emphasis for interactive controls.
- **Deep Indigo** (#4f46e5): Hover/active depth for the same accent family.
- **Violet Accent** (#a855f7): Secondary highlight for premium surfaces and gradient accents.
- **Rose Accent** (#ec4899): Strong visual marker for special state or promotional emphasis.

### Neutral
- **Canvas** (#f8fafc): Main application background in light mode.
- **Surface** (rgba(255, 255, 255, 0.8)): Card and panel backgrounds with soft transparency.
- **Ink** (#1e293b): Primary text color for labels, headings, and data.
- **Muted Text** (#64748b): Secondary text and supportive labels.
- **Subtle Text** (#94a3b8): Tertiary copy and disabled states.

## 3. Typography

**Display Font:** Roboto, Helvetica Neue, Helvetica, Arial, sans-serif
**Body Font:** Roboto, Helvetica Neue, Helvetica, Arial, sans-serif

The current system uses a single sans-serif family with strong weight contrast. That keeps dense tables, forms, and dashboard metrics readable without introducing a second voice.

### Hierarchy
- **Display** (700, clamp(2rem, 4vw, 3rem), 1.1): Page titles and section headers.
- **Headline** (500–700, 1.1–1.4rem): Card headings and module summaries.
- **Title** (500, 1rem): Table and panel labels.
- **Body** (400, 1rem): Core interface copy, forms, and dashboard content.
- **Label** (500, 0.875rem, 0.05em): Compact UI labels and status tags.

## 4. Elevation

Depth is created with translucent surfaces, soft shadows, and a subtle gradient backdrop rather than heavy decoration. Light mode uses airy glass cards; dark mode switches to darker surfaces and stronger shadow contrast.

### Shadow Vocabulary
- **Soft Surface** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): Low-emphasis containers.
- **Medium Lift** (`0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): Standard cards and panels.
- **Premium Lift** (`0 25px 50px -12px rgba(0, 0, 0, 0.15)`): Elevated dashboard modules and hover states.

## 5. Components

### Buttons
- **Shape:** Rounded medium corners (`0.75rem`) with compact padding.
- **Primary:** Indigo accent background, white text, clear hover and active states.
- **Secondary / Ghost:** Use neutral surfaces and muted text for less dominant actions.

### Cards / Containers
- **Corner Style:** Rounded large (`1.25rem`) for premium panels.
- **Background:** Transparent white or dark glass surfaces with border emphasis.
- **Shadow Strategy:** Soft to premium elevation, depending on emphasis and hover.

### Tables / Data Views
- **Style:** Dense, readable rows with sticky headers and subtle hover states.
- **Behavior:** Built for fast scanning, not ornamental presentation.

### Inputs / Fields
- **Style:** Neutral field backgrounds, clear focus treatment, and standard form affordances.
- **State:** Error, warning, disabled, and success states inherit the semantic colors in the palette.

## 6. Do's and Don'ts

### Do
- **Do** keep the accent color restrained and used for actions, selection, and status rather than decoration.
- **Do** use the existing Roboto system for operational readability and compact table content.
- **Do** preserve the current glassy card and soft-shadow vocabulary when extending the dashboard.

### Don't
- **Don't** add cluttered hero-metric layouts or over-rounded cards that fight the operational task.
- **Don't** layer decorative glassmorphism or gradient text over core data surfaces.
- **Don't** replace the current semantic color system with generic SaaS-only accent patterns.
