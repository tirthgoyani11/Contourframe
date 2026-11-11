import { normalizeScene, renderScene, sample } from './scene.js';

const form = document.querySelector('#scene-settings');
const preview = document.querySelector('#preview');
const status = document.querySelector('#status');
const exportButton = document.querySelector('#export');
const cancelButton = document.querySelector('#cancel');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const storageKey = 'contourframe-release-scene-v1';
let animation;
let activeExport;
let savedScene = sample;

try {
  const stored = JSON.parse(localStorage.getItem(storageKey));
  if (stored && typeof stored === 'object') savedScene = normalizeScene(stored);
} catch {
  status.textContent = 'Saved settings could not be read.';
}

for (const [name, value] of Object.entries(savedScene)) form.elements[name].value = value;
const settings = () => normalizeScene(Object.fromEntries(new FormData(form)));
const show = (scene, progress) => { preview.innerHTML = renderScene(scene, progress); };
show(savedScene, 0);

form.addEventListener('input', () => {
  cancelAnimationFrame(animation);
  show(settings(), 0);
});

form.addEventListener('submit', event => {
  event.preventDefault();
  try {
    localStorage.setItem(storageKey, JSON.stringify(settings()));
    status.textContent = 'Saved in this browser.';
  } catch {
    status.textContent = 'Browser storage is unavailable.';
  }
});

document.querySelector('#play').addEventListener('click', () => {
  cancelAnimationFrame(animation);
  if (!form.reportValidity()) return;
  const scene = settings();
  if (reducedMotion.matches) {
    show(scene, 1);
    return;
  }
  const start = performance.now();
  function step(now) {
    const progress = Math.min(1, (now - start) / (scene.duration * 1000));
    show(scene, progress);
    if (progress < 1) animation = requestAnimationFrame(step);
  }
  animation = requestAnimationFrame(step);
});

async function drawFrame(context, scene, progress) {
  const url = URL.createObjectURL(new Blob([renderScene(scene, progress)], { type: 'image/svg+xml' }));
  try {
    const frame = new Image();
    frame.src = url;
    await frame.decode();
    context.drawImage(frame, 0, 0);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function downloadVideo(chunks) {
  const blob = new Blob(chunks, { type: 'video/webm' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'contourframe.webm';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function record(scene, signal) {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext('2d');
  await drawFrame(context, scene, 0);
  if (signal.aborted) return [];
  const stream = canvas.captureStream(30);
  const chunks = [];
  try {
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const completed = new Promise((resolve, reject) => {
      recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
      recorder.onstop = () => resolve(chunks);
      recorder.onerror = event => reject(event.error);
    });
    completed.catch(() => {});
    recorder.start();
    const start = performance.now();
    try {
      let progress = 0;
      while (!signal.aborted && progress < 1 && recorder.state === 'recording') {
        const now = await new Promise(requestAnimationFrame);
        if (signal.aborted) break;
        progress = Math.min(1, (now - start) / (scene.duration * 1000));
        await drawFrame(context, scene, progress);
        status.textContent = `Rendering… ${Math.floor(progress * 100)}%`;
      }
    } finally {
      if (recorder.state !== 'inactive') recorder.stop();
    }
    return await completed;
  } finally {
    stream.getTracks().forEach(track => track.stop());
  }
}

exportButton.addEventListener('click', async () => {
  if (activeExport || !form.reportValidity()) return;
  if (!globalThis.MediaRecorder?.isTypeSupported('video/webm') ||
      !HTMLCanvasElement.prototype.captureStream) {
    status.textContent = 'WebM recording is unavailable in this browser. Try Chrome or Firefox.';
    return;
  }
  activeExport = new AbortController();
  const { signal } = activeExport;
  exportButton.disabled = true;
  cancelButton.disabled = false;
  status.textContent = 'Preparing export…';
  try {
    const chunks = await record(settings(), signal);
    if (signal.aborted) status.textContent = 'Export canceled.';
    else {
      if (!chunks.length) throw new Error('The browser produced no video frames.');
      downloadVideo(chunks);
      status.textContent = 'Video downloaded.';
    }
  } catch (error) {
    status.textContent = signal.aborted ? 'Export canceled.' : `Export failed. ${error.message}`;
  } finally {
    activeExport = undefined;
    exportButton.disabled = false;
    cancelButton.disabled = true;
  }
});

cancelButton.addEventListener('click', () => activeExport?.abort());
