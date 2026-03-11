# Component Guidelines
**Ankuaru — Frontend Component Architecture**

---

## Overview

This document defines the rules and conventions for building, extending, and consuming UI components in the Ankuaru frontend codebase.

The component system is organized into three layers:

```
UI Primitives       →  base building blocks (Button, Input, Card, Badge)
Layout Primitives   →  page scaffolding (PageShell, PageContainer, PageHeader)
Domain Components   →  business-specific UI (AuctionCard, ProfileSummaryCard)
```

---

## Layer 1 — UI Primitives

**Location:** `components/ui/`

**Rules:**
- UI primitives are **domain-agnostic** — they don't know about auctions, profiles, or bids
- They accept only HTML-level or styling props (variants, sizes, classNames)
- They must use design tokens exclusively — never raw Tailwind color classes
- Every primitive must be accessible (proper semantics, aria, keyboard support)

**When to create a new UI primitive:**
- You have a pattern that repeats across 3+ domain components with no domain-specific logic
- It is purely visual/structural with no business concept attached
- Examples: `Tooltip`, `Tabs`, `Dropdown`, `Modal`, `Popover`

**When NOT to create a new UI primitive:**
- The pattern is specific to one domain (use a domain component instead)
- It's a one-off layout needed only on one page

---

## Layer 2 — Layout Primitives

**Location:** `components/layout/`

**Rules:**
- Every page must use `PageShell` as its outer wrapper
- Every page must use `PageContainer` as its inner content wrapper
- `PageHeader` must be used for page-level headings — never raw `<h1>` inside a card
- `PageSection` groups thematically related blocks

**Enforced structure:**
```tsx
// This is the required pattern for every page
export default function MyPage() {
  return (
    <PageShell>
      <Header />
      <PageContainer>
        <PageHeader title="Page Title" />
        <PageSection>
          {/* content */}
        </PageSection>
      </PageContainer>
    </PageShell>
  )
}
```

**Container width:** Max `1280px`. Do not add one-off `max-w-*` constraints inside pages. The container handles it.

---

## Layer 3 — Domain Components

**Location:** `src/components/domain/`

**Sub-folders:**
- `auction/` — auction cards, status badges, bid items, detail components
- `auction/detail/` — sidebar, countdown, composer, phase panels
- `profile/` — profile summary, rating, actions, meta list
- `follow/` — user rows, request rows, follower/following lists
- `notification/` — notification item and list
- `user/` — user avatar wrapper
- `shared/` — cross-domain reusable items (if needed)

**Rules for domain components:**

1. **Presentational by default** — Domain components should receive data through props and render UI. They should not call React Query hooks directly unless there is a clear justification.

2. **Container/Presentational split:** For complex features (example: BiddingSidebar):
   - The container component fetches data, manages state, handles mutations
   - Presentational components receive props and only render

3. **Single responsibility** — Each component should do one thing. If a component is > 200 lines, consider splitting it.

4. **No inline business logic** — Bid validation, auth checks, and GraphQL calls belong in hooks or container components. Presentational components should only make rendering decisions.

**When to create a new domain component:**
- A UI pattern is specific to a business concept (auction, bid, profile)
- The same pattern is used in 2+ places with domain-specific data
- Splitting improves testability and readability

**When NOT to create a new domain component:**
- It's trivially simple — just use a primitive with props instead
- It's needed in only one place and is < 30 lines — keep it inline

---

## Using Design Tokens Correctly

### Colors — always use semantic tokens

```tsx
// ✅ Correct
<div className="bg-card border-border text-foreground" />
<div className="text-muted-foreground" />
<div className="bg-primary text-primary-foreground" />

// ❌ Wrong — these bypass the token system and break dark mode
<div className="bg-white text-gray-900" />
<div className="bg-slate-900 text-slate-100" />
<div className="bg-green-700 text-white" />
```

### Spacing — use the 4px grid

```tsx
// ✅ Predictable, consistent gaps
<div className="flex flex-col gap-4">  // 16px — standard section gap
<div className="flex flex-col gap-6">  // 24px — card content gap
<div className="p-6">                  // 24px — standard card padding

// ❌ arbitrary padding inside components
<div className="p-7 mt-5 mb-3">
```

