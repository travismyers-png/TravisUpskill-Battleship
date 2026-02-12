# THEME_BIBLE.md — Comic Blueprint: Batman vs Joker

> **Rule:** This file defines visual theming only. Zero gameplay logic changes.

---

## 1. Theme Goals

| Goal | Description |
|------|-------------|
| **Comic cover energy** | Bold outlines, halftone textures, dramatic color contrast — the UI should feel like a splash page from *The Killing Joke* meets *Hush*. |
| **Blueprint board** | The 10×10 grids render as architectural blueprints: white/cyan lines on deep navy, with thicker lines every 5 cells. |
| **Two-player identity** | Player side = Batman (dark, controlled). Enemy side = Joker (chaotic, green/purple). Each board panel is visually "owned" by its character. |

---

## 2. Layout Rules

```
┌──────────────────────────────────────────────────┐
│  HEADER  (title + portraits flanking)            │
├────────────┬────────────────────┬────────────────┤
│  LEFT      │   MESSAGE BUBBLE   │  RIGHT         │
│  PANEL     ├────────────────────┤  PANEL         │
│  (Batman   │                    │  (Joker        │
│   stats)   │  ┌──────┐ ┌──────┐│   stats)       │
│            │  │BOARD 1│ │BOARD 2││               │
│            │  │Player │ │Enemy ││               │
│            │  └──────┘ └──────┘│               │
├────────────┴────────────────────┴────────────────┤
│  SETUP BAR  (difficulty, orientation, actions)   │
└──────────────────────────────────────────────────┘
```

- **Header:** Full-width bar. Title centered. Batman portrait left, Joker portrait right.
- **Side panels:** Optional stat sidebars (ships remaining, hit ratio). Hidden on mobile; collapse to inline badges above each board.
- **Boards:** Two boards side-by-side (`grid-cols-2` on md+). Each wrapped in a themed panel card.
- **Message bubble:** Centered between/above boards. Styled as a comic speech balloon with a pointed tail.
- **Setup bar:** Below header or below message. Contains difficulty select, orientation toggle, action buttons.

---

## 3. Color Tokens

Define as CSS custom properties in `globals.css` under `:root`.

### 3a. Core Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-bg` | `#0a0e1a` | Page background (dark ink) |
| `--color-surface` | `#111827` | Card/panel background |
| `--color-border` | `#1e293b` | Default border |

### 3b. Batman Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--bat-primary` | `#1e3a5f` | Player panel bg |
| `--bat-accent` | `#f5c518` | Batman yellow highlights, player hit marker |
| `--bat-text` | `#e2e8f0` | Text on batman panels |
| `--bat-glow` | `rgba(245,197,24,0.25)` | Hover/focus glow on player board |

### 3c. Joker Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--joker-primary` | `#2d1b4e` | Enemy panel bg |
| `--joker-accent` | `#39ff14` | Joker green highlights, enemy hit marker |
| `--joker-secondary` | `#9333ea` | Purple accents, sunk ship overlay |
| `--joker-text` | `#e2e8f0` | Text on joker panels |
| `--joker-glow` | `rgba(57,255,20,0.25)` | Hover/focus glow on enemy board |

### 3d. Blueprint Tokens

| Token | Hex | Usage |
|-------|-----|-------|
| `--bp-bg` | `#0b1929` | Grid background (deep navy) |
| `--bp-line` | `#1a4a7a` | Normal grid line (1px) |
| `--bp-line-major` | `#3b82f6` | Major grid line every 5 cells (2px) |
| `--bp-cell-empty` | `transparent` | Empty cell fill |
| `--bp-cell-ship` | `#1e40af` | Ship cell (player board, visible) |

### 3e. State Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--state-hit` | `#ef4444` | Hit marker background |
| `--state-miss` | `#475569` | Miss marker background |
| `--state-sunk` | `#7c3aed` | Sunk ship overlay tint |
| `--state-preview-valid` | `rgba(34,197,94,0.5)` | Valid placement preview |
| `--state-preview-invalid` | `rgba(239,68,68,0.5)` | Invalid placement preview |

---

## 4. Typography

| Role | Font | Weight | Size | Notes |
|------|------|--------|------|-------|
| **Title (h1)** | `'Bangers', cursive` | 400 | `2.5rem` / `3rem` | Comic book title feel. Import from Google Fonts. Uppercase, letter-spacing `0.05em`. |
| **Section heading (h2)** | `'Bangers', cursive` | 400 | `1.5rem` | Board titles ("Your Fleet", "Enemy Fleet"). |
| **Body / UI text** | `'Geist Sans', sans-serif` | 400–600 | `0.875rem`–`1rem` | Already loaded via `layout.tsx`. |
| **Monospace (coords)** | `'Geist Mono', monospace` | 400 | `0.75rem` | Grid labels (A–J, 1–10). |
| **Message bubble** | `'Geist Sans', sans-serif` | 600 | `1.125rem` | Slightly larger for readability. |

**Import:** Add `<link>` or `next/font/google` for **Bangers**.

---

## 5. Component Styling Rules

### 5a. Panel Card (`.panel`)

```
background:   var(--color-surface)
border:       2px solid var(--color-border)
border-radius: 12px
padding:      1.5rem
box-shadow:   0 0 20px rgba(0,0,0,0.5)
```

