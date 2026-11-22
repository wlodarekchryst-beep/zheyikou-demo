import * as ort from './ort.wasm.min.mjs';
import '../published-assets.js?v=1';

ort.env.wasm.numThreads = 1;
ort.env.wasm.wasmPaths = new URL('.', import.meta.url).href;
const size = 256;
const pixels = size * size;
let initialized;

const chunkSize = 4 * 1024 * 1024;

async function fetchBytes(url, signal) {
  const response = await fetch(url, {signal});
  if (!response.ok) throw new Error('Vision asset unavailable');
  return new Uint8Array(await response.arrayBuffer());
}

async function binaryAsset(name, size) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 50000);
  try {
    const chunks = await Promise.all(Array.from({length:Math.ceil(size / chunkSize)}, async (_, index) => {
      const url = new URL(`vision/public-binaries/${name}.${index}.bin`, globalThis.zheyikouPublicAssets);
      const bytes = await fetchBytes(url, controller.signal);
      if (bytes.length !== Math.min(chunkSize, size - index * chunkSize)) throw new Error('Incorrect asset length');
      return bytes;
    }));
    const result = new Uint8Array(size);
    chunks.forEach((bytes, index) => result.set(bytes, index * chunkSize));
    return result;
  } catch {
    controller.abort();
    return fetchBytes(new URL(name, import.meta.url));
  } finally {
    clearTimeout(timer);
  }
}

async function visionSession() {
  const config = {executionProviders:['wasm']};
  if (!globalThis.zheyikouPublicAssets) return ort.InferenceSession.create(new URL('encoder.onnx', import.meta.url).href, config);
  const [model, wasm] = await Promise.all([
    binaryAsset('encoder.onnx', 22876479),
    binaryAsset('ort-wasm-simd-threaded.wasm', 11210254),
  ]);
  ort.env.wasm.wasmBinary = wasm.buffer;
  return ort.InferenceSession.create(model, config);
}

export async function init() {
  initialized ??= Promise.all([
    visionSession(),
    fetch(new URL('catalog.json', import.meta.url)).then(response => {
      if (!response.ok) throw new Error('Could not read label catalog');
      return response.json();
    }),
  ]).catch(error => { initialized = null; throw error; });
  return initialized;
}

function similarity(vector, embedding, norm) {
  let sum = 0;
  for (let i = 0; i < vector.length; i++) sum += vector[i] * embedding[i];
  return sum / norm;
}

async function classify(model, catalog, sample) {
  const input = new Float32Array(3 * pixels);
  for (let i = 0; i < pixels; i++) {
    input[i] = sample[4 * i] / 255;
    input[pixels + i] = sample[4 * i + 1] / 255;
    input[2 * pixels + i] = sample[4 * i + 2] / 255;
  }
  const tensor = new ort.Tensor('float32', input, [1, 3, size, size]);
  try {
    const output = (await model.run({[model.inputNames[0]]:tensor}))[model.outputNames[0]];
    try {
      const vector = output.data;
      const norm = Math.hypot(...vector);
      return catalog.map(({embedding, ...label}) => ({...label, score:similarity(vector, embedding, norm)})).sort((a, b) => b.score - a.score);
    } finally { output.dispose(); }
  } finally { tensor.dispose(); }
}

function grainTexture(sample) {
  let pale = 0;
  let textured = 0;
  const palePixel = index => Math.min(sample[index], sample[index+1], sample[index+2]) >= 132 && Math.max(sample[index], sample[index+1], sample[index+2]) - Math.min(sample[index], sample[index+1], sample[index+2]) < 63;
  const brightness = index => (sample[index] + sample[index+1] + sample[index+2]) / 3;
  for (let y = 0; y < size - 2; y += 2) {
    for (let x = 0; x < size - 2; x += 2) {
      const index = (y * size + x) * 4;
      const right = index + 8;
      const lower = index + size * 8;
      if (!palePixel(index) || !palePixel(right) || !palePixel(lower)) continue;
      pale++;
      const tone = brightness(index);
      if (Math.abs(tone - brightness(right)) > 14 || Math.abs(tone - brightness(lower)) > 14) textured++;
    }
  }
  return pale >= 1800 && textured / pale >= 0.105;
}

function hasGreenCluster(sample) {
  let count = 0;
  for (let i = 0; i < sample.length; i += 32) {
    const green = sample[i + 1];
    if (green > 24 && green > sample[i] * 1.08 && green > sample[i + 2] * 1.17) count++;
  }
  return count > 280;
}

const meatLabels = new Set(['chicken','pork','beef','fish','shrimp']);

export async function classifySamples(samples) {
  const [model, catalog] = await init();
  const evidence = new Map();
  for (const [index, sample] of samples.entries()) {
    const [best, next] = await classify(model, catalog, sample);
    if (!best.name || best.score < 0.223) continue;
    const margin = best.score - next.score;
    const strong = margin >= 0.009;
    addEvidence(best, strong, sample, index >= 1 && index <= 9);
    if (next.name && next.score >= 0.244 && margin < 0.012) addEvidence(next, false, sample);
  }

  function addEvidence(guess, strong, sample, localWinner = false) {
    if (guess.id === 'rice' && !grainTexture(sample)) return;
    const item = evidence.get(guess.id) ?? {...guess, count:0, strong:0, peak:0, green:false, localHits:0};
    if (localWinner) item.localHits++;
    item.count++;
    item.strong += Number(strong);
    if (strong) item.peak = Math.max(item.peak, guess.score);
    if (guess.id === 'broccoli' && strong) item.green ||= hasGreenCluster(sample);
    item.score = Math.max(item.score, guess.score);
    evidence.set(guess.id, item);
  }

  const items = [...evidence.values()];
  const candidates = items.filter(item => {
    if (item.peak >= 0.266) return true;
    if (meatLabels.has(item.id)) return false;
    return (item.count >= 2 && item.strong >= 1 && item.score >= 0.242) || (item.green && item.peak >= 0.23);
  });
  const ambiguousMeat = items.filter(item => meatLabels.has(item.id) && item.score >= 0.232).sort((a,b) => b.score - a.score);
  if (ambiguousMeat.length && ambiguousMeat.reduce((count,item) => count + item.count,0) >= 2 && !candidates.some(item => meatLabels.has(item.id))) {
    candidates.push({name:'肉类（种类待核对）', reference:'', score:ambiguousMeat[0].score});
  }
  return candidates.sort((a,b) => b.score - a.score).slice(0, 6).map(({id,name,reference,localHits}) => ({id,name,reference,localHits}));
}
