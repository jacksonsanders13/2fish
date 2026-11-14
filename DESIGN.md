# 2fish design decisions

Phase 1 mockup. Two directions live side by side at `/a` and `/b`. They share one palette, one component library (shadcn/ui, re-themed) and one set of rules. They differ in typeface, how much navy they use, and layout.

## Rules (from Jackson, Nov 14)

1. UI is shadcn/ui components plus lucide-react icons. Never emoji as icons.
2. No gradients, no glassmorphism, no purple or blue "AI" palette. One neutral base plus one accent colour.
3. Type: one font per direction, at most three sizes on any screen. Hierarchy by weight, not colour.
4. Spacing on a 4/8px scale. Left-aligned content. No centred hero with three cards.
5. Radius 8px. Shadows only on things that float (menus, dialogs).

## Palette

| Token | Hex | Role |
| --- | --- | --- |
| `white` | `#FFFFFF` | Page and card background. |
| `surface` | `#F4F4F5` | Neutral panel background (zinc-100). |
| `line` | `#E4E4E7` | 1px borders (zinc-200). |
| `ink` | `#18181B` | Text (zinc-900). |
| `muted` | `#71717A` | Timestamps, help text, captions only (zinc-500). |
| `navy` | `#0C2340` | The one accent. Buttons, links, active states, focus rings, and in direction B the hero band and app header. `navy-tint` `#1A3A66` is hover, `navy-deep` `#071A33` is pressed. |
| `cash` | `#157347` | Dollar figures the owner gains or recovers. On navy it becomes `cash-bright` `#6AD49C`. Nothing else is green. |

Losses on the results page are shown in ink, not green. Every dollar figure uses tabular numerals.

shadcn's own tokens (`--primary`, `--muted`, `--border`, `--ring`, `--radius`) are mapped onto this palette in `globals.css`, so every shadcn component picks it up without per-component overrides.

## Type

- **Direction A, "Ledger".** Instrument Sans only. Calm, Mercury-like.
- **Direction B, "Harbor".** Bricolage Grotesque only. More character, more product-company.
- Three sizes, defined once as Tailwind tokens:
  - `text-display`: clamp(36px, fluid, 56px), line-height 1.05, tracking -0.025em. Headlines and the big dollar number.
  - `text-base`: 16px. Body, card titles, buttons, inputs.
  - `text-sm`: 14px. Labels, timestamps, nav, badges.
- Hierarchy comes from weight: semibold for titles and labels, regular for body. Muted colour is only for metadata, never to signal "less important heading".

## Spacing, radius, shadow

- 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Section padding 64px on phones, 96px on desktop.
- Radius 8px on everything (`--radius: 0.5rem`). Only status badges are pills.
- No shadows on cards, product shots, or buttons. Menus and dialogs may have one when they exist.
- Max content width 1152px. Marketing copy columns max 640px.

## Icons

Lucide, 16px or 20px, always next to a text label.

## Logo

Jackson's own mark: two fish whose bodies link into a 2. Single colour, so it takes navy on white and white on navy. Wordmark is "2fish" in the direction's font, semibold.

## Layout habits

- Left-aligned text. Asymmetric two-column sections. No three-identical-cards rows.
- The dashboard is the hero image. It sits right under the headline on both landing pages.
- Mobile first. Every screen checked at 375px. Dashboard B gets a bottom tab bar on phones; dashboard A gets a horizontal tab strip.
- Placeholders are labelled (pricing, video thumbnails, Privacy and Terms). No fake logos, testimonials or made-up stats.

## How the two directions differ

| | A "Ledger" | B "Harbor" |
| --- | --- | --- |
| Font | Instrument Sans | Bricolage Grotesque |
| Navy usage | Buttons and links. One navy band at the end. | Hero, app header, stat strip. |
| Landing hero | Headline, then full-width dashboard shot on a surface panel | Navy hero, dashboard shot overlapping into the white section |
| Dashboard | Left sidebar, plan as a ledger-style list | Top bar, big navy stat strip, plan as stacked cards |

## Motion

Added at Jackson's request on Nov 14. Built with the `motion` library, and every piece checks the viewer's reduce-motion setting and turns itself off.

- **Entrance.** Above-the-fold content (hero headline, subhead, buttons, product shot) fades and rises in with an 80ms stagger. 550ms, ease-out.
- **Reveal on scroll.** Sections fade and rise 14px the first time they enter the viewport, once. No parallax, no scroll-jacking, nothing tied to scroll position.
- **Numbers.** Dollar figures count up the first time they're seen (about 1.2s) and tween between values in the calculator (0.6s). Progress bars fill from zero.
- **Audit.** Questions slide 20px in the direction of travel over 240ms. Selected options get a small spring on the checkmark.
- **Video step.** A sliding bar while clips are "cutting", cards stagger in by 70ms, the approved mark springs in, the scheduled notice expands.
- **Text-back.** Chat bubbles appear one after another, 120ms apart, like a replay.
- **Buttons.** 150ms colour transitions and a 2% press scale.

Not allowed: looping decorative animation, cursor effects, parallax, anything longer than about a second.
