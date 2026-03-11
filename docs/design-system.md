# Design System Documentation
**Ankuaru B2B Marketplace — Agriculture & Specialty Coffee**

---

## Design Principles

1. **Trustworthy** — Reliable, consistent UI that builds confidence in a B2B context
2. **Warm** — Coffee and agricultural inspiration; earthy, welcoming tones
3. **Professional** — Clean layouts, dense information display, no clutter
4. **Accessible** — WCAG-compatible contrast, semantic HTML, keyboard navigation

---

## Brand Direction

| Attribute | Value |
| :--- | :--- |
| Product type | B2B marketplace for specialty coffee and spices |
| Target users | Buyers, sellers, brokers in agriculture supply chains |
| Visual mood | Trustworthy, agricultural, modern dashboard |
| Primary inspiration | Earthy greens, coffee browns, warm neutrals |

---

## Color Tokens

All colors are defined in `app/globals.css` as CSS variables, extended to Tailwind via `@theme`.

### Semantic Tokens (use these in components)

| Token | Light | Dark | Usage |
| :--- | :--- | :--- | :--- |
| `--background` | `#F8F6F2` | `#112114` | Page background |
| `--foreground` | `#1F1A17` | `#F8F6F2` | Primary text |
| `--card` | `#FFFFFF` | `#1C2E1F` | Card backgrounds |
| `--card-foreground` | `#1F1A17` | `#F8F6F2` | Text inside cards |
| `--primary` | `#3D7F5D` | `#3D7F5D` | Brand green, CTAs |
| `--primary-foreground` | `#FFFFFF` | `#FFFFFF` | Text on primary |
| `--secondary` | `#F2EEE7` | `#243627` | Secondary surfaces |
| `--muted` | `#F2EEE7` | `#243627` | Subtle backgrounds |
| `--muted-foreground` | `#6B6259` | `#A19B91` | Secondary text |
| `--accent` | `#4B936C` | `#4B936C` | Accent/hover states |
| `--destructive` | `#C0392B` | `#E53E3E` | Errors, delete actions |
| `--border` | `#DDD6C8` | `#2F3B32` | All borders |
| `--ring` | `#3D7F5D` | `#4B936C` | Focus rings |

### Brand-Specific Tokens

| Token | Value | Usage |
| :--- | :--- | :--- |
| `--coffee` | `#5A3A24` | Coffee brown — product categories, warm accents |
| `--success` | `#2E7D32` | Positive states, OPEN auction |
| `--warning` | `#B7791F` | Caution, price warnings, CLOSING soon |

### Tailwind Classes
Use semantic class names only. Avoid hardcoded hex or raw Tailwind colors when a semantic token exists.

```
✅ bg-primary text-primary-foreground
✅ border-border bg-card
✅ text-muted-foreground

❌ bg-green-700
❌ bg-white dark:bg-slate-900
❌ border-slate-200 dark:border-slate-800
```

---

## Typography Scale

Base font: **Inter** (`--font-display`)

| Level | Class | Usage |
| :--- | :--- | :--- |
| Page title | `text-3xl font-bold tracking-tight` | PageHeader title |
| Section title | `text-xl font-bold` | Card titles, section headings |
| Body | `text-sm` or `text-base` | General content |
| Label | `text-xs font-bold uppercase tracking-wider` | Metadata labels |
| Caption | `text-xs text-muted-foreground` | Timestamps, helpers |

**Heading hierarchy rule:** One `<h1>` per page (always in `PageHeader`). Section titles use `<h2>` or `<h3>`.

---

## Spacing Scale

**Base unit: 4px grid** (Tailwind default: `1 = 4px`)

| Token | px | Usage |
| :--- | :--- | :--- |
| `gap-2` | 8px | Tight icon/label spacing |
| `gap-3` | 12px | Badge rows, inline items |
| `gap-4` | 16px | Default section gap |
| `gap-6` | 24px | Card internal sections |
| `gap-8` | 32px | Page-level section separation |
| `p-4` | 16px | Tight card padding |
| `p-6` | 24px | Standard card padding |
| `p-8` | 32px | Large/hero card padding |

**Rule:** Cards always use `p-6`. Tight row items use `p-3` or `p-4`.

---

## Border Radius

| Token | Value | Usage |
| :--- | :--- | :--- |
| `rounded-sm` | 4px | Badges (tight) |
| `rounded-md` | 6px | Inputs, small elements |
| `rounded-lg` | 8px | Cards (`--radius`) |
| `rounded-xl` | 12px | Feature cards, hero blocks |
| `rounded-full` | 9999px | Avatars, pill badges |

**Rule:** Standard `Card` uses `rounded-lg`. Page sections do not need border-radius.

---

## Shadow System

| Level | Class | Usage |
| :--- | :--- | :--- |
| Subtle | `shadow-sm` | Cards in lists |
| Default | `shadow-md` | Elevated cards, hover states |
| Prominent | `shadow-lg` | Modals, dropdowns |
| Brand | `shadow-primary/20` | CTAs, highlight elements |

---

## Layout Primitives

Located in `components/layout/`

### `PageShell`
Top-level wrapper for every page. Sets min-height, background, and base flex layout.

```tsx
<PageShell>
  <Header />
  <PageContainer>...</PageContainer>
</PageShell>
```