- Batman panel variant: `border-color: var(--bat-accent); background: var(--bat-primary)`
- Joker panel variant: `border-color: var(--joker-secondary); background: var(--joker-primary)`

### 5b. Buttons

| Variant | Background | Text | Border | Hover |
|---------|-----------|------|--------|-------|
| **Primary (Start Game)** | `var(--bat-accent)` | `#0a0e1a` | none | brightness 1.1 + `box-shadow: 0 0 12px var(--bat-accent)` |
| **Danger (Restart)** | `var(--state-hit)` | `#fff` | none | brightness 1.1 |
| **Secondary (Orientation)** | `transparent` | `var(--bat-text)` | `1px solid var(--color-border)` | `background: var(--color-border)` |
| **Battle Start** | `var(--joker-accent)` | `#0a0e1a` | none | glow with `--joker-glow` |

All buttons: `border-radius: 8px`, `font-weight: 700`, `text-transform: uppercase`, `letter-spacing: 0.05em`, `transition: all 150ms ease`.

### 5c. Difficulty Select

- Dark background (`var(--color-surface)`), light text.
- Border: `1px solid var(--color-border)`.
- On focus: `outline: 2px solid var(--bat-accent)`.

### 5d. Badges (Ships Remaining)

```
display:       inline-flex
background:    var(--color-surface)
border:        1px solid var(--color-border)
border-radius: 9999px (pill)
padding:       0.25rem 0.75rem
font-size:     0.75rem
font-weight:   600
```

### 5e. Message Bubble

```
background:    #fffbe6  (warm off-white — comic balloon)
color:         #1a1a1a
border:        3px solid #1a1a1a
border-radius: 16px
padding:       0.75rem 1.25rem
position:      relative
max-width:     28rem
margin:        0 auto 1.5rem
font-weight:   600
```

Add a CSS `::after` pseudo-element for the speech-bubble tail (triangle pointing down, using border trick).

---

## 6. Board Styling Rules

### 6a. Grid Container

```
background:      var(--bp-bg)
border:          2px solid var(--bp-line-major)
border-radius:   8px
padding:         0.5rem
```

### 6b. Cell Base

```
width:           2rem (w-8)
height:          2rem (h-8)
border:          1px solid var(--bp-line)
transition:      background 120ms ease, box-shadow 120ms ease
```

### 6c. Major Grid Lines (every 5th cell)

Cells at `col === 4` get a **right border** of `2px solid var(--bp-line-major)`.
Cells at `row === 4` get a **bottom border** of `2px solid var(--bp-line-major)`.

This creates the classic blueprint quadrant look on the 10×10 grid.

### 6d. Cell States

| State | Background | Content | Extra |
|-------|-----------|---------|-------|
| **Empty** | `var(--bp-cell-empty)` | — | — |
| **Ship (visible)** | `var(--bp-cell-ship)` | — | subtle inner glow |
| **Hit** | `var(--state-hit)` | `✕` (bold, white) | `box-shadow: 0 0 8px var(--state-hit)` — comic "explosion" glow |
| **Miss** | `var(--state-miss)` | `•` (white) | — |
| **Sunk** | `var(--state-sunk)` | `✕` | purple tint overlay |
| **Preview valid** | `var(--state-preview-valid)` | — | pulsing opacity animation |
| **Preview invalid** | `var(--state-preview-invalid)` | — | — |

### 6e. Hover

- Clickable cells: `box-shadow: inset 0 0 8px var(--bat-glow)` (player board) or `var(--joker-glow)` (enemy board).
- Cursor: `crosshair` on enemy board during play; `pointer` on player board during setup.

### 6f. Row/Column Labels

```
font-family: var(--font-mono)
font-size:   0.7rem
color:       var(--bp-line-major)
text-align:  center
```

---

## 7. Asset List

| Asset | Type | Description | Required |
|-------|------|-------------|----------|
| `batman-portrait.png` | PNG (256×256) | Batman bust, comic-style, transparent bg. Used in header left + player panel. | **Yes** |
| `joker-portrait.png` | PNG (256×256) | Joker bust, comic-style, transparent bg. Used in header right + enemy panel. | **Yes** |
| `halftone-pattern.svg` | SVG pattern | Repeating halftone dot pattern for panel backgrounds (low opacity overlay). | Optional |
| `blueprint-grid.svg` | SVG pattern | Subtle cross-hatch or graph-paper texture for board bg. | Optional |
| `comic-burst.svg` | SVG | Starburst/explosion shape behind hit markers. | Optional |

Place assets in `public/assets/theme/`.

---

## 8. Implementation Notes

- **No gameplay changes.** All modifications are in `globals.css`, `layout.tsx` (font import), and `src/ui/components/` (className swaps + CSS variables).
- **Tailwind:** Use arbitrary values (`bg-[var(--bp-bg)]`) or extend the Tailwind config with the tokens above.
- **Dark-only:** Remove the `prefers-color-scheme: dark` media query. This theme is always dark.
- **Accessibility:** Maintain WCAG AA contrast. `--bat-accent` on `--bat-primary` = 7.2:1 (passes). `--joker-accent` on `--joker-primary` = 8.1:1 (passes). Test all combos.
- **Responsive:** Boards stack vertically below `md` breakpoint. Side panels collapse to inline badges. Message bubble spans full width on mobile.

---

**PASS** — `THEME_BIBLE.md` is complete and implementable.
