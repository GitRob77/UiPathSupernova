---
name: charts
description: >
  Create stunning, production-quality data visualizations and charts — including dashboards,
  infographics, and individual chart components. Use this skill whenever the user wants to
  visualize data of any kind (bar charts, line charts, area charts, donut/pie charts, radar
  charts, scatter plots, bubble charts, candlestick charts, world maps, radial gauges, dot
  matrix charts, timelines, or full dashboards with multiple charts). Also trigger for requests
  like "make this data visual", "show me a chart", "build a dashboard", "infographic", "data
  viz", or whenever the user pastes numbers or a table and wants them displayed visually.
  Always use this skill — even for a single simple chart.
---

# Charts Skill

Create beautiful, polished, production-quality data visualizations. The output should look like it came from a premium SaaS analytics product — never generic or default-styled.

## Quick Decision: Which Renderer?

| Situation | Use |
|---|---|
| Chart inside a prototype page | **Recharts** (React component, light theme) |
| Single interactive chart (standalone) | Chart.js (in HTML artifact) |
| Multiple charts / full dashboard (standalone) | Chart.js multi-canvas OR D3 |
| Static infographic / SVG diagram | SVG via Visualizer |
| Data is already in the prompt (small) | Inline HTML artifact with Chart.js |
| User says "React" or "component" | React artifact with Chart.js or Recharts |

**Default**: When creating charts for a prototype in this project, use **Recharts** with **apollo-wind tokens** and the **light theme**. For standalone artifacts outside the project, use HTML with Chart.js.

---

## In-Prototype Usage (Apollo-Prime)

When creating charts for a prototype page in this project, follow these conventions instead of the standalone HTML approach:

**Renderer:** Use **Recharts** (already in the project's tech stack via `@tanstack/react-table` peer). Import from `recharts`.

**Theme:** Use **light theme** colors from apollo-wind tokens. The project sets `light` class on `<body>`.
- Background: use `bg-background` or `bg-card` (apollo-wind tokens)
- Text: use `text-foreground`, `text-muted-foreground`
- Grid/borders: use `border-(--border-subtle)` or `hsl(var(--border))`
- Accent colors: use apollo-wind semantic tokens (`--color-info-text`, `--color-success-text`, `--color-error-text`, `--color-warning-text`) or Tailwind palette colors

**Component integration:**
- Wrap charts in apollo-wind `Card` components for consistent styling
- Use `StatusChip` for status indicators alongside charts
- Use the prototype's `mock-data/` directory for chart data
- Place chart components in the prototype's `components/` directory

**Do NOT** use the dark neon palettes (Neon Gradient, Ocean Dark) for in-prototype charts unless the user explicitly requests a dark theme.

---

## Step 1: Design Before Coding

Before writing any code, commit to a **theme** and **color palette**. Never use Chart.js defaults.

### Theme Selection

#### Dark Theme (preferred for dashboards & infographics)
- Background: `#0D0F1C` or `#0A0B14` (deep navy)
- Card surfaces: `#131629` or `#1A1D35`
- Border/grid lines: `rgba(255,255,255,0.06)`
- Text primary: `#FFFFFF`
- Text muted: `rgba(255,255,255,0.45)`

#### Light Theme (preferred for reports & business docs)
- Background: `#F4F5F9` or `#ECEDF5`
- Card surfaces: `#FFFFFF`
- Border/grid lines: `rgba(0,0,0,0.07)`
- Text primary: `#1A1A2E`
- Text muted: `rgba(0,0,0,0.45)`

### Signature Color Palettes

**Neon Gradient (dark)** — for dramatic dashboards:
```
Primary:   #FF3D9A  (hot pink)
Secondary: #7B5EA7  (purple)
Accent:    #00F5FF  (cyan)
Tertiary:  #FF8C42  (orange)
Positive:  #3DFFA0  (mint green)
Neutral:   #6C63FF  (violet)
```

**Corporate Vivid (light)** — for clean analytics:
```
Primary:   #FF2D78  (magenta-pink)
Secondary: #4A2FC1  (indigo)
Accent:    #8B5CF6  (violet)
Tertiary:  #F97316  (orange)
Positive:  #10B981  (emerald)
Neutral:   #6366F1  (periwinkle)
```

**Ocean Dark** — for financial / professional:
```
Primary:   #06B6D4  (cyan)
Secondary: #8B5CF6  (purple)
Accent:    #EC4899  (pink)
Tertiary:  #F59E0B  (amber)
Positive:  #34D399  (green)
Neutral:   #64748B  (slate)
```

Never use Chart.js's default blues and grays. Always override with one of the above or a custom palette.

---

## Step 2: Chart Type Recipes

### Bar / Column Chart
```javascript
{
  type: 'bar',
  data: {
    labels: [...],
    datasets: [{
      data: [...],
      backgroundColor: createGradient(ctx, '#FF3D9A', '#7B5EA7'),
      borderRadius: 8,        // ← always round bar tops
      borderSkipped: false,
      barThickness: 28,
    }]
  },
  options: {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#aaa' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: '#aaa' } }
    }
  }
}
```

### Line / Area Chart
```javascript
datasets: [{
  data: [...],
  borderColor: '#FF3D9A',
  borderWidth: 2.5,
  fill: true,
  backgroundColor: (ctx) => {
    const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255,61,154,0.35)');
    gradient.addColorStop(1, 'rgba(255,61,154,0)');
    return gradient;
  },
  tension: 0.45,              // ← smooth curves, never jagged
  pointRadius: 0,             // ← hide points on dense data
  pointHoverRadius: 6,
}]
```

### Donut / Pie Chart
```javascript
{
  type: 'doughnut',
  data: {
    labels: [...],
    datasets: [{
      data: [...],
      backgroundColor: ['#FF3D9A','#7B5EA7','#00F5FF','#FF8C42','#3DFFA0'],
      borderWidth: 0,         // ← no borders between segments
      hoverOffset: 8,
    }]
  },
  options: {
    cutout: '72%',            // ← large cutout for elegance
    plugins: {
      legend: { position: 'right', labels: { color: '#ccc', padding: 16 } }
    }
  }
}
// Add center label plugin for value display inside donut
```

### Radar Chart
```javascript
{
  type: 'radar',
  options: {
    scales: {
      r: {
        backgroundColor: 'rgba(123,94,167,0.08)',
        grid: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#ccc', font: { size: 12 } },
        ticks: { display: false },
        angleLines: { color: 'rgba(255,255,255,0.1)' }
      }
    },
    datasets: [{
      backgroundColor: 'rgba(255,61,154,0.25)',
      borderColor: '#FF3D9A',
      pointBackgroundColor: '#FF3D9A',
      borderWidth: 2,
    }]
  }
}
```

### Horizontal Bar Chart
```javascript
{ type: 'bar', options: { indexAxis: 'y', ... } }
// Use for rankings, comparisons, leaderboards
// barThickness: 20, borderRadius on left or right side
```

### Scatter / Bubble Chart
```javascript
{
  type: 'bubble',
  datasets: [{
    data: [{ x: 10, y: 20, r: 15 }, ...],
    backgroundColor: 'rgba(255,61,154,0.6)',
    borderColor: '#FF3D9A',
  }]
}
```

---

## Step 3: Visual Polish — Non-Negotiables

Apply ALL of these on every chart:

### Gradients
Always use `createLinearGradient` for fills. Flat colors look cheap.
```javascript
function createGradient(ctx, color1, color2, vertical = true) {
  const gradient = vertical
    ? ctx.createLinearGradient(0, 0, 0, 400)
    : ctx.createLinearGradient(0, 0, 400, 0);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
}
```

### Rounded Bars
Always set `borderRadius: 6-12` on bar charts. Set `borderSkipped: false` for fully rounded.

### Smooth Lines
Always use `tension: 0.4` or higher. Never use default jagged lines.

### Grid Lines
- Dark theme: `rgba(255,255,255,0.06)` — barely visible
- Light theme: `rgba(0,0,0,0.06)` — barely visible
- X-axis grid: almost always `display: false`

### Typography in Charts
```javascript
Chart.defaults.font.family = "'Inter', 'DM Sans', sans-serif";
Chart.defaults.color = '#9CA3AF';  // muted text
```

### Tooltips
```javascript
plugins: {
  tooltip: {
    backgroundColor: 'rgba(15,17,35,0.92)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 12,
    cornerRadius: 8,
    titleColor: '#fff',
    bodyColor: '#ccc',
    callbacks: {
      label: (ctx) => ` ${ctx.parsed.y.toLocaleString()}`
    }
  }
}
```

### Animations
```javascript
animation: {
  duration: 900,
  easing: 'easeOutQuart',
}
```

---

## Step 4: Card & Layout System

### Stat Card Pattern (KPI display)
```html
<div class="stat-card">
  <div class="stat-label">Total Revenue</div>
  <div class="stat-value">$2,831</div>
  <div class="stat-change positive">↑ 6.1%</div>
</div>
```
```css
.stat-card {
  background: #131629;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.07);
}
.stat-value {
  font-size: 2.4rem;
  font-weight: 700;
  color: #FF3D9A;
  letter-spacing: -0.03em;
}
.stat-change.positive { color: #3DFFA0; font-size: 0.85rem; }
.stat-change.negative { color: #FF5F6D; font-size: 0.85rem; }
```

### Dashboard Grid
```css
.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
  background: #0D0F1C;
  min-height: 100vh;
}
.chart-card {
  background: #131629;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255,255,255,0.07);
  box-shadow: 0 4px 24px rgba(0,0,0,0.3);
}
.chart-title {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255,255,255,0.5);
  margin-bottom: 16px;
}
```

### Glow Effects (dark theme only)
```css
/* Glowing chart cards */
.chart-card.highlight {
  border-color: rgba(255,61,154,0.3);
  box-shadow: 0 0 30px rgba(255,61,154,0.1), 0 4px 24px rgba(0,0,0,0.4);
}
/* Glowing stat numbers */
.stat-value {
  text-shadow: 0 0 20px rgba(255,61,154,0.5);
}
```

---

## Step 5: Full Boilerplate (Dark Dashboard)

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'DM Sans', 'Inter', system-ui, sans-serif;
    background: #0D0F1C;
    color: #fff;
    padding: 24px;
  }
  .dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
  .card {
    background: #131629;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid rgba(255,255,255,0.07);
  }
  .card-title {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 20px;
  }
  canvas { max-width: 100%; }