### Typography — use heading hierarchy

```
h1 — PageHeader title only (one per page)
h2 — Section titles (inside PageSection)
h3 — Card titles (inside CardHeader)
p  — Body text
span — Inline metadata
```

---

## Accessibility Rules

All components must follow these rules:

### Buttons
- Use `<Button>` or `<button>` — never `<div onClick>`
- Icon-only buttons must have `aria-label`
- Disabled buttons must have `disabled` attribute (not just opacity styling)

```tsx
// ✅
<Button size="icon" aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// ❌
<div onClick={close} className="cursor-pointer">
  <X />
</div>
```

### Forms
- Every `<Input>` must have an associated `<label htmlFor="...">` or `aria-label`
- Error messages must be linked with `aria-describedby`

### Lists
- Use `<ul>/<li>` for true lists of items
- Use `<dl>/<dt>/<dd>` for key/value pairs (see `ProfileMetaList`)
- Use `role="list"` when needed with `<div>` structures

### Interactive components
- Expandable/collapsible controls must use `aria-expanded`
- Modals must trap focus and return focus on close
- Keyboard navigation must work on tabs, dropdowns, and modals

### Icons
- Decorative icons must have `aria-hidden="true"`
- Icons that carry meaning must have a visually hidden label or `title`

---

## Naming Conventions

| Element | Convention | Example |
| :--- | :--- | :--- |
| Primitive files | `kebab-case.tsx` | `button.tsx`, `empty-state.tsx` |
| Domain files | `{domain}-{thing}.tsx` | `auction-card.tsx`, `bid-item.tsx` |
| Component exports | PascalCase | `AuctionCard`, `BidItem` |
| Props interfaces | `{Name}Props` | `AuctionCardProps` |
| Util functions | camelCase | `getInitials`, `formatTimestamp` |
| Barrel files | `index.ts` | One per domain folder |

---

## When to Add a New shadcn Component

1. Run `npx shadcn@latest add <component-name>`
2. Check that the generated file in `components/ui/` uses `--primary`, `--border`, `--ring` (not hardcoded colors)
3. If token mismatches exist, reconcile with `globals.css` tokens BEFORE using it in domain components
4. Add to `components/ui/` — **do not move shadcn components elsewhere**

---

## File Structure Reference

```
ankuaru/
├── app/                          # Next.js routes
│   ├── globals.css               # ← Design tokens (source of truth)
│   ├── feed/
│   ├── auction/[id]/
│   ├── profile/
│   └── notifications/
├── components/
│   ├── ui/                       # ← Layer 1: UI Primitives
│   └── layout/                   # ← Layer 2: Layout Primitives
├── src/
│   └── components/
│       └── domain/               # ← Layer 3: Domain Components
│           ├── auction/
│           ├── profile/
│           ├── follow/
│           ├── notification/
│           └── user/
├── hooks/                        # React Query hooks
├── stores/                       # Zustand stores
├── lib/                          # Utilities, API client
└── docs/
    ├── design-foundation.md      # Brand direction and raw token decisions
    ├── design-system.md          # Full system reference
    └── component-guidelines.md  # This file
```

---

## Quick Reference — Which Component to Use

| Situation | Use |
| :--- | :--- |
| Show an auction in a list | `AuctionCard` |
| Show auction status | `AuctionStatusBadge` |
| Show a bid entry | `BidItem` |
| Show user identity anywhere | `UserAvatar` |
| Show seller on profile | `ProfileSummaryCard` |
| Show star rating | `RatingSummaryCard` |
| Show a notification | `NotificationItem` |
| Show followers list | `FollowersList` |
| Show pending follow requests | `FollowRequestRow` |
| Show empty section | `EmptyState` |
| Show loading section | `LoadingState` |
| Wrap a page | `PageShell + PageContainer` |
| Show a page heading | `PageHeader` |
| Group page content | `PageSection` |
| Group data | `Card + CardContent` |
| Call-to-action button | `<Button>` |
| Text input | `<Input>` |
| Status label | `<Badge variant="...">` |
