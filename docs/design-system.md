# 2fish design system

The rules and reasoning behind how 2fish looks. Tokens live in
`src/app/globals.css`, components live in `src/components/ui`, and every
token and variant renders at **`/styleguide`** when the app is running.

---

## 1. Project context

| | |
|---|---|
| **Project type** | Community needs board (web app, phone-first) |
| **Industry** | Mutual aid / civic / nonprofit |
| **Audience** | Neighbors of every tech level. Some are posting during a hard week, on a phone, maybe on slow data. Others are helpers with a few spare minutes. |
| **Personality** | Warm, trustworthy, dignified, hopeful. Never pity, never "charity poster". |
| **Tagline** | *A little is enough.* |

**What people should feel:** *safe* asking (posters) and *glad* giving (helpers).
Nothing should look like a bank, a hospital or a donation drive.

**Conventions we follow:** neighborhood/social apps (cards, avatars, a feed),
plus nonprofit plain language. **Conventions we avoid:** red "urgent"
fundraising styling, guilt imagery, dense dashboards.

---

## 2. Color psychology and harmony

**Harmony: complementary.** Blue 218° ↔ amber 38°, with a functional green.

| Role | Token | Why |
|---|---|---|
| **Primary: blue 218°** | `--primary` | Trust and safety. Posters share personal needs, so the brand has to read as dependable before anything else. Kept from the original prototype so 2fish still looks like itself. |
| **Accent: amber 38°** | `--accent` | The complement of the blue. Warmth, optimism, attention. Used **sparingly**: "being helped" status, urgent due dates, the preview banner. |
| **Success: green 152°** | `--success` | Growth and "it worked". Every *giving* action (I'll help, Count me in, Post my need, I got it) is green, so the act of helping has one consistent color. |
| **Destructive: red 0°** | `--destructive` | Only for real problems (form errors, safety warnings). Never used to make needs look urgent: that would feel like pressure. |
| **Neutrals: warm paper** | `--background`, `--muted`, `--border` | A slightly warm off-white (40° hue) instead of a cold grey, so the app feels homey rather than clinical. |

**Category colors** (`--cat-*`) give each post a recognizable band. They are
spread around the wheel at similar weight. Each one passes **4.5:1 with white
text**, which the original palette did not: the old orange, teal, cyan and
green were all around 3:1.

**Dark mode** is not just inverted. Big blue areas (top bar, hero) switch to a
deep navy `--brand-surface` so they don't glare, and the bright tokens are
toned down.

### Contrast (all checked numerically)

| Pair | Light | Dark |
|---|---|---|
| foreground / background | 16.7 | 15+ |
| muted-foreground / background | 6.0 | 7.7 |
| primary-foreground / primary | 6.2 | 6.4 |
| success-foreground / success | 5.3 | 5.9 |
| accent-foreground / accent | 7.3 | 9.0 |
| soft badges (open / pledged / done) | 6.3 / 6.7 / 5.6 | 6.2 / 8.9 / 7.4 |
| white / every category band | 5.4 to 7.1 | same |
| input border / surface (non-text, 3:1 rule) | 3.2 | 3.5 |

---

## 3. Token architecture

All colors are **bare HSL channels** so they work at any opacity:

```css
--primary: 218 77% 45%;            /* stored */
background: hsl(var(--primary));    /* used */
box-shadow: 0 0 40px hsl(var(--primary) / 0.3);
```

Each color has a `-foreground` partner for text on top of it, and most have a
`-soft` pair (a pale background plus a readable text color) for badges and notices.

| Group | Tokens |
|---|---|
| Surfaces | `background` `surface` `muted` `border` `input` `overlay` |
| Text | `foreground` `muted-foreground` `on-color` |
| Brand | `primary` `primary-glow` `primary-soft` `brand-surface` `brand-surface-glow` |
| Meaning | `accent` `success` `destructive` `secondary` (each with `-foreground` / `-soft`) |
| Categories | `cat-baby` `cat-food` `cat-clothing` `cat-household` `cat-school` `cat-hygiene` `cat-other` |
| Avatars | `avatar-1` … `avatar-8` |
| Effects | `--gradient-primary` `--gradient-warm` `--shadow-card` `--shadow-lift` `--shadow-pop` `--shadow-glow` `--shadow-glow-success` `--shadow-glow-accent` `--transition-smooth` |
| Motion | `--ease-smooth` `--ease-out-soft` |
| Radius | `rounded-sm` 8px · `rounded-md` 12px · `rounded-lg` 16px · `rounded-xl` 24px |

> **Tailwind v4 note.** The methodology mentions `tailwind.config.ts`.
> Tailwind v4 has no config file: the same mapping is the `@theme` block in
> `globals.css`. That block is what turns `--primary` into `bg-primary`,
> `text-primary`, `border-primary/40` and so on.

---

## 4. Components and variants

Built with `class-variance-authority`. **Need a new look? Add a variant.
Don't pass color classes in from outside.**

| Component | File | Variants |
|---|---|---|
| `Button` / `buttonVariants` | `ui/button.tsx` | `primary` `help` `hero` `inverse` `onPrimary` `secondary` `outline` `ghost` `destructive` `dev` · sizes `sm` `md` `lg` · `grow` · `block` |
| `Card` | `ui/card.tsx` | `default` `interactive` `hero` `muted` · padding `none` `sm` `md` `lg` |
| `Badge` | `ui/badge.tsx` | `open` `pledged` `done` `example` `due` `urgent` `tag` |
| `Chip` | `ui/chip.tsx` | toggle filter; selected state comes from `aria-pressed` |
| `Input` `Textarea` `Select` `Field` `Label` | `ui/input.tsx` | tones `default` `pill` `onPrimary` · `width: zip` · `withIcon` · invalid via `aria-invalid` |
| `choiceVariants` | `ui/input.tsx` | `card` (radio option) · `plain` (checkbox row) |
| `Notice` | `ui/notice.tsx` | `info` `warning` `success` `danger` |
| `Avatar` | `ui/avatar.tsx` | sizes `sm` `md` `lg` · tone `auto` (hashed) or `brand` |
| `StatusProgress` | `ui/progress.tsx` | `open` → `pledged` → `done` |
| `Skeleton` | `ui/skeleton.tsx` | loading placeholder |
| `Heading` | `ui/typography.tsx` | levels `hero` `page` `section` `card`; `as` picks the HTML tag separately |
| `Text` | `ui/typography.tsx` | `lead` `body` `meta` `eyebrow` `micro` · tone `default` `muted` `soft` |
| `Logo` | `Logo.tsx` | tone `brand` / `inherit` · motion `still` / `float` |
| `navLinkVariants`, `BottomNav` | `Nav.tsx` | top-bar links (md+) and the phone bottom bar; active state comes from `aria-current` |
| `ThemeToggle` | `ThemeToggle.tsx` | light/dark switch in the top bar, saved per browser |

**Semantic mapping to remember:**
- Giving help → `variant="help"` (green). Brand navigation → `primary`. Backing out → `secondary`.
- Need status → `<Badge variant={need.status}>`: the status *is* the variant.
- Category → `CATEGORY_TONE[category]` from `lib/categories.ts`.

---

## 5. Motion

Every animation moves only `transform` and `opacity`, so it runs on the GPU.

| Category | Utility | Used on |
|---|---|---|
| Entrance | `animate-fade-in-up` + `stagger` (set `--i`) | need cards, hero, post form |
| | `animate-scale-in` | help dialog |
| | `animate-toast-in` | toast |
| | `animate-fade-in` | dialog backdrop, error notice |
| Hover / interaction | `hover-lift`, `hover-scale`, `active:scale-[.98]` on all buttons | cards, buttons |
| Ambient | `animate-float` | fish in the hero and in empty states |
| Attention (sparingly) | `attention-glow` | **only** "Needed today/tomorrow" on open posts. The halo pulses; the text never fades. |

- Entrance animations use `backwards` fill so they don't block hover transforms afterwards.
- The progress bar fills with `scaleX`, not `width`.
- `prefers-reduced-motion: reduce` turns all of it off globally.

---

## 6. Icons

[lucide-react](https://lucide.dev): one consistent stroke style, tree-shaken (only the icons used ship).

- Buttons size icons to 20px and badges to 14px automatically (`[&_svg]` rules in the variants). Don't size icons by hand inside them.
- Icons sit **before** the label, except "opens in a new tab" (`ExternalLink`), which goes after.
- Decorative icons get `aria-hidden="true"`. An icon-only button (`size="icon"`) always needs an `aria-label`.
- Current set: `House` Feed · `Plus` Post · `HeartHandshake` help/My activity · `Search` · `Sun`/`Moon` theme · `MapPin` drop-off · `Gift` wishlist · `Clock` due date · `ExternalLink` · `ShieldCheck` safety · `ArrowDown`.

## 7. Spacing and typography

**Spacing: 8px rhythm.** `gap-2` (8) tight · `gap-4` (16) default · `gap-6` (24)
between blocks · `gap-8` (32) between columns · card padding `p-4` → `md:p-6`.
`gap-1` / `gap-3` are allowed only inside small clusters (stats, avatar + name).

**Type: Nunito Sans**, a rounded, friendly sans. Always use `<Heading>` / `<Text>`,
never hand-written font sizes. Mobile first, then larger:

| Component | Size |
|---|---|
| `<Heading level="hero">` | 36 → 60px, black |
| `<Heading level="page">` (usually `as="h1"`) | 30 → 36px |
| `<Heading level="section">` (`h2`) | 20 → 24px |
| `<Heading level="card">` (`h3`) | 18 → 20px |
| `<Text variant="lead">` | 16 → 18px |
| `<Text>` body | 16px (never smaller for reading text) |
| `<Text variant="meta">` | 14px, muted |
| `<Text variant="eyebrow">` / `micro` | small caps labels |

---

## 8. Responsive strategy

Mobile first. Content width tops out at `max-w-6xl` (1152px).

| Width | Layout |
|---|---|
| **< 640** | One column. Top bar is just logo, search and theme toggle. A **fixed bottom bar** (Feed · raised green Post · My activity) handles navigation, within thumb reach and clear of the home indicator (`safe-area-inset-bottom`). Hero shows one button. Category chips scroll sideways. |
| **sm 640+** | Form fields pair up into 2 columns. Hero shows both buttons. |
| **md 768+** | The bottom bar goes away; Feed/My activity links and "Post a need" move into the top bar. Cards go **2 columns**. |
| **lg 1024+** | Feed gets a **sticky sidebar** (post box, ZIP, stats, safety tip). Cards drop back to 1 column beside it. |
| **xl 1280+** | Feed cards go back to 2 columns. Full-width pages (My activity) use 3. |

Column counts live in one place: `NeedList`'s `layout` variant (`feed` / `wide`).
Tap targets are 44px (`min-h-11`) for main actions and 36px minimum for chips.

---

## 9. Rules (common mistakes to avoid)

1. **No raw colors in components.** No hex, `rgb()`, `bg-white`, `text-gray-500`
   or `style={{ background }}`. If a color is missing, add a token.
2. **Never put white text on a mid-tone color** without checking 4.5:1. Use the
   token's `-foreground`.
3. **`className` on a ui component is for layout only:** grid placement,
   margins, width, `hidden lg:block`. Never color, radius, shadow or font.
   A new look means a new variant.
4. **State comes from ARIA attributes:** `aria-pressed` (chips),
   `aria-current` (nav), `aria-invalid` (inputs). Never keep a separate
   "active" class that can drift out of sync.
5. **Write Tailwind classes out in full.** `bg-cat-${x}` won't be found when
   Tailwind scans the code. Use a lookup object like `CATEGORY_TONE`.
6. **Animate transform/opacity only.** No animating width, height, top or box-shadow directly.
7. **Pulse at most one thing per card**, and only for something time-sensitive.
8. **Edit both dark blocks** in `globals.css` together (system preference and `data-theme="dark"`).
9. **Keep the theme-color hex in `layout.tsx`** in sync with `--primary`. Metadata can't read CSS variables.
10. **Combine variant classes with `cn()`**, not string templates. `` `hidden ${buttonVariants()}` `` loses to the button's own `inline-flex`; `cn(buttonVariants(), "hidden md:inline-flex")` works.

---

## 10. Quality checklist

**Design system compliance**
- [x] No direct colors in components (`grep -rE "#[0-9a-f]{3,6}|rgba?\(" src/components` comes back empty)
- [x] Gradients defined as CSS variables
- [x] Variants instead of overrides
- [x] 8px spacing rhythm
- [x] Typography hierarchy with one `h1` per page

**Visual polish**
- [x] WCAG AA contrast on every text pair (table above)
- [x] One radius scale (8 / 12 / 16 / 24)
- [x] One shadow scale (card / lift / pop / glow)
- [x] Hover states on every interactive element
- [x] Loading (skeleton cards), empty (floating fish plus an action) and error states (field `aria-invalid` + focus + danger notice)

**Performance and accessibility**
- [x] Animations use transform/opacity only
- [x] `prefers-reduced-motion` respected
- [x] Semantic HTML: `header` / `main` / `nav` / `aside` / `section` / `article`, a list of needs, `fieldset` + `legend`, a `progressbar` role
- [x] Visible 3px focus ring that flips color on the blue surfaces
- [x] Skip-to-content link
- [x] Decorative SVGs are `aria-hidden`; links that open new tabs say so

**Theme:** the top-bar toggle switches light/dark and remembers the choice. With nothing saved, the app follows the device setting. A tiny script in `<head>` applies the saved choice before the page draws, so there's no flash.

**Before every PR:** open `/styleguide` and use the toggle to check light *and* dark, then check the feed at 390px and 1360px.

---

## 11. Industry adaptations: mutual aid

Things that matter for 2fish specifically, beyond generic app guidance:

- **Dignity first.** No "urgent!!" reds, no progress bars toward a goal, no
  totals of money. Status words are gentle: *Open · Being helped · Received*.
- **Safety is designed in, not bolted on.** Safety tips use the calm `info`
  notice, sitting beside the action, never as a scary modal. The street-address
  check points straight at the field that triggered it.
- **Low-bandwidth friendly.** One web font, no images in the feed, an SVG logo,
  skeletons instead of spinners.
- **Plain language.** Labels describe the action ("I'll help", "I got it,
  thank you"), never system terms ("Submit", "Claim").
- **Phone first, desktop welcome.** Most posters will be on phones; many
  helpers browse from a laptop, so the desktop layout adds the sidebar
  instead of just stretching the phone layout.
- **If 2fish adds partners later** (food banks, schools), give them a variant
  (for example a `verified` badge), not a new color scheme.
