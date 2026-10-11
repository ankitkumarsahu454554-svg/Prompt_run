/**
 * @file check-contrast.mjs
 * Automated WCAG 2.2 contrast ratio verification script for design system tokens.
 * Enforces >= 4.5:1 for body text and >= 3.0:1 for large display text and UI borders.
 */

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

function sRgbToLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function getLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  return (
    0.2126 * sRgbToLinear(r) +
    0.7152 * sRgbToLinear(g) +
    0.0722 * sRgbToLinear(b)
  );
}

function getContrastRatio(fgHex, bgHex) {
  const l1 = getLuminance(fgHex);
  const l2 = getLuminance(bgHex);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

const TOKEN_PAIRS = [
  // Dark Theme
  { theme: "dark", name: "Text on BG", fg: "#F4F4F8", bg: "#0B0B14", min: 4.5 },
  { theme: "dark", name: "Text on Surface", fg: "#F4F4F8", bg: "#14141F", min: 4.5 },
  { theme: "dark", name: "Text on Elevated", fg: "#F4F4F8", bg: "#1C1C2B", min: 4.5 },
  { theme: "dark", name: "Muted Text on Surface", fg: "#9A9AB0", bg: "#14141F", min: 4.5 },
  { theme: "dark", name: "White on Primary Fill", fg: "#FFFFFF", bg: "#6D4AFF", min: 4.5 },
  { theme: "dark", name: "Primary Accent Text on BG", fg: "#8B72FF", bg: "#0B0B14", min: 4.5 },
  { theme: "dark", name: "Primary Accent Text on Surface", fg: "#8B72FF", bg: "#14141F", min: 4.5 },
  { theme: "dark", name: "Success Mint Text on Surface (Large UI)", fg: "#2EE6A6", bg: "#14141F", min: 3.0 },
  { theme: "dark", name: "Warning Amber Text on Surface (Large UI)", fg: "#FFB547", bg: "#14141F", min: 3.0 },
  { theme: "dark", name: "Danger Coral Text on Surface (Large UI)", fg: "#FF5C7A", bg: "#14141F", min: 3.0 },

  // Light Theme
  { theme: "light", name: "Text on BG", fg: "#12121F", bg: "#F8F9FC", min: 4.5 },
  { theme: "light", name: "Text on Surface", fg: "#12121F", bg: "#FFFFFF", min: 4.5 },
  { theme: "light", name: "Muted Text on Surface", fg: "#55556A", bg: "#FFFFFF", min: 4.5 },
  { theme: "light", name: "Primary Text on Surface", fg: "#5A38EB", bg: "#FFFFFF", min: 4.5 },
  { theme: "light", name: "White on Primary Fill", fg: "#FFFFFF", bg: "#5A38EB", min: 4.5 },
  { theme: "light", name: "Success on Surface", fg: "#097750", bg: "#FFFFFF", min: 4.5 },
  { theme: "light", name: "Warning on Surface", fg: "#945700", bg: "#FFFFFF", min: 4.5 },
  { theme: "light", name: "Danger on Surface", fg: "#D11A41", bg: "#FFFFFF", min: 4.5 },
];

let failed = 0;
console.log("=== WCAG 2.2 Color Contrast Audit ===");

for (const pair of TOKEN_PAIRS) {
  const ratio = getContrastRatio(pair.fg, pair.bg);
  const passed = ratio >= pair.min;
  const status = passed ? "✓ PASS" : "✗ FAIL";
  console.log(
    `[${pair.theme.toUpperCase()}] ${pair.name}: ${ratio.toFixed(2)}:1 (Req: ${pair.min}:1) -> ${status}`
  );
  if (!passed) {
    failed++;
  }
}

if (failed > 0) {
  console.error(`\nContrast check FAILED with ${failed} violations.`);
  process.exit(1);
} else {
  console.log("\nAll color contrast pairs PASSED WCAG 2.2 requirements!");
  process.exit(0);
}
