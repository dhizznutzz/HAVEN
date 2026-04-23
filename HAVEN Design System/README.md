# HAVEN Design System

**Brand:** HAVEN (codebase working title: Tumbuh)
**Tagline:** Grow Together · The support system Malaysian youth were never given.
**Target audience:** Malaysian youth aged 15–30

---

## About HAVEN

HAVEN is a unified AI-powered social platform built for Malaysian youth. It breaks down isolation across three walls simultaneously: skills with nowhere to apply them, stress with no one to talk to, and opportunities they never knew existed.

The platform is built around **four deeply connected pillars**:

| Pillar | Color | Icon | Purpose |
|--------|-------|------|---------|
| **Grow** | Purple | Sprout / Compass | Skill-building, peer challenges, AI-recommended learning paths |
| **Connect** | Teal | MapPin | Volunteering, internships, community events via AI matching |
| **Circle** | Amber | Users | Study groups, hobby circles, peer mentors by interest |
| **Safe Space** | Coral/Rose | Heart | AI companion (Rakan), peer listeners, counselors — anonymous & free |

**Core principle:** The algorithm optimises for your growth, not your screen time.

---

## Sources

- **Codebase:** `tumbuh/` — Next.js 14 app (App Router), Tailwind CSS v4, shadcn/ui, Supabase, Lucide icons
- **Design tokens:** `tumbuh/src/app/globals.css`, `tumbuh/src/lib/colors.ts`
- **Component source:** `tumbuh/src/components/`
- No Figma file was provided.

---

## CONTENT FUNDAMENTALS

### Voice & Tone
- **Warm, empathetic, peer-like.** Never clinical, never corporate.
- Writes as if a slightly older friend who actually gets it — not a brand, not an institution.
- Uses **"you"** throughout. Never "users" or "members."
- **First person ("I")** avoided in brand copy; prefer direct "you" statements.
- **Bahasa Malaysia** references and local context are embedded naturally (e.g. SPM, Hari Raya, Befrienders Malaysia, UPM, UTM, Cheras, Serdang).

### Casing & Formatting
- Sentence case for almost everything. Title case only for proper nouns and pillar names (Grow, Connect, Circle, Safe Space).
- Short, declarative sentences. Minimal punctuation. Em-dashes used sparingly.
- Numbers written as numerals: "3 hours", not "three hours."

### Copy Examples
- Headlines: *"Grow Together"* / *"Four pillars. One platform."* / *"This is a private, judgment-free space."*
- CTA: *"Get started free"* / *"Join Challenge"* / *"Talk to Rakan"* / *"Be the first to share something"*
- Body: *"The platform where Malaysian youth aged 15–30 develop skills, find opportunities, build circles, and support each other — all powered by AI."*
- Safety: *"All conversations here are anonymous by default. Your name and profile are never shown."*

### Emoji Usage
- Emoji used **sparingly and contextually** in user-generated content and occasional UI labels — NOT as primary navigation icons.
- Pillar meta uses emoji as decorative badges: 🌱 Grow, 🔗 Connect, ⭕ Circle, 💙 Safe Space.
- Brand copy tends to avoid emoji in favour of Lucide icons.

### Key UX Copy Patterns
- Crisis footer always present in Safe Space: *"Befrienders Malaysia: 03-7627 2929 — Free, 24/7, confidential"*
- Anonymous confirmation: *"anonymous by default"* — always emphasised in Safe Space.
- XP/gamification: *"+50 XP on completion"* — casual, rewarding.
- AI attribution: *"Rakan"* is the AI companion name. Always warm, never "chatbot."

---

## VISUAL FOUNDATIONS

### Color System
Four semantic pillar colors plus a neutral gray, all defined in `tumbuh/src/lib/colors.ts`:

- **Purple (Grow):** `#EEEDFE` light · `#7F77DD` mid · `#534AB7` dark · `#3C3489` text
- **Teal (Connect):** `#E1F5EE` light · `#1D9E75` mid · `#0F6E56` dark · `#085041` text
- **Amber (Circle):** `#FAEEDA` light · `#BA7517` mid · `#854F0B` dark · `#633806` text
- **Coral/Rose (Safe Space):** `#FAECE7` light · `#D85A30` mid · `#993C1D` dark · `#712B13` text
- **Neutral gray:** `#F1EFE8` light · `#888780` mid · `#5F5E5A` dark · `#444441` text

Background is pure white (`oklch(1 0 0)`). Foreground is near-black (`oklch(0.145 0 0)`).
Purple is the **primary brand color**; used for primary actions, active nav, links.

### Typography
- **Font:** Geist Sans (variable font, Google Fonts / Vercel Font). No serif display face used.
- **Mono:** Geist Mono (code, technical contexts).
- Scale is tight: most UI runs at `text-xs` (12px) to `text-sm` (14px). Headers at `text-xl`–`text-2xl`.
- Weight: `font-medium` (500) preferred over `font-bold`. `font-semibold` used for brand wordmark.
- Tracking: `tracking-tight` on hero headlines.
- Line height: `leading-relaxed` for body copy.

