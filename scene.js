export const sample = Object.freeze({
  title: 'An Alpine Crossing',
  duration: 5,
  highlight: '#fa9000',
});

export function normalizeScene(input) {
  const duration = Number(input.duration);
  return {
    title: String(input.title || sample.title).trim().slice(0, 80) || sample.title,
    duration: Number.isFinite(duration) ? Math.max(2, Math.min(12, duration)) : sample.duration,
    highlight: /^#[a-f0-9]{6}$/i.test(input.highlight) ? input.highlight : sample.highlight,
  };
}

function escapeXml(text) {
  const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' };
  return text.replace(/[&<>"']/g, character => entities[character]);
}

// Original schematic terrain. Paths and positions are illustrative.
const terrain = 'M0 353L130 286 213 311 335 196 439 279 553 139 685 266 774 209 960 304V540H0Z';
const ridge = 'M0 396L133 349 211 375 331 260 441 337 553 219 686 329 774 277 960 366';

export function renderScene(input, progress) {
  const scene = normalizeScene(input);
  const time = Math.max(0, Math.min(1, progress));
  const ease = time * time * (3 - 2 * time);
  const scale = 1 + ease * .29;
  const x = -185 * ease;
  const y = -77 * ease;
  const remaining = 1 - ease;
  const markerX = remaining ** 2 * 380 + 2 * remaining * ease * 493 + ease ** 2 * 623;
  const markerY = remaining ** 2 * 388 + 2 * remaining * ease * 303 + ease ** 2 * 319;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" role="img" aria-label="Illustrated Alpine crossing">
    <rect width="960" height="540" fill="#14132b"/>
    <g transform="translate(${x} ${y}) scale(${scale})">
      <path d="${terrain}" fill="#272967" stroke="#6468a8" stroke-width="2"/>
      <path d="${ridge}" fill="none" stroke="#777cbd" stroke-width="2"/>
      <path d="M0 454L171 408 274 419 406 353 559 286 689 364 832 338 960 427" fill="none" stroke="#777cbd" stroke-width="2"/>
      <path d="M442 327l33-30 52 8 48-37 60 29-10 43-65 19-59-12-44 6z" fill="${scene.highlight}" fill-opacity=".28" stroke="${scene.highlight}" stroke-width="3"/>
      <path d="M380 388Q493 303 623 319" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="7 9"/>
      <circle cx="${markerX}" cy="${markerY}" r="8" fill="${scene.highlight}" stroke="#fff" stroke-width="3"/>
      <text x="544" y="382" fill="#fff" font-size="20" font-family="sans-serif">Switzerland · schematic</text>
    </g>
    <rect x="30" y="27" width="8" height="62" fill="${scene.highlight}"/>
    <text x="54" y="52" fill="#dddaf7" font-size="16" font-family="sans-serif">CONTOURFRAME STUDIO</text>
    <text x="54" y="83" fill="#fff" font-size="25" font-family="sans-serif" font-weight="bold">${escapeXml(scene.title)}</text>
  </svg>`;
}
