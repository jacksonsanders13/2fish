# 2fish design system

The rules and reasoning behind how 2fish looks. Tokens live in
`src/app/globals.css`, components live in `src/components/ui`, and every
token and variant renders at **`/styleguide`** when the app is running.

---

## 1. Project context

| | |
|---|---|
| **Project type** | Community needs board, built as a **social feed** (phone first, desktop welcome) |
| **Industry** | Mutual aid / civic |
| **Audience** | Neighbors of every tech level. Some are posting during a hard week, on a phone. Others are helpers with a few spare minutes, scrolling like they would any feed. |
| **Personality** | Warm, human, a little playful. Never corporate, never "charity poster". |
| **Tagline** | *A little is enough.* |

**What people should feel:** this is *people*, not an institution. Posts look
like posts from neighbors, not tickets in a queue.

**Conventions we follow:** social feeds (Instagram, Nextdoor, X): avatar-first
posts as rows, a stories-style filter row, a bottom tab bar on phones, three
columns on desktop. **Conventions we avoid:** boxed corporate cards, big
marketing heroes, red "urgent" fundraising styling.

---

## 2. Color

**One brand color on white.** Social apps get their identity from a single
signature color against clean white, with everything else neutral.

| Role | Token | Why |
|---|---|---|
| **Primary: koi coral (8°)** | `--primary` | Two fish, so koi; it's also the color of the logo mark. Warm, friendly and unmistakably 2fish. It's the color of every action that brings people together: *I'll help*, *Post a need*, *Count me in*, *I got it*. Also the selected category ring and the logo. |
| **Neutrals: white + warm ink** | `--background` `--foreground` `--muted` `--border` | Pure white keeps the feed calm so photos-less text posts still breathe; the ink and greys lean slightly warm (20–30°) to sit well next to coral. |
| **Accent: amber (38°)** | `--accent` | Only for *time*: "Needed today/tomorrow" and "A neighbor is helping". |
| **Success: sage (150°)** | `--success` | Only for "Received". Good news, quietly. |
| **Destructive: red (0°)** | `--destructive` | Real errors only. |
| **Focus ring: ink** | `--ring` | Deliberately *not* coral: a coral ring looked like an error state next to the red. |

**Categories** each have an icon and a color (`--cat-*`), shown as a small
colored "● Food" label on posts and as the icon color in the stories row.
They no longer fill big bands, so the feed isn't a rainbow.

**Dark mode** is a warm near-black (not blue-black) with a lighter coral and
dark text on coral buttons.

### Contrast (checked numerically, WCAG AA)

| Pair | Light | Dark |
|---|---|---|
| foreground / background | 17.5 | 16.4 |
| muted-foreground / background | 5.8 | 7.7 |
| button text / primary (coral) | 4.85 | 6.55 |
| accent text / accent (urgent badge) | 7.3 | 9.0 |
| soft badges and status lines (coral / amber / sage) | 5.6 / 6.1 / 6.6 | 7.0 / 8.9 / 7.8 |
| input border / surface (non-text, needs 3:1) | 3.3 | 3.7 |

---

## 3. Token architecture

Colors are **bare HSL channels** so they work at any opacity:

```css
--primary: 8 78% 47%;               /* stored */
background: hsl(var(--primary));     /* used */
box-shadow: 0 0 40px hsl(var(--primary) / 0.3);
```

Each color has a `-foreground` partner for text on top of it, and most have
a `-soft` pair (pale background + readable text) for badges and status lines.

| Group | Tokens |
|---|---|
| Surfaces | `background` `surface` `muted` `border` `input` `overlay` |
| Text | `foreground` `muted-foreground` `on-color` |
| Brand | `primary` `primary-glow` `primary-soft` (`brand-surface` reserved for a future large coral area) |
| Meaning | `accent` `success` `destructive` `secondary` (each with `-foreground` / `-soft`) |
| Categories | `cat-baby` `cat-food` `cat-clothing` `cat-household` `cat-school` `cat-hygiene` `cat-other` |
| Avatars | `avatar-1` … `avatar-8` |
| Effects | `--shadow-card` `--shadow-lift` `--shadow-pop` `--shadow-glow` `--transition-smooth` |
| Type | `font-display` (Bricolage Grotesque) · `font-sans` (Figtree) |
| Radius | `rounded-sm` 8 · `rounded-md` 12 · `rounded-lg` 16 · `rounded-xl` 24 · `rounded-full` for buttons, inputs, avatars |

> **Tailwind v4 note.** There is no `tailwind.config.ts`; the `@theme`
> block in `globals.css` is what turns `--primary` into `bg-primary` etc.