### Spacing & Layout
- Mobile-first. Mobile uses bottom nav; desktop uses top nav.
- Main content: `max-w-5xl mx-auto px-4 py-6` (feed/grow); `max-w-lg mx-auto` (safe-space).
- Cards use `p-4` or `p-5` internal padding.
- Gap between cards: `gap-3` or `space-y-3`.
- Grid: `sm:grid-cols-2` (pillars), `lg:grid-cols-3` (grow sidebar layout).

### Corner Radii
- Standard card: `rounded-xl` (12px)
- Buttons: `rounded-xl` (12px) for primary; `rounded-lg` (8px) for small/secondary
- Avatars: `rounded-full`
- Tags/badges: `rounded-full` or `rounded-lg`
- Progress bar: `h-2` pill

### Cards
- White background (`bg-white`)
- Border: `border border-gray-100` (very subtle)
- Hover: border color lifts to `border-gray-200` or pillar color (`border-purple-200`)
- No drop shadow on most cards — relies on border distinction
- Padding: `p-4`

### Backgrounds
- Page background: `bg-gray-50` or `bg-white`
- Section alternation: white → `bg-gray-50` → `bg-purple-50`
- No image backgrounds, no patterns, no textures
- No gradients — clean flat color only

### Borders & Dividers
- `border-gray-100` standard
- `border-gray-200` on hover
- Pillar-colored borders on active/selected states
- `border-t` footer/header separators

### Shadows
- Almost no box-shadows used. The design is border-first.
- Only exception: toasts get `borderRadius: 12px` (no shadow mentioned)

### Animation / Motion
- `transition-colors` on most interactive elements
- `hover:scale-[1.01]` on pillar cards (very subtle scale)
- `animate-pulse` for skeleton loading states
- `tw-animate-css` imported — suggests CSS-based animations available
- No spring/bounce animations; no parallax; no elaborate transitions

### Hover & Press States
- Hover: background lightens (e.g. `hover:bg-gray-50`, `hover:bg-purple-700` for primary button)
- Active nav: `bg-purple-50 text-purple-700` pill highlight
- Button press: color darkens (purple-600 → purple-700)
- No shrink/scale on press for most elements

### Icons
- **Lucide React** exclusively. Stroke-based, consistent weight.
- Size: `w-4 h-4` standard; `w-5 h-5` nav/featured; `w-7 h-7` hero icons
- Icon containers: rounded `bg-{pillar}-100` circle/square

### Imagery
- No photography or illustrations in codebase
- Avatars: initials in a colored circle (`bg-purple-100 text-purple-700`)
- Maps used in Connect pillar (OpportunityMap component)
- No full-bleed images

### Transparency & Blur
- Not used. Design is opaque throughout.

---

## ICONOGRAPHY

Icons come exclusively from **Lucide React** (`lucide-react` npm package). Stroke style, uniform weight (~1.5px). No icon font, no custom SVGs for UI, no PNG icons.

**Icons used by context:**
- Brand/logo: `Sprout` (purple-600)
- Grow: `Sprout`, `Compass`, `Star`, `Trophy`, `Zap`
- Connect: `MapPin`, `Zap`
- Circle: `Users`
- Safe Space: `Heart`, `Shield`, `Bot`, `User`
- Feed: `Heart`, `MessageCircle`, `Share2`, `Plus`
- Navigation: `Home`, `Compass`, `Users`, `Heart`, `User`, `Bell`, `Search`
- Utility: `ArrowRight`, `Clock`, `Sparkles`

No emoji are used as icons in UI chrome. Emoji appear only in user content and pillar badge labels.

**CDN:** Lucide is imported as a React package, not from CDN. In static HTML/design work, use `https://unpkg.com/lucide@latest` or inline SVG equivalents.

---

## FILE INDEX

```
README.md                  ← This file
SKILL.md                   ← Agent skill definition
colors_and_type.css        ← CSS custom properties for colors + typography
assets/
  logo-sprout.svg          ← Sprout icon (brand logo mark)
preview/
  colors-brand.html        ← Brand color swatches
  colors-pillars.html      ← Pillar color system
  colors-semantic.html     ← Semantic/state colors
  type-scale.html          ← Typography scale specimen
  type-weights.html        ← Font weight samples
  spacing-radii.html       ← Border radius tokens
  spacing-tokens.html      ← Spacing scale
  components-buttons.html  ← Button variants
  components-cards.html    ← Card variants
  components-badges.html   ← Badge / tag variants
  components-inputs.html   ← Form inputs
  components-nav.html      ← Navigation components
  brand-pillars.html       ← Pillar identity system
ui_kits/
  haven-app/
    README.md
    index.html             ← Interactive app prototype
    Components.jsx         ← Shared UI components
    FeedScreen.jsx         ← Feed screen
    GrowScreen.jsx         ← Grow screen
    SafeSpaceScreen.jsx    ← Safe Space screen
    CircleScreen.jsx       ← Circle screen
```
