# 2fish design decisions

Harbor (navy + Bricolage Grotesque) was retired on Nov 20, 2026. The current system came out of the UI UX Pro Max skill (`.claude/skills/ui-ux-pro-max`), with its picks filtered through the rules in CLAUDE.md. The skill wanted Inter only and a green primary; both were swapped out (Inter breaks the font rule, and green is reserved for money).

## Rules

1. UI is shadcn/ui components plus lucide-react icons. Never emoji as icons.
2. Swiss and plain: flat colour, high contrast, grid, white space. No gradients, glass, blur or soft shadows.
3. Two typefaces. Calistoga for headlines (`text-display`), IBM Plex Sans for everything else. Hierarchy by size and weight, not colour.
4. Spacing on a 4/8px scale. Left-aligned content. No centred hero with three cards.
5. Radius 4px (`--radius: 0.25rem`). Shadows only on things that float (menus, dialogs).

## Palette

Deep teal and coral, chosen by Jackson on Nov 20, 2026 (replaced a near-black and orange first pass).

| Token | Hex | Role |
| --- | --- | --- |
| `white` | `#FFFFFF` | Page and card background. |
| `surface` | `#F1F6F6` | Panel background. |
| `line` | `#DCE6E6` | 1px borders. |
| `ink` | `#0F1F20` | Text. |
| `muted` | `#556667` | Timestamps, help text, captions only. |
| `night` | `#0E3B3C` | Deep teal. Primary buttons, the closing band, app header, stat strip. `night-tint` `#175152` hover, `night-deep` `#082829` pressed. |
| `signal` | `#C8402F` | Coral, the one bright colour (4.96:1 with white text; the brighter `#DC4B3E` fails). Only the main action on a screen (`<Button variant="signal">`) and focus rings. Hover `signal-tint` `#A8321F`. |
| `cash` | `#047857` | Dollars the owner gains or recovers. On night it becomes `cash-bright` `#6EE7B7`. Nothing else is green. |

Losses are shown in ink, not green or orange. Every dollar figure uses tabular numerals (`.num`).

shadcn's tokens (`--primary`, `--ring`, `--radius`, etc.) are mapped onto this palette in `globals.css`.

## Type

- **Calistoga** (one weight, 400) for `text-display` headlines. `globals.css` forces weight 400 so it is never fake-bolded.
- **IBM Plex Sans** 400/500/600/700 for body, UI and big dollar numbers. A `.num.text-display` figure switches back to Plex semibold because Calistoga has no tabular digits.
- Sizes: `text-display` clamp(36px, fluid, 56px), `text-base` 16px, `text-sm` 14px.

## Layout habits

- Left-aligned text. Asymmetric two-column sections. No three-identical-cards rows.
- The dashboard is the hero image, beside the headline on desktop, under it on phones.
- The landing page is a funnel (the skill's "3-step conversion" pattern): hero, then 01 Find the leak (calculator), 02 Get the plan (the loop), 03 Let 2fish do it (features + pricing), each with a small text link as its call to action, the step number pinned in a left column on desktop. One night band at the very end holds the main ask. Coral is only on the "Start your free audit" buttons.
- Mobile first. Every screen checked at 375px. Dashboard gets a bottom tab bar on phones.
- Placeholders are labelled. No fake logos, testimonials or made-up stats.

## Using the UI UX Pro Max skill

Search it for ideas (`python .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" --domain <ux|color|typography|chart|...>`). When it disagrees with CLAUDE.md (it likes glassmorphism and Inter for some product types), CLAUDE.md wins.

## Motion

Added at Jackson's request on Nov 14, then made bolder the same day because the first pass read as too subtle. Built with the `motion` library. Under Reduce Motion everything still fades in, nothing moves.

- **Headline.** Words rise in one after another (50ms apart). Subhead and buttons follow at 0.45s and 0.6s.
- **Hero dashboard.** Rises 48px into place, then assembles itself: the big number counts up, plan rows stagger in, activity lines slide in from the right.
- **Screen changes.** Every navigation fades the new screen in (350ms).
- **Reveal on scroll.** Sections rise 28 to 40px and fade in the first time they enter the viewport, once. Siblings stagger 0.1 to 0.12s. No parallax, no scroll-jacking.
- **Numbers.** Dollar figures and stats count up (1 to 1.8s). Bars grow from zero (about 1s). The calculator's number tweens when you move the slider.
- **Audit.** Questions slide 48px in the direction of travel. Options stagger in, shrink 3% on tap, and the checkmark springs in.
- **Dashboard.** Rows and cards stagger in; the Live badge has a pulsing dot.
- **Video step.** A sliding bar while clips are "cutting", cards stagger in by 100ms, the approved mark springs in, the scheduled notice expands.
- **Text-back.** Chat bubbles slide in from their own side, 200ms apart, like a replay.
- **Buttons.** 150ms colour transitions and a 2% press scale.

Not allowed: looping decoration (the Live pulse is the one exception, and it's a status), cursor effects, parallax, anything much longer than a second per element.
