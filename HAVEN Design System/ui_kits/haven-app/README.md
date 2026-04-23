# HAVEN App UI Kit

Interactive mobile prototype for the HAVEN app. Built with React + Geist Sans + Lucide icons.

## Screens

| Screen | File | Description |
|---|---|---|
| Feed | `FeedScreen.jsx` | Main activity feed with pillar filters, post cards, like/share actions, compose sheet |
| Grow | `GrowScreen.jsx` | Level progress, skill badges, AI recommendations, challenge cards |
| Safe Space | `SafeSpaceScreen.jsx` | Mode selector (AI / Peer / Counselor) + Rakan AI chat interface |
| Circle | `CircleScreen.jsx` | Circle discovery, join/leave, member progress bars |
| Profile | *(in index.html)* | Avatar, skills, badges, XP display |

## Shared Components (`Components.jsx`)

- `HavenBottomNav` — mobile bottom nav, 5 items, active highlight in purple
- `HavenTopBar` — page header with sprout logo + notification bell
- `PillarBadge` — color-coded pillar label pill
- `Avatar` — initials circle, pillar-tinted
- `Btn` — primary / ghost / success / outlined variants
- `Card` — white card with gray-100 border + hover state
- `Tag` — purple hashtag
- `ProgressBar` — thin purple progress pill
- All Lucide-compatible icons as inline SVGs

## Design tokens used

See `../../colors_and_type.css` for full token reference.
- Font: Geist Sans (Google Fonts)
- Primary: `#7C3AED` (purple-600)
- Card radius: `12px` (rounded-xl)
- Bottom nav height: `64px`
