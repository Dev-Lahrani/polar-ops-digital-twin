# POLAR-OPS — Antarctic Station Operations Dashboard (v0 Redesign Prompt)

## Project Context

This is a **Next.js 14 App Router** dashboard for monitoring and simulating failures at two Indian Antarctic research stations: **Bharati** and **Maitri**. The app has a working backend engine (TypeScript simulation math, data files, types) that must NOT change. You are redesigning ONLY the frontend UI — pages and components.

**Stack**: Next.js 14, TypeScript, Tailwind CSS, Recharts, Radix UI (Slider, Dialog, DropdownMenu), lucide-react icons, shadcn-style utility classes.

**Fonts**: `JetBrains Mono` (headings, metric values, monospace data), `Inter` or `system-ui` (body text). Load JetBrains Mono from Google Fonts.

---

## Design System

### Color Palette
- **Background**: `#0a0a0f` (deep navy-black), pages use `min-h-screen`
- **Card surfaces**: `#111827` (slate-900) with `border border-slate-700/50 rounded-2xl`
- **Elevated surfaces** (modals, drawers): `#1a1f2e` with `border-slate-600/50`
- **Primary accent**: `#58a6ff` (blue) — active states, links, selected items, SVG highlights
- **Secondary accent**: `#3fb950` (green) — nominal/success states
- **Text primary**: `#e6edf3` (slate-100)
- **Text secondary**: `#8b949e` (slate-400)
- **Text muted**: `#484f58` (slate-500)
- **Border subtle**: `rgba(148, 163, 184, 0.08)` — card separators
- **Border active**: `rgba(88, 166, 255, 0.3)` — focused/selected states

### Risk Level Colors (use consistently everywhere)
| Level | Color | Hex |
|-------|-------|-----|
| NOMINAL | Green | `#22c55e` |
| CAUTION | Yellow | `#eab308` |
| WARNING | Orange | `#f97316` |
| CRITICAL | Red | `#ef4444` |
| EMERGENCY | Dark Red | `#dc2626` |

### Domain Colors (for cascade/simulation visualizations)
| Domain | Color |
|--------|-------|
| power | `#f97316` (orange) |
| climate | `#06b6d4` (cyan) |
| water | `#3b82f6` (blue) |
| comms | `#a855f7` (purple) |
| fuel | `#eab308` (yellow) |
| habitat | `#22c55e` (green) |
| science | `#ec4899` (pink) |
| safety | `#ef4444` (red) |
| overall | `#64748b` (slate) |

### Typography
- **Page titles**: `text-2xl font-bold tracking-tight text-slate-100` (JetBrains Mono)
- **Section headings**: `text-lg font-semibold text-slate-200` (JetBrains Mono)
- **Metric values**: `text-3xl font-mono font-bold` (JetBrains Mono) — color matches risk level
- **Metric labels**: `text-xs uppercase tracking-widest text-slate-400` (Inter)
- **Body text**: `text-sm text-slate-300` (Inter)
- **Small labels**: `text-xs text-slate-400` (JetBrains Mono)
- **Badges/pills**: `text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full`

### Card Pattern
Every card follows this pattern:
```
bg-[#111827] border border-slate-700/50 rounded-2xl p-6
  [optional] hover:border-slate-600/50 transition-colors duration-200
```

### Button Pattern
- Primary: `bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors`
- Secondary: `bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600/50 px-4 py-2 rounded-xl text-sm`
- Ghost: `text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg px-3 py-2`
- Danger: `bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30`

### Animations
- `flowDash`: SVG dash-offset animation for flowing connection lines (2s linear infinite)
- `pulse-glow`: subtle pulsing glow on active/selected elements (2s ease-in-out infinite)
- `flash-critical`: flash red background (1s ease-in-out, 3 iterations)
- `fade-in`: `opacity-0 to opacity-100, translate-y-2 to translate-y-0` (0.3s ease-out)

---

## Layout & Navigation

### Sidebar Navigation (Left)
- **Fixed left sidebar**, `w-60` expanded / `w-16` collapsed
- Background: `bg-[#0f1218]` with `border-r border-slate-800/50`
- Toggle button at top: chevron icon that rotates on collapse
- **6 nav items** with lucide-react icons:
  1. 🏠 Mission Control (`/`) — `LayoutDashboard` icon
  2. 🖥️ Station Twin (`/station/bharati`) — `Radio` icon
  3. ⚡ Simulator (`/simulator`) — `SlidersHorizontal` icon
  4. 🔗 Failure Cascade (`/cascade`) — `GitBranch` icon
  5. 📦 Resources (`/resources`) — `Package` icon
  6. 🚢 Resupply (`/resupply`) — `Truck` icon
