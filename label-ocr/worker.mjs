import * as ort from '../vision/ort.wasm.min.mjs';

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = new URL('../vision/', import.meta.url).href;

const lineHeight = 48;
const rounded = (value, step) => Math.max(step, Math.round(value / step) * step);
let models;

function loadModels() {
  models ??= Promise.all([
    ort.InferenceSession.create(new URL('det.onnx', import.meta.url).href, {executionProviders:['wasm']}),
    ort.InferenceSession.create(new URL('rec.onnx', import.meta.url).href, {executionProviders:['wasm']}),
    fetch(new URL('chars.txt', import.meta.url)).then(async response => {
      if (!response.ok) throw new Error('Missing label OCR dictionary');
      return ['', ...(await response.text()).trimEnd().split(/\r?\n/), ' '];
    }),
  ]);
  return models;
}

async function infer(model, context, contentWidth) {
  const {width, height} = context.canvas;
  const rgba = context.getImageData(0, 0, width, height).data;
  const area = width * height;
  const bgr = new Float32Array(3 * area);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < contentWidth; x++) {
      const i = y * width + x;
      bgr[i] = rgba[4 * i + 2] / 127.5 - 1;
      bgr[area + i] = rgba[4 * i + 1] / 127.5 - 1;
      bgr[2 * area + i] = rgba[4 * i] / 127.5 - 1;
    }
  }
  const tensor = new ort.Tensor('float32', bgr, [1, 3, height, width]);
  try {
    return (await model.run({[model.inputNames[0]]:tensor}))[model.outputNames[0]];
  } finally {
    tensor.dispose();
  }
}

// Fit a padded, rotated text crop to each connected region of the detector map.
function textRegions(output) {
  const {data, dims:[, , height, width]} = output;
  const visited = new Uint8Array(data.length);
  const points = new Int32Array(data.length);
  const regions = [];
  for (let index = 0; index < data.length; index++) {
    if (visited[index] || data[index] < 0.3) continue;
    let count = 1, sumX = 0, sumY = 0, sumXX = 0, sumYY = 0, sumXY = 0, peak = 0;
    points[0] = index;
    visited[index] = 1;
    for (let i = 0; i < count; i++) {
      const position = points[i];
      const x = position % width;
      const y = Math.floor(position / width);
      sumX += x; sumY += y; sumXX += x * x; sumYY += y * y; sumXY += x * y;
      peak = Math.max(peak, data[position]);
      for (let ny = Math.max(0, y - 1); ny <= Math.min(height - 1, y + 1); ny++) {
        for (let nx = Math.max(0, x - 1); nx <= Math.min(width - 1, x + 1); nx++) {
          const next = ny * width + nx;
          if (visited[next] || data[next] < 0.3) continue;
          visited[next] = 1;
          points[count++] = next;
        }
      }
    }
    if (count < 12 || peak < 0.55) continue;
    const x = sumX / count, y = sumY / count;
    const angle = 0.5 * Math.atan2(2 * (sumXY / count - x * y), (sumXX - sumYY) / count - x * x + y * y);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    let left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
    for (let i = 0; i < count; i++) {
      const dx = points[i] % width - x;
      const dy = Math.floor(points[i] / width) - y;
      const u = cos * dx + sin * dy, v = -sin * dx + cos * dy;
      left = Math.min(left, u); right = Math.max(right, u);
      top = Math.min(top, v); bottom = Math.max(bottom, v);
    }
    const w = right - left + 1, h = bottom - top + 1;
    if (w < 5 || h < 2 || Math.max(w, h) / Math.min(w, h) > 140) continue;
    const pad = Math.max(2, Math.min(30, 0.8 * w * h / (w + h)));
    const u = (left + right) / 2, v = (top + bottom) / 2;
    regions.push({x:x + cos * u - sin * v, y:y + sin * u + cos * v, angle, width:w + 2 * pad, height:h + 2 * pad, peak});
  }
  return regions.sort((a,b) => b.peak - a.peak).slice(0, 150);
}

function decode(output, chars) {
  const {data, dims:[, steps, classes]} = output;
  if (classes !== chars.length) throw new Error('Wrong label OCR dictionary');
  let text = '', score = 0, count = 0, previous = 0;
  for (let step = 0; step < steps; step++) {
    const offset = step * classes;
    let best = 0;
    for (let i = 1; i < classes; i++) if (data[offset + i] > data[offset + best]) best = i;
    if (best && best !== previous) {
      text += chars[best];
      score += data[offset + best];
      count++;
    }
    previous = best;
  }
  return {text:text.trim(), score:count ? score / count : 0};
}

async function readLine(model, chars, image, region, scaleX, scaleY) {
  const {x, y, width, height, angle} = region;
  const contentWidth = Math.min(1536, Math.max(1, Math.round(lineHeight * width / height)));
  const canvas = new OffscreenCanvas(Math.max(64, Math.ceil(contentWidth / 32) * 32), lineHeight);
  const ctx = canvas.getContext('2d', {alpha:false, willReadFrequently:true});
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.rect(0, 0, contentWidth, lineHeight);
  ctx.clip();
  ctx.translate(contentWidth / 2, lineHeight / 2);
  ctx.scale(contentWidth / width, lineHeight / height);
  ctx.rotate(-angle);
  ctx.translate(-x, -y);
  ctx.scale(1 / scaleX, 1 / scaleY);
  ctx.drawImage(image, 0, 0);
  const output = await infer(model, ctx, contentWidth);
  try {
    return decode(output, chars);
  } finally {
    output.dispose();
  }
}

function readingOrder(regions) {
  const rows = [];
  const horizontal = regions.filter(region => Math.abs(region.angle) < Math.PI / 4);
  const angles = horizontal.filter(region => region.width > 3 * region.height).map(region => region.angle).sort((a,b) => a - b);
  const slope = Math.tan(angles[Math.floor(angles.length / 2)] || 0);
  const lines = regions.map(region => ({...region, baseline:region.y - region.x * slope}));
  lines.sort((a,b) => a.baseline - b.baseline);
  for (const line of lines) {
    const row = rows.at(-1);
    if (row && Math.abs(line.baseline - row.baseline) < Math.min(line.height, row.height) * 0.45) row.items.push(line);
    else rows.push({baseline:line.baseline, height:line.height, items:[line]});
  }
  return rows.map(row => row.items.sort((a,b) => a.x - b.x).map(item => item.text).join('  ')).join('\n');
}

async function recognize(image) {
  const [detector, reader, chars] = await loadModels();
  self.postMessage({stage:'detect'});
  const scale = Math.min(1.5, 1440 / Math.max(image.width, image.height), Math.sqrt(1_180_000 / (image.width * image.height)));
  const canvas = new OffscreenCanvas(rounded(image.width * scale, 32), rounded(image.height * scale, 32));
  const ctx = canvas.getContext('2d', {alpha:false, willReadFrequently:true});
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const output = await infer(detector, ctx, canvas.width);
  let regions;
  try {
    regions = textRegions(output);
  } finally {
    output.dispose();
  }
  if (regions.length) self.postMessage({stage:'read'});
  const lines = [];
  for (const region of regions) {
    const result = await readLine(reader, chars, image, region, image.width / canvas.width, image.height / canvas.height);
    if (result.text && result.score >= 0.55) lines.push({...region, ...result});
  }
  return readingOrder(lines);
}

self.onmessage = async ({data:image}) => {
  try {
    self.postMessage({text:await recognize(image)});
  } catch (error) {
    self.postMessage({error:error.message});
  } finally {
    image.close();
  }
};
