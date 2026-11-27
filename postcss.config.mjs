function oklchToRgb(lRaw, cRaw, hRaw, alphaRaw) {
  let L = parseFloat(lRaw);
  if (String(lRaw).trim().endsWith('%')) L /= 100;
  const C = parseFloat(cRaw);
  const H = parseFloat(hRaw) || 0;
  const hRad = (H * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const lr = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const mg = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bb = -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s;

  const toSrgb = (x) => {
    const clamped = Math.max(0, Math.min(1, x));
    const v = clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(255, v * 255)));
  };

  const r = toSrgb(lr);
  const g = toSrgb(mg);
  const bl = toSrgb(bb);

  if (alphaRaw !== undefined && alphaRaw !== '') {
    let alpha = parseFloat(alphaRaw);
    if (String(alphaRaw).trim().endsWith('%')) alpha /= 100;
    return `rgba(${r}, ${g}, ${bl}, ${Number(alpha.toFixed(4))})`;
  }
  return `rgb(${r}, ${g}, ${bl})`;
}

function parseColorToRgbTuple(colorStr) {
  const s = colorStr.trim().toLowerCase();
  if (s === 'black') return [0, 0, 0];
  if (s === 'white') return [255, 255, 255];
  const rgbMatch = s.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgbMatch) {
    return [Number(rgbMatch[1]), Number(rgbMatch[2]), Number(rgbMatch[3])];
  }
  const hexMatch = s.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hexMatch) {
    let hex = hexMatch[1];
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  return null;
}

function convertLegacyColors(value) {
  if (!value || typeof value !== 'string') return value;
  let out = value;

  // 1. Convert oklch(L C H [/ alpha]) -> rgb(...) / rgba(...)
  out = out.replace(
    /oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+(?:deg)?)(?:\s*\/\s*([\d.]+%?))?\s*\)/gi,
    (_, l, c, h, a) => oklchToRgb(l, c, h, a)
  );

  // 2. Convert color-mix(in oklab|oklch|srgb, <color> <pct>%, transparent) -> rgba(...)
  out = out.replace(
    /color-mix\(\s*in\s+(?:oklab|oklch|srgb)\s*,\s*(#[0-9a-f]{3,6}|black|white|rgba?\([^)]+\))\s+([\d.]+)%\s*,\s*transparent\s*\)/gi,
    (match, colorPart, pct) => {
      const tuple = parseColorToRgbTuple(colorPart);
      if (!tuple) return match;
      const alpha = Number((parseFloat(pct) / 100).toFixed(4));
      return `rgba(${tuple[0]}, ${tuple[1]}, ${tuple[2]}, ${alpha})`;
    }
  );

  // 3. Strip "in oklab" / "in oklch" from gradients and --tw-gradient-position so older Chrome/Safari render them
  out = out.replace(/\s+in\s+(?:oklab|oklch)(?:\s+(?:shorter|longer|increasing|decreasing)\s+hue)?(?=\s*,|\s*$|\s*\))/gi, '');

  return out;
}

const legacyColorCompatPlugin = () => ({
  postcssPlugin: 'legacy-color-compat',
  Declaration(decl) {
    if (
      decl.value &&
      (decl.value.includes('oklch') ||
        decl.value.includes('oklab') ||
        decl.value.includes('color-mix'))
    ) {
      decl.value = convertLegacyColors(decl.value);
    }
  },
});
legacyColorCompatPlugin.postcss = true;

const config = {
  plugins: ['@tailwindcss/postcss', legacyColorCompatPlugin],
};

export default config;