- Active item: `bg-blue-600/10 text-blue-400 border-l-2 border-blue-500`
- Inactive: `text-slate-400 hover:text-slate-200 hover:bg-slate-800/30`
- Collapsed: only show icons, tooltip on hover
- Station selector at bottom of sidebar: two small cards for Bharati/Maitri with risk level dot

### Main Content Area
- `ml-60` when sidebar expanded, `ml-16` when collapsed
- `p-6` padding
- Max width: full, with cards flowing responsively
- Top bar (optional): station name, risk badge, last updated time

---

## Page 1: Mission Control (`/`)

**Purpose**: Executive overview of both stations at a glance.

### Layout
- **Top section**: Page title "Mission Control" with station selector tabs (Bharati | Maitri) — tab-style toggle, not dropdown
- **Main grid**: 2-column on desktop (`grid grid-cols-1 lg:grid-cols-2 gap-6`)

### Station Overview Card (one per station)
Each station gets a large card containing:
- **Header row**: Station name (JetBrains Mono bold), location text (e.g., "69°S, 76°E"), and a `RiskIndicator` badge (NOMINAL/CAUTION/etc.) with pulsing dot
- **Quick stats row** (4 items in a grid):
  - Temperature: value + "°C" + snowflake icon
  - Wind: value + " km/h" + wind icon
  - Crew: "{count}/{max}" + users icon
  - Next Resupply: "{days} days" + ship icon
- **Resource bars** (3 vertical progress bars side by side):
  - Fuel: progress bar colored by level, "X days remaining" label
  - Water: same pattern
  - Food: same pattern
  - Each bar: background `bg-slate-800`, fill color matches risk level, height 8px, rounded-full
- **Footer**: "View Station →" link (blue, navigates to `/station/{id}`)

### No simulation panel on this page — it's read-only overview.

---

## Page 2: Station Twin (`/station/[id]`)

**Purpose**: Deep-dive into a single station's systems, crew, and resources.

### Layout
- **Left column** (60%): Interactive SVG station diagram
- **Right column** (40%): Detail panels that change based on selected subsystem

### SVG Station Diagram (Left)
- Full-width SVG with dark background (`#0d1117`) and subtle grid pattern
- **8 subsystem modules** positioned on the diagram:
  - Fuel Depot (x:40, y:200, 120×80)
  - Generator (x:210, y:200, 140×80)
  - Habitat (x:380, y:180, 180×120) — largest, center
  - HVAC (x:400, y:40, 140×70)
  - Water Systems (x:600, y:40, 140×70)
  - Comms (x:420, y:-30, 100×55)
  - Science Lab (x:620, y:180, 140×80)
  - Emergency (x:400, y:360, 150×70)
- Each module: rounded rect with icon (emoji) + name, status-colored border, pulsing status dot in top-right
- **Connection lines** between modules: arrow-headed lines with labels ("fuel flow", "power", "heating", "water supply", "data link")
- Lines animate with `flowDash` animation (dashed, flowing direction)
- Line color: green when both endpoints nominal, orange when either is WARNING/CAUTION, red when either is CRITICAL/EMERGENCY
- **Click a module** to select it → blue highlight border, right panel shows details
- **Glow filter** on SVG for atmosphere

### Detail Panel (Right) — changes on subsystem selection
When a subsystem is selected, show:
- **Subsystem name + icon** (large)
- **Status badge** with risk level color
- **Load meter**: progress bar showing `loadPercent`
- **Details table**: key-value pairs from `subsystem.details` (rendered as rows with label in slate-400, value in slate-200)
- **Back to overview** button to deselect

When no subsystem selected, show:
- **Station stats**: Latitude, Longitude, Established year, Crew count
- **Weather card**: Temperature, Wind Speed with icons
- **Resource summary**: Fuel/Water/Food bars (same as Mission Control but horizontal)
- **Quick actions**: Buttons to run simulation or view cascade

---

## Page 3: Simulator (`/simulator`)

**Purpose**: What-if scenario simulator — user adjusts inputs, sees cascade effects.

### Layout
- **Left panel** (35%): Simulation input controls (sticky on scroll)
- **Right panel** (65%): Simulation results

