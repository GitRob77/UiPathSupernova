# Dashboard Layouts & Grid Systems

## Layout Templates

### 1. Analytics Overview (2+3 grid)
```
┌──────────────────┬──────────────────┐
│   Big Line Chart (span 2)           │
├────────┬─────────┴──────┬───────────┤
│ KPI 1  │ KPI 2          │  KPI 3    │
├────────┴────────┬───────┴───────────┤
│ Bar Chart       │ Donut Chart       │
└─────────────────┴───────────────────┘
```
```css
.dashboard {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: auto;
  gap: 20px;
}
.chart-wide { grid-column: span 3; }
.chart-half { grid-column: span 1; }
.chart-two-thirds { grid-column: span 2; }
```

### 2. Financial Dashboard (sidebar + main)
```
┌──────────────┬──────────────────────┐
│              │  Large Area Chart     │
│  KPI Stack   ├──────────┬───────────┤
│  (sidebar)   │ Bar      │ Donut     │
│              ├──────────┴───────────┤
│              │  Table / Timeline    │
└──────────────┴──────────────────────┘
```
```css
.dashboard {
  display: grid;
  grid-template-columns: 260px 1fr;
  gap: 20px;
}
.sidebar { display: flex; flex-direction: column; gap: 16px; }
.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.main-wide { grid-column: span 2; }
```

### 3. Compact Widget Grid (equal tiles)
```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
@media (max-width: 600px)  { grid-template-columns: 1fr; }
```

### 4. Map + Stats Layout (world map centered)
```
┌──────┬──────┬──────┬──────┐
│ KPI  │ KPI  │ KPI  │ KPI  │
├──────┴──────┴──────┴──────┤
│    World Map (full width)  │
├──────────────┬─────────────┤
│ List / Table │ Chart       │
└──────────────┴─────────────┘
```

---

## Card Sizing Conventions

| Card Size | Width | Height | Best For |
|---|---|---|---|
| Micro KPI | ~180px | ~120px | Single number + label |
| Small | ~260px | ~200px | Sparkline, pie |
| Medium | ~400px | ~280px | Line, bar chart |
| Large | ~640px | ~360px | Complex charts |
| Full-width | 100% | ~320px | Timeline, multi-line |
| Hero | 100% | ~480px | Flagship chart |

---

## Header Pattern

```html
<header class="dash-header">
  <div>
    <h1 class="dash-title">Analytics Overview</h1>
    <span class="dash-subtitle">August 2024 · Monthly</span>
  </div>
  <div class="dash-controls">
    <button class="btn-filter active">Monthly</button>
    <button class="btn-filter">Quarterly</button>
    <button class="btn-filter">Annual</button>
  </div>
</header>
```
```css
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}
.dash-title { font-size: 1.5rem; font-weight: 700; color: #fff; }
.dash-subtitle { font-size: 0.8rem; color: rgba(255,255,255,0.4); margin-top: 4px; display: block; }
.btn-filter {
  padding: 6px 16px; border-radius: 20px; font-size: 0.8rem;
  background: transparent; color: rgba(255,255,255,0.4);
  border: 1px solid rgba(255,255,255,0.1); cursor: pointer;
  transition: all 0.2s;
}
.btn-filter.active {
  background: rgba(255,61,154,0.15);
  border-color: rgba(255,61,154,0.4);
  color: #FF3D9A;
}
```

---

## Legend Patterns

### Inline legend (above/below chart)
```html
<div class="chart-legend">
  <span class="legend-item"><i style="background:#FF3D9A"></i> Revenue</span>
  <span class="legend-item"><i style="background:#7B5EA7"></i> Expenses</span>
</div>
```
```css
.chart-legend { display: flex; gap: 20px; margin-bottom: 16px; }
.legend-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: rgba(255,255,255,0.6); }
.legend-item i { width: 10px; height: 10px; border-radius: 2px; flex-shrink: 0; }
```

### Sidebar legend (right of donut)
```html
<div class="donut-layout">
  <canvas id="donut" width="200" height="200"></canvas>
  <ul class="donut-legend">
    <li><span class="dot" style="background:#FF3D9A"></span> Category A <strong>42%</strong></li>
    <li><span class="dot" style="background:#7B5EA7"></span> Category B <strong>31%</strong></li>
  </ul>
</div>
```
```css
.donut-layout { display: flex; align-items: center; gap: 24px; }
.donut-legend { list-style: none; display: flex; flex-direction: column; gap: 12px; }
.donut-legend li { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: rgba(255,255,255,0.7); }
.donut-legend strong { margin-left: auto; color: #fff; font-weight: 600; }
.dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
```

---

## Responsive Rules

```css
/* Collapse to 2 columns at 1024px */
@media (max-width: 1024px) {
  .dashboard { grid-template-columns: 1fr 1fr; }
  .chart-wide { grid-column: span 2; }
}

/* Stack to 1 column at 640px */
@media (max-width: 640px) {
  .dashboard { grid-template-columns: 1fr; }
  .chart-wide { grid-column: span 1; }
  body { padding: 16px; }
}
```

---

## Loading States

```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255,255,255,0.04) 0%,
    rgba(255,255,255,0.09) 50%,
    rgba(255,255,255,0.04) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```