</style>
</head>
<body>
<div class="dashboard">
  <div class="card">
    <div class="card-title">Revenue Over Time</div>
    <canvas id="lineChart" height="200"></canvas>
  </div>
  <!-- more cards... -->
</div>
<script>
Chart.defaults.font.family = "'DM Sans', 'Inter', system-ui";
Chart.defaults.color = 'rgba(255,255,255,0.5)';

// Gradient helper
function makeGrad(ctx, c1, c2) {
  const g = ctx.createLinearGradient(0, 0, 0, 200);
  g.addColorStop(0, c1); g.addColorStop(1, c2); return g;
}

const lineCtx = document.getElementById('lineChart').getContext('2d');
new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{
      label: 'Revenue',
      data: [12000, 19000, 15000, 24000, 21000, 31000],
      borderColor: '#FF3D9A',
      borderWidth: 2.5,
      tension: 0.45,
      fill: true,
      backgroundColor: (ctx) => {
        const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 200);
        g.addColorStop(0, 'rgba(255,61,154,0.3)');
        g.addColorStop(1, 'rgba(255,61,154,0)');
        return g;
      },
      pointRadius: 0, pointHoverRadius: 6,
      pointHoverBackgroundColor: '#FF3D9A',
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(10,12,25,0.95)',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: 'rgba(255,255,255,0.35)' } },
      y: { grid: { color: 'rgba(255,255,255,0.06)' }, ticks: { color: 'rgba(255,255,255,0.35)' } }
    },
    animation: { duration: 900, easing: 'easeOutQuart' }
  }
});
</script>
</body>
</html>
```

---

## Step 6: Chart Type → Use Case Guide

| Chart Type | Best For | Avoid When |
|---|---|---|
| Line / Area | Trends over time, continuous data | Few data points (<4) |
| Bar (vertical) | Category comparison, rankings | Too many categories (>12) |
| Bar (horizontal) | Long labels, rankings | Showing time series |
| Donut | Part-to-whole, proportions | More than 6 segments |
| Radar | Multi-metric comparison | More than 8 axes |
| Scatter | Correlation between 2 variables | Ordinal data |
| Bubble | 3-variable relationships | Dense datasets |
| Candlestick | OHLC financial data | Non-financial use |
| Gauge / Radial | Single KPI vs target | Multiple values |
| Dot Matrix | Proportional data, unit charts | Precise values needed |
| World Map | Geographic distribution | Local/regional data |

---

## Reference Files

- `references/chart-patterns.md` — Advanced patterns: candlestick, gauge, dot matrix, animated counters
- `references/color-systems.md` — Extended palettes, accessibility contrast ratios, gradient recipes
- `references/dashboard-layouts.md` — Grid templates, responsive breakpoints, card sizing systems

---

## Common Mistakes to Avoid

- ❌ Using default Chart.js colors (blue, gray, default palette)  
- ❌ Flat solid fills on area/bar charts — always use gradients  
- ❌ Jagged lines — always set `tension: 0.4+`  
- ❌ Sharp rectangular bars — always use `borderRadius`  
- ❌ Busy grid lines — use barely-visible rgba values  
- ❌ Default tooltip styling  
- ❌ Fonts: Arial, Helvetica, system-ui alone — import DM Sans or similar  
- ❌ Making canvases too small — set explicit `height` on canvas elements  
- ❌ Forgetting `responsive: true` — charts must resize properly  
- ❌ No animation — always animate with `easeOutQuart`
