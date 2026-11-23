const size = document.querySelector('#size');
const target = document.querySelector('#target');
const mode = document.querySelector('#mode');
const step = document.querySelector('#step');
const status = document.querySelector('#status');
const chart = document.querySelector('#chart');
const values = document.querySelector('#values');

let amplitudes;
let oracleNext;
let queries;

function reset() {
  const count = Number(size.value);
  amplitudes = Array(count).fill(1 / Math.sqrt(count));
  oracleNext = true;
  queries = 0;
  render();
}

function loadTargets() {
  target.replaceChildren(...Array.from({ length: Number(size.value) }, (_, index) =>
    new Option(String(index).padStart(String(Number(size.value) - 1).length, '0'), index)
  ));
  reset();
}

function render() {
  const marked = Number(target.value);
  const showAmplitude = mode.value === 'amplitude';
  const baseline = showAmplitude ? 50 : 100;
  step.textContent = oracleNext ? 'Apply oracle' : 'Apply diffusion';
  const success = (100 * amplitudes[marked] ** 2).toFixed(2);
  status.textContent = `Oracle queries: ${queries} · Marked index: ${marked} · Success probability: ${success}%`;
  chart.style.setProperty('--baseline', `${baseline}%`);
  chart.style.gridTemplateColumns = `repeat(${amplitudes.length}, minmax(0, 1fr))`;
  const tracks = [];
  const rows = [];
  for (const [index, amplitude] of amplitudes.entries()) {
    const probability = amplitude ** 2;
    const value = showAmplitude ? amplitude : probability;
    const height = Math.min(1, Math.abs(value)) * baseline;
    const track = document.createElement('div');
    track.className = 'track';
    const bar = document.createElement('div');
    bar.className = index === marked ? 'bar marked' : 'bar';
    bar.style.height = `${height}%`;
    bar.style.top = `${value >= 0 ? baseline - height : baseline}%`;
    track.title = `Index ${index}: ${value.toFixed(4)}`;
    track.append(bar);
    tracks.push(track);
    const row = document.createElement('tr');
    for (const entry of [index === marked ? `${index} (marked)` : index, amplitude.toFixed(4), probability.toFixed(4)]) {
      row.insertCell().textContent = entry;
    }
    rows.push(row);
  }
  chart.replaceChildren(...tracks);
  values.replaceChildren(...rows);
}

step.addEventListener('click', () => {
  if (oracleNext) {
    amplitudes[Number(target.value)] *= -1;
    queries += 1;
  } else {
    const mean = amplitudes.reduce((sum, amplitude) => sum + amplitude, 0) / amplitudes.length;
    amplitudes = amplitudes.map(amplitude => 2 * mean - amplitude);
  }
  oracleNext = !oracleNext;
  render();
});

size.addEventListener('change', loadTargets);
target.addEventListener('change', reset);
mode.addEventListener('change', render);
document.querySelector('#reset').addEventListener('click', reset);
loadTargets();
