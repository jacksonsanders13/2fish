# 2fish design decisions

Phase 1 mockup. Two directions live side by side at `/a` and `/b`. They share one palette (navy, white, a beige accent, one green for money) and differ in typography, how much navy they use, corner radius, and layout.

## Palette

Six named colors, solid only. No gradients anywhere on the site in Phase 1.

| Token | Hex | Role |
| --- | --- | --- |
| `white` | `#FFFFFF` | Page background. Always white, never cream. |
| `surface` | `#F4F6F9` | Cool off-white for app backgrounds and quiet bands. |
| `navy` | `#0C2340` | Brand color. Text, primary buttons, and in direction B the hero and app chrome. `navy-tint` (`#1A3A66`) is the hover shade, `navy-deep` (`#071A33`) the pressed shade. |
| `sand` | `#ECE5D6` | The beige accent. Secondary surfaces only: tags, highlighted panels, the backdrop behind product shots. Never the page background (that would be the cream default the brief bans). `sand-deep` (`#D9CDB0`) for borders on sand. |
| `muted` | `#5B6B81` | Secondary text. Passes AA on white and surface. |
| `cash` | `#157347` | Dollar amounts only. On navy it becomes `cash-bright` (`#6AD49C`). Nothing else is green. |

Also: `line` (`#D9DFE8`) for 1px borders. On navy, borders are white at 16% and muted text is `#A7B5CA`.

Rule for numbers: money the owner gains or recovers is green. Money the owner is losing (audit results) is navy. Every dollar figure uses tabular numerals.

## Type

- **Direction A, "Ledger".** Headlines in Instrument Serif (Google Fonts), body in Instrument Sans. Feels like a bank statement from a bank you'd trust. Serif only above 24px.
- **Direction B, "Harbor".** Headlines in Bricolage Grotesque (Google Fonts), body in Satoshi (Fontshare). Bolder, more product-company.
- Headline tracking is tight (-0.02em to -0.03em). Body is 16px on mobile, 17px for long marketing copy.
- Type scale: 12, 13, 14, 15, 16, 18, 20, 24, 30, 36, 48, 60, 72.

## Spacing, radius, shadow

- Spacing on a 4px base: 4, 8, 12, 16, 24, 32, 48, 64, 96. Section padding is 64px on mobile and 96px on desktop.
- Radius: A uses 6px on controls and 10px on cards. B uses 10px and 16px. Nothing is a pill except status tags.
- Shadows: none in A. B allows one shadow level on raised product shots only (`0 1px 2px rgba(12,35,64,.06), 0 8px 24px rgba(12,35,64,.08)`). Cards are separated by 1px lines, not shadows.
- Max content width 1152px. Marketing copy columns max 640px.

## Icons

Lucide, 16px or 20px, stroke 1.75, always next to a text label. No emoji.

## Logo

Jackson's own mark: two fish whose bodies link into a 2. Single color, so it takes navy on white and white on navy. Wordmark is "2fish" in the body font, semibold.

## Layout habits

- Left-aligned text. Asymmetric two-column sections. No three-identical-cards rows.
- The dashboard is the hero image. It sits right under the headline on both landing pages.
- Mobile first. Every screen is checked at 375px. Dashboard B gets a bottom tab bar on phones; dashboard A gets a horizontal tab strip.
- Placeholders are labeled as placeholders (pricing, video thumbnails). No fake logos, testimonials, or made-up stats.

## How the two directions differ

| | A "Ledger" | B "Harbor" |
| --- | --- | --- |
| Feel | Calm, Mercury/Ramp | Confident, Linear/Attio |
| Navy usage | Type and buttons. One navy band at the end. | Hero, app header, stat strip. |
| Headline font | Instrument Serif | Bricolage Grotesque |
| Landing hero | Headline, then full-width dashboard shot on a sand backdrop | Navy hero, dashboard shot overlapping into the white section |
| Dashboard | Left sidebar, plan as a ledger-style list | Top bar, big navy stat strip, plan as stacked cards |
| Radius | 6 / 10 | 10 / 16 |