---

## 4. Components and variants

Built with `class-variance-authority`. **Need a new look? Add a variant.
Don't pass color classes in from outside.**

| Component | File | Variants |
|---|---|---|
| `Button` / `buttonVariants` | `ui/button.tsx` | `primary` `secondary` `outline` `ghost` `destructive` `dev` · sizes `sm` `md` `lg` `icon` · `block`. All pill-shaped. |
| `Card` | `ui/card.tsx` | `default` `flat` (sidebar widgets) `muted` · padding `none` `sm` `md` `lg`. Posts are **not** cards. |
| `Badge` | `ui/badge.tsx` | `open` `pledged` `done` `example` `due` `urgent` `tag` |
| `Segmented` | `ui/segmented.tsx` | iOS-style switch: My ZIP / Nearby / Anywhere, My posts / I'm helping |
| `Input` `Textarea` `Select` `Field` `Label` | `ui/input.tsx` | tones `default` `pill` `search` · `width: zip` · `withIcon` · invalid via `aria-invalid` |
| `choiceVariants` | `ui/input.tsx` | `card` (radio option) · `plain` (checkbox row) |
| `Notice` | `ui/notice.tsx` | `info` `warning` `success` `danger` `banner` |
| `Heading` / `Text` | `ui/typography.tsx` | see §7 |
| `Avatar` | `ui/avatar.tsx` | sizes `sm` `md` `lg` · tone `auto` (hashed) or `brand` |
| `Skeleton` | `ui/skeleton.tsx` | loading placeholder |
| `NeedCard` | `NeedCard.tsx` | one post row: avatar · name/place/time · category + due · title · story · spot/wishlist · status line · actions |
| `CategoryStories` | `CategoryStories.tsx` | round category filters; selected = coral ring (`aria-pressed`) |
| `CATEGORY_META`, `CategoryTag` | `category.tsx` | icon + color per category |
| `Logo`, `Wordmark` | `Logo.tsx` | the two-fish "2" mark, one color · tone `brand` (coral) / `ink` / `muted` · motion `still` / `float` |
| `BottomNav`, `railLinkVariants` | `Nav.tsx` | phone tab bar; desktop rail links. Active state from `aria-current` |
| `LeftRail`, `RightRail` | `Rails.tsx` | desktop columns |
| `ThemeToggle` | `ThemeToggle.tsx` | light/dark switch, saved per browser; `withLabel` in the rail |

**Status is words, not a progress bar.** Open posts just show their actions.
Pledged posts show an amber line: "A neighbor is helping with this. 'note'".
Received posts show a sage line.

---

## 5. Motion

Every animation moves only `transform` and `opacity`.

| Category | Utility | Used on |
|---|---|---|
| Entrance | `animate-fade-in-up` + `stagger` (set `--i`) | feed posts, post form |
| | `animate-sheet-in` | help sheet sliding up on phones |
| | `animate-scale-in` | help dialog on larger screens |
| | `animate-toast-in`, `animate-fade-in` | toast, backdrop, error notice |
| Hover / interaction | row tint on hover, `hover-scale`, `active:scale-[.97]` on all buttons | posts, story bubbles, buttons |
| Ambient | `animate-float` | koi in empty states |
| Attention (sparingly) | `attention-glow` | **only** "Needed today/tomorrow" on open posts |

Entrance animations use `backwards` fill so hover transforms still work
afterwards. `prefers-reduced-motion: reduce` turns all of it off.

---

## 6. Icons

