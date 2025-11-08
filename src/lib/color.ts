export function getContrastTextColor(hex?: string | null) {
  if (!hex) return "#000";
  const c = hex.replace("#", "");
  if (c.length !== 6) return "#000";
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  const [rLin, gLin, bLin] = [r, g, b].map(v =>
    v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  );
  const luminance = 0.2126 * rLin + 0.7152 * gLin + 0.0722 * bLin;
  const contrastWhite = (1.05) / (luminance + 0.05);
  const contrastBlack = (luminance + 0.05) / 0.05;
  return contrastWhite > contrastBlack ? "#fff" : "#000";
}
