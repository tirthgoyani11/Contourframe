const canvas = document.querySelector('#hero-map');
const context = canvas.getContext('2d');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

if (context) {
  let width;
  let height;
  let frame;

  function draw(time) {
    const phase = time / 15000;
    const centerX = width * 0.76;
    const centerY = height * 0.49;
    const size = Math.min(height * 0.46, width * 0.38);

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#888bc078';
    for (let y = 8; y < height; y += 12) {
      for (let x = 8; x < width; x += 12) {
        context.fillRect(x, y, 1, 1);
      }
    }

    // Nested irregular contours suggest elevation without depicting a real place.
    for (let ring = 1; ring <= 24; ring++) {
      const radius = size * ring / 20;
      context.beginPath();
      for (let step = 0; step <= 144; step++) {
        const angle = step * Math.PI / 72;
        const offset = 1 + 0.17 * Math.sin(angle * 3 + phase) + 0.11 * Math.cos(angle * 5 - ring * 0.12);
        const x = centerX + Math.cos(angle) * radius * offset * 1.22;
        const y = centerY + Math.sin(angle) * radius * offset;
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.strokeStyle = ring % 5 === 0 ? '#ffa000a0' : '#8c90e55c';
      context.stroke();
    }

    const position = (1 + Math.sin(phase * 2)) / 2;
    const x = centerX - size * 0.7 + position * size * 1.4;
    const y = centerY + size * (0.22 - Math.sin(position * Math.PI) * 0.66);
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fillStyle = '#ffd28c';
    context.fill();
  }

  function animate(time) {
    draw(time);
    frame = requestAnimationFrame(animate);
  }

  function refresh() {
    cancelAnimationFrame(frame);
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    if (reducedMotion.matches || document.hidden) draw(0);
    else frame = requestAnimationFrame(animate);
  }

  new ResizeObserver(refresh).observe(canvas);
  reducedMotion.addEventListener('change', refresh);
  document.addEventListener('visibilitychange', refresh);
}

