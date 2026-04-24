# Advanced Chart Patterns

## Animated Counter (KPI Number)

```javascript
function animateCounter(el, target, duration = 1200, prefix = '', suffix = '') {
  const start = performance.now();
  const update = (now) => {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
    el.textContent = prefix + Math.round(eased * target).toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
// Usage: animateCounter(document.querySelector('.stat-value'), 2831, 1400, '$')
```

## Donut with Center Label Plugin

```javascript
const centerLabelPlugin = {
  id: 'centerLabel',
  beforeDraw(chart) {
    if (chart.config.type !== 'doughnut') return;
    const { ctx, chartArea: { width, height, left, top } } = chart;
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    const value = chart.config.options.plugins.centerLabel?.value || '';
    const label = chart.config.options.plugins.centerLabel?.label || '';
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px DM Sans, Inter, sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(value, centerX, centerY + 4);
    ctx.font = '12px DM Sans, Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText(label, centerX, centerY + 22);
    ctx.restore();
  }
};
Chart.register(centerLabelPlugin);
// Then in options: plugins: { centerLabel: { value: '76%', label: 'Complete' } }
```

## Radial Gauge (Progress Arc)

```javascript
// Use type: 'doughnut' with a "hidden" filler segment
const gaugeData = {
  datasets: [{
    data: [76, 24], // value, remainder
    backgroundColor: [
      createArcGradient(ctx, '#FF3D9A', '#7B5EA7'),
      'rgba(255,255,255,0.06)'
    ],
    borderWidth: 0,
    circumference: 270,   // ← arc spans 270 degrees
    rotation: 225,        // ← start from bottom-left
  }]
};
// options: { cutout: '80%', plugins: { centerLabel: { value: '76', label: 'Score' } } }
```

## Dot Matrix / Unit Chart

```javascript
// Pure CSS/HTML — not Chart.js
function renderDotMatrix(container, total, filled, color = '#FF3D9A') {
  container.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      width: 10px; height: 10px; border-radius: 50%;
      background: ${i < filled ? color : 'rgba(255,255,255,0.1)'};
      display: inline-block; margin: 2px;
      transition: background 0.3s ${i * 10}ms;
    `;
    container.appendChild(dot);
  }
}
```

## Candlestick Chart (Financial)

Use Chart.js Financial plugin or build with SVG:
```javascript
// With chartjs-chart-financial (load via CDN or custom)
// CDN: https://cdn.jsdelivr.net/npm/chartjs-chart-financial
import 'chartjs-chart-financial';

new Chart(ctx, {
  type: 'candlestick',
  data: {
    datasets: [{
      label: 'Stock',
      data: [
        { x: Date.parse('2024-01'), o: 100, h: 120, l: 95, c: 115 },
        // ...
      ],
      color: {
        up: '#3DFFA0',    // green for up candles
        down: '#FF5F6D',  // red for down candles
        unchanged: '#aaa'
      }
    }]
  }
});
```

## Sparkline (Mini Inline Chart)

```javascript
function createSparkline(canvasEl, data, color = '#FF3D9A') {
  new Chart(canvasEl, {
    type: 'line',
    data: {
      labels: data.map((_, i) => i),
      datasets: [{ data, borderColor: color, borderWidth: 2,
        tension: 0.4, fill: false, pointRadius: 0 }]
    },
    options: {
      responsive: false,
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: { x: { display: false }, y: { display: false } },
      animation: false,
    }
  });
}
```

## World Map Dot Visualization

Use SVG world map with data circles overlaid:
```javascript
// Load SVG map from: https://cdn.jsdelivr.net/npm/svg-world-map/world.svg
// Overlay circles at country lat/long positions
// Pulse animation for active nodes:
const style = `
  @keyframes pulse {
    0% { r: 4; opacity: 0.8; }
    100% { r: 12; opacity: 0; }
  }
  .pulse { animation: pulse 2s infinite; }
`;
```

## Multi-Series Area Chart with Hover Crosshair

```javascript
// Add crosshair plugin
const crosshairPlugin = {
  id: 'crosshair',
  afterDraw(chart) {
    if (chart.tooltip._active?.length) {
      const { ctx, chartArea: { top, bottom } } = chart;
      const x = chart.tooltip._active[0].element.x;
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, bottom);
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();
    }
  }
};
```

## Stacked Bar Chart

```javascript
{
  type: 'bar',
  data: {
    datasets: [
      { label: 'A', data: [...], backgroundColor: '#FF3D9A', stack: 'stack1' },
      { label: 'B', data: [...], backgroundColor: '#7B5EA7', stack: 'stack1' },
    ]
  },
  options: {
    scales: {
      x: { stacked: true },
      y: { stacked: true }
    }
  }
}
```

## Animated Bar Chart (Staggered)

```javascript
// Stagger bar entry animations
animation: {
  delay: (ctx) => ctx.dataIndex * 60,
  duration: 600,
  easing: 'easeOutBack',
}
```

## Progress Bar Component (CSS)

```html
<div class="progress-row">
  <span class="label">Category A</span>
  <div class="bar-track">
    <div class="bar-fill" style="width: 76%; background: linear-gradient(90deg, #FF3D9A, #7B5EA7);"></div>
  </div>
  <span class="value">76%</span>
</div>
```
```css
.bar-track { flex: 1; height: 8px; background: rgba(255,255,255,0.08); border-radius: 4px; margin: 0 12px; }
.bar-fill { height: 100%; border-radius: 4px; transition: width 1s cubic-bezier(0.16,1,0.3,1); }
```
