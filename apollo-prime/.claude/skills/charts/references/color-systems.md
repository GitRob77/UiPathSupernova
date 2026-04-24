# Color Systems for Charts

## Complete Palette Library

### 1. Neon Vivid (Dark) — High impact dashboards
```css
--color-1: #FF3D9A;   /* hot pink — primary */
--color-2: #7B5EA7;   /* purple */
--color-3: #00F5FF;   /* cyan */
--color-4: #FF8C42;   /* orange */
--color-5: #3DFFA0;   /* mint */
--color-6: #6C63FF;   /* violet */
--color-7: #FFD93D;   /* yellow */
--color-8: #FF5F6D;   /* coral red */
```

### 2. Corporate Vivid (Light) — Business analytics
```css
--color-1: #FF2D78;   /* magenta */
--color-2: #4A2FC1;   /* indigo */
--color-3: #8B5CF6;   /* violet */
--color-4: #F97316;   /* orange */
--color-5: #10B981;   /* emerald */
--color-6: #0EA5E9;   /* sky */
--color-7: #EAB308;   /* yellow */
--color-8: #EF4444;   /* red */
```

### 3. Ocean (Professional Dark) — Finance & analytics
```css
--color-1: #06B6D4;   /* cyan */
--color-2: #8B5CF6;   /* purple */
--color-3: #EC4899;   /* pink */
--color-4: #F59E0B;   /* amber */
--color-5: #34D399;   /* green */
--color-6: #F97316;   /* orange */
--color-7: #A78BFA;   /* lavender */
--color-8: #FB7185;   /* rose */
```

### 4. Sunset Gradient — Warm dashboards
```css
--color-1: #F97316;   /* orange */
--color-2: #EC4899;   /* pink */
--color-3: #8B5CF6;   /* purple */
--color-4: #06B6D4;   /* cyan */
--color-5: #84CC16;   /* lime */
--color-6: #EAB308;   /* yellow */
```

---

## Gradient Recipes

### Horizontal fill gradients (bar charts)
```javascript
// Pink → Purple
'linear-gradient(90deg, #FF3D9A 0%, #7B5EA7 100%)'

// Cyan → Purple  
'linear-gradient(90deg, #00F5FF 0%, #7B5EA7 100%)'

// Orange → Pink
'linear-gradient(90deg, #FF8C42 0%, #FF3D9A 100%)'

// Green → Cyan
'linear-gradient(90deg, #3DFFA0 0%, #00F5FF 100%)'
```

### Vertical area fills (line/area charts)
```javascript
// Hot pink area
gradient.addColorStop(0, 'rgba(255,61,154,0.40)');
gradient.addColorStop(0.5, 'rgba(255,61,154,0.15)');
gradient.addColorStop(1, 'rgba(255,61,154,0.00)');

// Cyan area
gradient.addColorStop(0, 'rgba(0,245,255,0.35)');
gradient.addColorStop(1, 'rgba(0,245,255,0.00)');

// Orange area
gradient.addColorStop(0, 'rgba(255,140,66,0.35)');
gradient.addColorStop(1, 'rgba(255,140,66,0.00)');

// Purple area
gradient.addColorStop(0, 'rgba(123,94,167,0.45)');
gradient.addColorStop(1, 'rgba(123,94,167,0.00)');
```

### Bar chart gradients (vertical)
```javascript
// bar going bottom to top — invert gradient
gradient.addColorStop(0, '#7B5EA7');   // bottom
gradient.addColorStop(1, '#FF3D9A');   // top
```

---

## Accessibility: WCAG Contrast on Dark Backgrounds

| Color | Hex | AA on #0D0F1C | Notes |
|---|---|---|---|
| Hot Pink | #FF3D9A | ✅ 5.4:1 | Use freely |
| Cyan | #00F5FF | ✅ 11.2:1 | Use freely |
| Mint | #3DFFA0 | ✅ 9.8:1 | Use freely |
| Orange | #FF8C42 | ✅ 5.1:1 | Use freely |
| Purple | #7B5EA7 | ⚠️ 3.1:1 | Text only if large |
| Violet | #6C63FF | ⚠️ 3.6:1 | OK for charts, not small text |

**Rule**: Use brighter colors (#FF3D9A, #00F5FF, #3DFFA0) for data values and labels. Use muted colors (#7B5EA7, #6C63FF) for secondary fills and backgrounds.

---

## Semantic Colors

Always use consistent semantics:
```javascript
const SEMANTIC = {
  positive: '#3DFFA0',  // green — up, gain, success
  negative: '#FF5F6D',  // red — down, loss, error  
  neutral:  '#94A3B8',  // gray — flat, unchanged
  warning:  '#FFD93D',  // yellow — alert, caution
  info:     '#00F5FF',  // cyan — information
};
```

---

## Background System (Dark Theme)

```css
--bg-page:    #0D0F1C;  /* page background */
--bg-card:    #131629;  /* chart cards */
--bg-raised:  #1A1D35;  /* dropdowns, overlays */
--bg-hover:   #1F2340;  /* hover states */
--border:     rgba(255,255,255,0.07);
--border-em:  rgba(255,255,255,0.15);  /* emphasized borders */
```

## Background System (Light Theme)

```css
--bg-page:    #F1F2F9;  /* page background */
--bg-card:    #FFFFFF;  /* chart cards */
--bg-raised:  #ECEDF7;  /* active states */
--border:     rgba(0,0,0,0.07);
```