### `PageContainer`
Standard content width container (max 1280px). Add responsive horizontal padding.

```tsx
<PageContainer>
  <PageHeader title="Auctions" description="Browse live B2B auctions" />
  <PageSection>...</PageSection>
</PageContainer>
```

### `PageHeader`
Page-level heading area. Accepts `title`, `description`, and `actions` slot.

```tsx
<PageHeader
  title="My Profile"
  description="Manage your account settings"
  actions={<Button>Edit Profile</Button>}
/>
```

### `PageSection`
Standard content block with `gap-4`. Use for thematic groupings within a page.

---

## Base UI Primitives

Located in `components/ui/`

### `Button`
Use the shared `Button` component for **all** interactive buttons. Never use raw `<button>` with ad-hoc Tailwind classes.

```tsx
<Button variant="default">Place Bid</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost" size="icon" aria-label="Close"><X /></Button>
```

| Variant | Use when |
| :--- | :--- |
| `default` (primary) | Primary CTA |
| `secondary` | Secondary actions |
| `outline` | Tertiary actions, cancel |
| `ghost` | Icon-only or low-priority |
| `destructive` | Delete, close, reject |

### `Input`
40px height. Always pair with a `<label>` for accessibility.

```tsx
<label htmlFor="bid">Bid Amount</label>
<Input id="bid" type="number" placeholder="Enter amount" />
```

### `Card` / `CardHeader` / `CardContent` / `CardFooter`
Use for all grouped content blocks.

```tsx
<Card>
  <CardHeader><CardTitle>Auction Summary</CardTitle></CardHeader>
  <CardContent>...</CardContent>
  <CardFooter>...</CardFooter>
</Card>
```

### `Badge`
Use for status indicators and metadata tags.

| Variant | Use when |
| :--- | :--- |
| `default` | OPEN, active, primary status |
| `success` | Completed, approved, confirmed |
| `warning` | Closing soon, expiring |
| `destructive` | Closed, rejected, error |
| `secondary` | Neutral/muted status |
| `coffee` | Product category, brand accent |

### `Avatar` / `UserAvatar`
Always use `UserAvatar` (wrapper in `src/components/domain/user/`) rather than raw shadcn `Avatar`.

```tsx
<UserAvatar src={avatarUrl} name="Samuel A." size="md" />
```

### `EmptyState`
For all zero-content sections.

```tsx
<EmptyState
  iconName="inbox"
  title="No auctions yet"
  description="Create your first auction to get started."
  action={<Button>Create Auction</Button>}
/>
```

### `LoadingState`
For all loading placeholder sections. Prefer `type="card"` for grids, `type="list"` for rows.

```tsx
<LoadingState type="card" count={6} />
<LoadingState type="list" count={4} />
<LoadingState type="spinner" />
```

---

## Domain Components

### Auction Domain (`src/components/domain/auction/`)

| Component | Purpose |
| :--- | :--- |
| `AuctionCard` | Feed-level auction card |
| `AuctionStatusBadge` | OPEN / CLOSING / CLOSED badge |
| `BidItem` | Single bid row with bidder identity |
| `AuctionCountdown` | Circular timer, phase-aware |
| `BidComposer` | Bid input form |
| `ScheduledPanel` | Pre-auction info panel |
| `ClosedPanel` | Post-auction result panel |
| `RevealPanel` | Reveal phase UI |
| `AuctionOwnerActions` | Close / Reveal / Report buttons |
| `BidHistoryList` | List of bids with empty/loading states |
| `AuctionDetailHeader` | Title + badges + seller row |
| `AuctionMetaList` | Metadata grid (category, dates, etc.) |

### Profile Domain (`src/components/domain/profile/`)

| Component | Purpose |
| :--- | :--- |
| `ProfileSummaryCard` | Avatar + name + stats + actions |
| `RatingSummaryCard` | Star rating display |
| `ProfileActions` | Edit / Follow / Unfollow buttons |
| `ProfileMetaList` | Semantic dl/dt/dd metadata list |

### Follow Domain (`src/components/domain/follow/`)

| Component | Purpose |
| :--- | :--- |
| `FollowUserRow` | User row with follow/unfollow action |
| `FollowRequestRow` | Pending request with approve/reject |
| `FollowersList` | Full followers list |
| `FollowingList` | Full following list |

### Notification Domain (`src/components/domain/notification/`)

| Component | Purpose |
| :--- | :--- |
| `NotificationItem` | Single notification row |
| `NotificationsList` | Grouped (unread/read) list |

---

## Page Composition Pattern

Every page should follow this layer pattern:

```
PageShell                          ← background, min-height, flex
  Header                           ← global navigation
  PageContainer                    ← max-width, padding, gap
    PageHeader (title, actions)    ← page heading
    PageSection                    ← thematic content block
      Card                         ← data group
        [Domain Components]        ← specific content
    PageSection                    ← another block
  Footer
```

---

## Do Not Patterns

```
❌ <div className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
✅ <Card><CardContent>...</CardContent></Card>

❌ <div className="animate-pulse h-12 w-full bg-slate-200 rounded-lg" />
✅ <LoadingState type="list" />

❌ <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
✅ <UserAvatar name="..." size="md" />

❌ <button className="px-4 py-2 bg-primary text-white rounded-lg font-bold ...">
✅ <Button>...</Button>
```