### Simulation Input Panel (Left)
- **Title**: "Simulation Controls" with reset button
- **Input sections** (each with label + value display + control):
  1. **Station**: Dropdown to select Bharati or Maitri
  2. **Failed Subsystem**: Dropdown listing all 8 subsystems + "None" option. When a subsystem is selected, a red warning badge appears
  3. **Generators Online**: Radix Slider (1-4), current value displayed, danger state (red) when ≤ 1
  4. **Temperature**: Radix Slider (-40°C to 0°C), current value displayed
  5. **Resupply Delay**: Radix Slider (0-30 days), current value displayed, caution state when > 7
  6. **Scientific Load**: Radix Slider (0-100%), current value displayed
- **Run Simulation** button: `bg-blue-600 hover:bg-blue-500`, full width, with play icon
- Each slider has: label, current value badge, danger/caution states when values are extreme
- Slider track: `bg-slate-700`, filled: `bg-blue-500`, thumb: `bg-white border-2 border-blue-500`

### Simulation Results (Right)
When simulation is run, show results in this order:

**1. Before/After Comparison Cards** (`MetricsComparison`)
- 4 cards in a 2×2 grid:
  - Generator Load: before → after (value + unit, up/down arrow)
  - Fuel Burn Rate: before → after
  - Days to Depletion: before → after
  - Resupply Gap: before → after
- Each card: colored arrow (green if improved, red if worsened), delta value

**2. Cascade Chain** (`CascadeStep[]`)
- Vertical timeline/stepper visualization
- Each step has:
  - Left: colored circle (domain color) with step number
  - Left border: colored bar matching domain
  - Content: variable name, fromValue → toValue with unit
  - Description text
  - Optional: equation/explanation in a collapsible section
- Steps connected by vertical line
- Colors: step severity determines left border (green/yellow/orange/red)

**3. Mitigation List**
- Title: "Recommended Mitigations"
- List of actionable items, each with:
  - Priority badge (CRITICAL/HIGH/MEDIUM/LOW)
  - Action text
  - Impact text
  - Category tag

**4. Resource Depletion Chart** (`ResourceTimelinePoint[]`)
- Recharts `AreaChart` (stacked area)
- X-axis: Days (0 to resupply day)
- Y-axis: Resource percentage (0-100%)
- Three colored areas: Fuel (yellow), Water (blue), Food (green)
- Reference line at `nextResupplyDay` vertical dashed line labeled "Resupply"
- Custom tooltip showing exact values
- Smooth curves (`type: "monotone"`)

**5. Calculation Details**
- Collapsible "View Calculation Details" section
- Opens a Radix Dialog showing step-by-step math
- Each step: equation, explanation, domain badge

---

## Page 4: Failure Cascade (`/cascade`)

**Purpose**: Visualize 6 preset disaster scenarios — see how failures propagate.

### Layout
- **Top**: Page title "Failure Cascade Scenarios"
- **Scenario selector**: 6 preset scenario buttons in a grid (3×2)
- **Main content**: Selected scenario's cascade visualization

### 6 Preset Scenarios
1. 🔴 Generator Failure — "What if a generator goes offline during peak demand?"
2. ❄️ Extreme Cold — "Temperature drops to -38°C overnight"
3. 📡 Comms Blackout — "Communications antenna damaged by blizzard"
4. 🚢 Resupply Delay — "Supply ship delayed by 15 days"
5. 💧 Water System Freeze — "Water pipes freeze and burst"
6. 🔥 Fuel Contamination — "Fuel supply contaminated with ice crystals"

Each scenario button:
- Icon + title on top, description below
- Selected: `border-blue-500 bg-blue-500/10`
- Unselected: `border-slate-700 hover:border-slate-600 bg-slate-900/50`

### Cascade Visualization (after selection)
- **Full cascade chain**: Same vertical stepper as Simulator page but larger, more detailed
- **Before/After metrics comparison** at the top
- **Risk indicator** showing overall risk level change
- **Domain breakdown**: Show which domains are affected with colored badges
- **SVG flow diagram** (optional): Show propagation path as animated SVG with domain-colored nodes

---

## Page 5: Resources (`/resources`)

**Purpose**: Detailed resource monitoring with timeline projections and comparison mode.

### Layout
- **Top bar**: Title "Resource Intelligence" + Comparison toggle button + Station selector
- **Main content**: Resource cards + Depletion chart

### Resource Cards (3 cards in a row)
Each resource card (Fuel/Water/Food):
- **Header**: Icon + Resource name + Status badge
- **Large value**: "X days remaining" (big JetBrains Mono text, color by risk)
- **Progress bar**: Shows current level vs capacity (horizontal, rounded)
- **Details section**:
  - Current amount (litres/kg)
  - Capacity
  - Daily consumption rate
  - Burn rate trend (if available)
- **Status coloring**: Card border color matches risk level