[lucide-react](https://lucide.dev), one consistent stroke style, tree-shaken.

- Buttons size icons to 20px (16px at `sm`), badges to 14px, automatically.
- Icons go **before** the label, except "opens in a new tab" (`ExternalLink`).
- Decorative icons get `aria-hidden="true"`; icon-only buttons need `aria-label`.
- Categories: `Baby` · `Apple` Food · `Shirt` · `Sofa` Household · `Backpack` School · `Droplets` Hygiene · `Package` Other · `LayoutGrid` All.
- App: `House` Feed · `Plus` Post · `HeartHandshake` help / My activity · `Search` · `Sun`/`Moon` · `MapPin` · `Gift` · `Clock` · `CircleCheck` · `ExternalLink` · `ShieldCheck`.

---

## 7. Spacing and typography

**Spacing: 8px rhythm.** Feed rows are `px-4 py-4`, separated by a 1px
`border-border` line. `gap-2` inside a post, `gap-3` between avatar and
content, `gap-4` between sections of the rails.

**Type:** **Bricolage Grotesque** (display: wordmark, headings, big numbers)
gives 2fish its character; **Figtree** (body) is friendly and very legible
at small sizes. Always use the components:

| Component | Size |
|---|---|
| `<Heading level="hero">` | 36 → 48px |
| `<Heading level="page">` | 24 → 30px |
| `<Heading level="section">` | 18 → 20px |
| `<Heading level="card">` (post title) | 18px |
| `<Text>` body | 16px (never smaller for reading text) |
| `<Text variant="meta">` | 14px muted: place, time |
| `<Text variant="eyebrow" / "micro">` | 12px labels |

---

## 8. Responsive strategy

The feed column is **620px max** at every size, like a social app.

| Width | Layout |
|---|---|
| **< 1024** | One column. Top bar: wordmark, search, theme toggle. **Bottom tab bar** (Feed · coral Post · My activity) with `safe-area-inset-bottom`. ZIP + distance switch sit at the top of the feed. Help opens as a **bottom sheet**. |
| **lg 1024+** | **Left rail** appears (wordmark, Feed, My activity, big Post button, theme switch). Bottom bar goes away. Top bar shrinks to just search. |
| **xl 1280+** | **Right rail** appears (search, Your area, Near you numbers, safety tip). The top bar and the in-feed ZIP row go away. |

Tap targets: 44px for main actions, 36px minimum for small pills.

---

## 9. Rules (common mistakes to avoid)

1. **No raw colors in components.** No hex, `rgb()`, `bg-white`, `text-gray-500` or `style={{ background }}`.
2. **One coral thing per post.** The "I'll help" button is the post's coral moment; everything else on the row stays neutral.
3. **Posts are rows, not cards.** Don't wrap a post in a bordered box.
4. **`className` on a ui component is for layout only:** spacing, width, grid placement, `hidden xl:grid`. Never color, radius, shadow or font.
5. **State from ARIA:** `aria-pressed` (stories, segmented), `aria-current` (nav), `aria-invalid` (inputs).
6. **Write Tailwind classes out in full** (`CATEGORY_META` lists them). `bg-cat-${x}` won't be found.
7. **Combine classes with `cn()`**, not string templates, whenever both sides could set the same property (`cn(buttonVariants(), "hidden md:inline-flex")`).
8. **Animate transform/opacity only.** Pulse at most one thing per post.
9. **Edit both dark blocks** in `globals.css` together.
10. **Keep the theme-color hex in `layout.tsx`** in sync with `--background`.

---

## 10. Quality checklist

**Design system compliance**
- [x] No direct colors in components
- [x] Variants instead of overrides
- [x] 8px rhythm; one feed column width
- [x] Type only through `Heading` / `Text`

**Visual polish**
- [x] WCAG AA contrast on every text pair (table above)
- [x] Hover states on every interactive element
- [x] Loading (skeleton post rows), empty (floating koi + action), error (field `aria-invalid` + focus + danger notice; retry if the board can't load)

**Performance and accessibility**
- [x] Animations use transform/opacity; reduced motion respected
- [x] Semantic HTML: rails are `header`/`aside`, posts are `article` in a list, `fieldset` + `legend`, a visually hidden `h1` on the feed
- [x] Visible 3px ink focus ring; skip-to-content link
- [x] Decorative SVGs `aria-hidden`; new-tab links say so

**Theme:** the toggle remembers the choice; with none saved the app follows the device. A tiny `<head>` script applies it before first paint.

**Before every PR:** `/styleguide` in light and dark, then the feed at 390px, 1100px and 1440px.

---

## 11. Mutual-aid specifics

- **Dignity first.** Status words are gentle: *A neighbor is helping with this*, *Received. Thank you, neighbor.* No goal bars, no money totals.
- **Safety in context.** The safety tip sits in the rail and the post form, calm and visible. The street-address check points at the field that triggered it.
- **Low-bandwidth friendly.** Two web fonts, no images in the feed, SVG logo (~3 KB), skeletons not spinners.

## 12. Logo

The mark is two fish swimming around each other, their bodies forming a **2**. Files:

- `assets/logo-source.png`: the original artwork
- `assets/logo.svg` (ink) and `assets/logo-coral.svg`: vector versions traced with potrace
- `src/app/icon.svg`: favicon, white mark on a coral rounded square
- `src/components/logo-paths.ts`: the same paths, used by `<Logo>` so it can take any token color

The mark is a single color. Use coral (`brand`) by default, ink where coral would compete with a coral button, never more than one color inside the mark.
- **Plain language.** Actions say what happens ("I'll help", "I got it, thank you"), never "Submit" or "Claim".