### Comparison Toggle
- Toggle button: "Compare Before/After"
- When ON: Show dual resource cards (before on left, after on right) with delta indicators
- When OFF: Single set of cards

### Depletion Chart (full width below cards)
- Same Recharts AreaChart as Simulator page
- X-axis: Days, Y-axis: Percentage
- Three stacked areas: Fuel, Water, Food
- Reference line at resupply day
- Toggle to switch between percentage view and absolute values (litres/kg)
- Custom tooltip

---

## Page 6: Resupply (`/resupply`)

**Purpose**: Prioritize what resources to resupply, compare with delayed scenarios.

### Layout
- **Top**: Title "Resupply Priority Matrix" + Delay toggle
- **Left** (50%): Priority ranking list
- **Right** (50%): Priority analysis details + delay comparison

### Priority Ranking List
- Sorted list of 3 resources (Fuel, Water, Food) by priority score (highest first)
- Each item:
  - Rank number (#1, #2, #3)
  - Icon + Resource name
  - Priority level badge (CRITICAL/HIGH/MEDIUM/LOW)
  - Animated progress bar (width = priorityScore, animated on mount)
  - Score value displayed
  - Rationale text
- Items have subtle entrance animation (fade-in + slide-up, staggered)

### Delay Comparison
- Toggle: "Show Delay Impact (+7 days)"
- When ON: Show side-by-side comparison of resupply priorities with and without delay
- Each resource shows: normal priority score vs delayed priority score
- Visual indicators for score changes

### Priority Analysis Details (right panel)
- **Selected resource details** (click a resource to see more):
  - Current amount vs required amount
  - Weight per unit
  - Rationale for priority
  - Recommended action
  - Impact if not resupplied in time

---

## Data Structures (DO NOT MODIFY)

All types are defined in `src/types/index.ts`. Key interfaces:

```typescript
type RiskLevel = "NOMINAL" | "CAUTION" | "WARNING" | "CRITICAL" | "EMERGENCY";

interface Station {
  id: string; // "bharati" | "maitri"
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  established: number;
  crewCount: number;
  crewMax: number;
  riskLevel: RiskLevel;
  resources: { power: number; fuel: number; water: number; food: number };
  temperature: number;
  windSpeed: number;
  subsystems: Subsystem[];
  // ... optional fields
}

interface Subsystem {
  id: string;
  name: string;
  type: string;
  status: RiskLevel;
  loadPercent: number;
  details: Record<string, string>;
  icon: string; // emoji
}

interface SimulationInput {
  stationId?: string;
  failedSubsystem?: string;
  generatorsOnline?: number;
  temperatureC?: number;
  crewCount?: number;
  scientificLoadPercent?: number;
  resupplyDelayDays?: number;
}

interface SimulationResult {
  steps: CascadeStep[];
  before: StationMetrics;
  after: StationMetrics;
  mitigations: (Mitigation | string)[];
  metricsComparison?: MetricsComparison;
  resourceTimeline: ResourceTimelinePoint[];
  nextResupplyDay: number;
}

interface CascadeStep {
  step: number;
  domain: Domain;
  variable: string;
  fromValue: string;
  toValue: string;
  unit?: string;
  severity: RiskLevel | "info" | "warning" | "critical" | "INFO";
  description: string;
  explanation?: string;
  equation?: string;
}

interface ResupplyItem {
  id: string;
  name: string;
  currentAmount: number;
  requiredAmount: number;
  unit: string;
  priorityScore: number;
  priorityLevel: PriorityLevel;
  rationale: string;
  icon: string;
  weightKg: number;
}
```

### Engine Functions (DO NOT MODIFY)
```typescript
import { stations } from "@/data/stations"; // Station[]
import { runSimulation } from "@/engine/simulation"; // (input: SimulationInput) => SimulationResult
import { calculateResupplyPriority } from "@/engine/resupply"; // (stationId: string) => ResupplyItem[]
```

---

## Component Catalog

### Reusable Components
1. **RiskIndicator** — Badge with pulsing dot, props: `level: RiskLevel`, `size: "sm"|"md"|"lg"`
2. **StatusGauge** — Icon + label + large value + progress bar, props: `icon, label, value, unit, riskLevel, progress`
3. **ResourceCard** — Resource status card with bar, props: `name, current, capacity, unit, riskLevel, icon, daysRemaining`
4. **CascadeChain** — Vertical stepper, props: `steps: CascadeStep[]`
5. **CascadeVisualizer** — Full cascade view with metrics, props: `result: SimulationResult`
6. **DepletionChart** — Recharts area chart, props: `timeline: ResourceTimelinePoint[], nextResupplyDay: number, comparison?: {before, after}`
7. **ResupplyPriority** — Priority list with bars, props: `items: ResupplyItem[]`
8. **SimulationPanel** — Input controls, props: `onRun: (input: SimulationInput) => void`
9. **SimulationResults** — Results display, props: `result: SimulationResult`
10. **StationSvg** — Interactive SVG diagram, props: `subsystems: Subsystem[], selectedId, onSelect`
11. **SubsystemNode** — SVG module node, props: `subsystem, position, size, isSelected, onClick`
12. **CalculationDrawer** — Dialog showing math steps, props: `steps: CascadeStep[]`
13. **StationCard** — Station overview card, props: `station: Station`

---

## Interactions & State

### Global State
- **Sidebar collapsed/expanded**: Managed by `SidebarProvider` context (stored in React state)
- **Active station**: Current station ID (default: "bharati")
- **Selected subsystem** (Station Twin page only): `string | null`

### Simulation Flow
1. User adjusts inputs in SimulationPanel
2. User clicks "Run Simulation"
3. Panel calls `onRun(input)` which calls `runSimulation(input)`
4. Results displayed in SimulationResults with animations
5. Cascade chain animates step-by-step (staggered fade-in)

### Page Transitions
- Use `next/link` for navigation
- Pages should have subtle fade-in on mount (CSS `animate-fade-in`)

### Responsive
- Desktop-first layout (sidebar + main content)
- On tablet: sidebar collapses automatically
- On mobile: sidebar becomes bottom tab bar or hamburger menu
- Cards stack vertically on smaller screens

---

## What NOT to Change

- `src/types/index.ts` — all type definitions
- `src/data/stations.ts` — station data
- `src/engine/simulation.ts` — simulation math
- `src/engine/resupply.ts` — resupply calculator
- `src/lib/utils.ts` — utility functions
- `tailwind.config.ts` — Tailwind configuration
- `tsconfig.json` — TypeScript configuration
- `next.config.mjs` — Next.js configuration
- `package.json` — dependencies

---

## File Structure (Expected Output)

```
src/
├── app/
│   ├── layout.tsx          # Root layout with LayoutShell, fonts
│   ├── page.tsx            # Mission Control
│   ├── globals.css         # Design system CSS vars, animations
│   ├── simulator/
│   │   └── page.tsx        # What-If Simulator
│   ├── cascade/
│   │   └── page.tsx        # Failure Cascade Scenarios
│   ├── resources/
│   │   └── page.tsx        # Resource Intelligence
│   ├── resupply/
│   │   └── page.tsx        # Resupply Priority
│   └── station/
│       └── [id]/
│           └── page.tsx    # Station Digital Twin
├── components/
│   ├── nav-sidebar.tsx     # Left navigation
│   ├── layout-shell.tsx    # Layout wrapper
│   ├── simulation-panel.tsx
│   ├── simulation-results.tsx
│   ├── cascade-chain.tsx
│   ├── cascade-visualizer.tsx
│   ├── calculation-drawer.tsx
│   ├── depletion-chart.tsx
│   ├── resource-card.tsx
│   ├── resupply-priority.tsx
│   ├── risk-indicator.tsx
│   ├── status-gauge.tsx
│   ├── station-card.tsx
│   ├── station-svg.tsx
│   └── subsystem-node.tsx
├── types/
│   └── index.ts            # DO NOT MODIFY
├── data/
│   └── stations.ts         # DO NOT MODIFY
├── engine/
│   ├── simulation.ts       # DO NOT MODIFY
│   └── resupply.ts         # DO NOT MODIFY
└── lib/
    └── utils.ts            # DO NOT MODIFY
```

---

## Quality Checklist

Before delivering, ensure:
- [ ] All 6 pages render without errors
- [ ] All 6 routes work with Next.js App Router
- [ ] Risk level colors are consistent across all components
- [ ] Domain colors match the palette above
- [ ] Fonts load correctly (JetBrains Mono for headings/data, Inter for body)
- [ ] Sidebar navigation works with collapse/expand
- [ ] Station selector works on all relevant pages
- [ ] Simulation inputs control the engine correctly
- [ ] Cascade chain animates properly
- [ ] Depletion chart renders with correct data
- [ ] Resupply priority bars animate on mount
- [ ] SVG station diagram renders with correct subsystem positions
- [ ] Clicking subsystems in SVG shows details
- [ ] Comparison toggle works on Resources and Resupply pages
- [ ] No console errors
- [ ] TypeScript compiles cleanly (`npm run build`)
- [ ] Dark theme is consistent — no light mode elements
- [ ] Responsive on tablet and mobile
