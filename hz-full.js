// js/hz-full.js

// Lookup table: L★/L⊙ Avg (ค่าจาก Excel)
const avgLumData = {
  "O5": 845999.98, "O6": 274999.99, "O7": 220000.00, "O8": 150000.00, "O9": 95000.00,
  "B0": 20000.00,  "B1": 4600.00,   "B2": 2600.00,   "B3": 900.00,    "B5": 360.00,
  "B6": 250.00,    "B7": 175.00,    "B8": 100.00,    "B9": 62.00,     "Bave": 1430.94,
  "A0": 22.00,     "A1": 18.00,     "A2": 15.00,     "A3": 12.00,     "A4": 10.00,
  "A5": 9.00,      "A7": 6.70,      "Aave": 13.16,
  "F0": 4.30,      "F2": 3.30,      "F3": 2.80,      "F5": 2.40,      "F6": 2.10,
  "F7": 1.80,      "F8": 1.70,
  "G2": 1.00,      "G5": 0.86,      "G8": 0.68,      "Gave": 0.56,
  "K0": 0.54,      "K1": 0.46,      "K2": 0.38,      "K3": 0.31,      "K4": 0.24,
  "K5": 0.19,      "K7": 0.10,      "Kave": 0.12,
  "M0": 0.07,      "M1": 0.06,      "M2": 0.05,      "M3": 0.05,      "M4": 0.02,
  "M5": 0.03,      "M6": 0.02,      "M7": 0.01,      "M8": 0.01,      "Mave": 0.01
};




// DOM refs
const spectralType = document.getElementById('spectralType');
const subType      = document.getElementById('subType');
const lumAvg       = document.getElementById('lumAvg');
const btnTypeShow  = document.getElementById('btnTypeShow');
const typeResult   = document.getElementById('typeResult');
const minR         = document.getElementById('minR');
const maxR         = document.getElementById('maxR');
const btnShowMin   = document.getElementById('btnShowMin');
const btnShowMax   = document.getElementById('btnShowMax');
const btnShowAll   = document.getElementById('btnShowAll');
const unitSelect   = document.getElementById('unitSelect');
const btnUpdate    = document.getElementById('btnUpdate');
const loDetails    = document.getElementById('loDetails');

const canvas = document.getElementById('hzCanvas');
const ctx    = canvas.getContext('2d');
canvas.width  = canvas.parentElement.clientWidth;
canvas.height = 300;

// Layout constants
const STAR_RADIUS  = 20;
const MARGIN_LEFT  = STAR_RADIUS + 20;
const MARGIN_RIGHT = 20;

// 1) Compute HZ radii
function computeHZ(L) {
  const s = Math.sqrt(L);
  return { inner: 0.75 * s, outer: 1.77 * s };
}

// 2) Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// 3) Draw baseline & star
function drawBase() {
  const y = canvas.height / 2;
  // baseline
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT, y);
  ctx.lineTo(canvas.width - MARGIN_RIGHT, y);
  ctx.strokeStyle = '#333';
  ctx.lineWidth   = 2;
  ctx.stroke();
  // star
  ctx.beginPath();
  ctx.arc(MARGIN_LEFT, y, STAR_RADIUS, 0, 2 * Math.PI);
  ctx.fillStyle   = '#FFD700';
  ctx.fill();
  ctx.strokeStyle = '#FFA500';
  ctx.lineWidth   = 2;
  ctx.stroke();
  return y;
}

// 4) Draw shading between inner & outer
function drawHZ(y, pxMin, pxMax) {
  ctx.beginPath();
  ctx.moveTo(MARGIN_LEFT + pxMin, y);
  ctx.arc(MARGIN_LEFT, y, pxMin, 0, Math.PI, true);
  ctx.lineTo(MARGIN_LEFT + pxMax, y);
  ctx.arc(MARGIN_LEFT, y, pxMax, Math.PI, 0, false);
  ctx.closePath();
  ctx.fillStyle = 'rgba(144,238,144,0.5)';
  ctx.fill();
}

// 5) Draw a half‐arc boundary
function drawHalfArc(y, px, color) {
  ctx.beginPath();
  ctx.arc(MARGIN_LEFT, y, px, Math.PI / 2, -Math.PI / 2, true);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.stroke();
}
function drawMarkerWithLabel(y, px, color, degLabel, dist) {
  const r  = 8;
  const cx = MARGIN_LEFT + px;

  // curved tick
  ctx.beginPath();
  ctx.arc(cx, y, r, Math.PI*1.25, Math.PI*1.75, false);
  ctx.strokeStyle = color;
  ctx.lineWidth   = 2;
  ctx.stroke();

  // degree label ABOVE tick, shifted right 20px
  ctx.fillStyle = '#007bff';
  ctx.font      = '14px Arial';
  let tw = ctx.measureText(degLabel).width;
  let dxDeg = cx - tw/2 - 20;            // shift 20px right
  ctx.fillText(degLabel, dxDeg, y - r - 16);

  // distance label BELOW tick
  const unit     = unitSelect.value.toUpperCase();
  const distText = `${dist.toFixed(2)} ${unit}`;
  tw = ctx.measureText(distText).width;
  let dx = cx - tw/2 - 40;               // shift left 20px
  if (dx < MARGIN_LEFT) dx = MARGIN_LEFT;
  if (dx + tw > canvas.width - MARGIN_RIGHT) {
    dx = canvas.width - MARGIN_RIGHT - tw;
  }
  const dy = y + r + 40;
  ctx.fillText(distText, dx, dy);
}


// 7) Render functions
function showInner(rMin, rMax) {
  clearCanvas();
  const y     = drawBase();
  const scale = (canvas.width - MARGIN_LEFT - MARGIN_RIGHT) / rMax;
  const pxMin = rMin * scale;
  drawHalfArc(y, pxMin, '#006400');
  drawMarkerWithLabel(y, pxMin, '#006400', '100°', rMin);
}

function showOuter(rMin, rMax) {
  clearCanvas();
  const y     = drawBase();
  const scale = (canvas.width - MARGIN_LEFT - MARGIN_RIGHT) / rMax;
  const pxMax = rMax * scale;
  drawHalfArc(y, pxMax, '#228B22');
  drawMarkerWithLabel(y, pxMax, '#228B22', '0°', rMax);
}

function showAll(rMin, rMax) {
  clearCanvas();
  const y     = drawBase();
  const scale = (canvas.width - MARGIN_LEFT - MARGIN_RIGHT) / rMax;
  const pxMin = rMin * scale;
  const pxMax = rMax * scale;
  drawHZ(y, pxMin, pxMax);
  drawHalfArc(y, pxMin, '#006400');
  drawHalfArc(y, pxMax, '#228B22');
  drawMarkerWithLabel(y, pxMin, '#006400', '100°', rMin);
  drawMarkerWithLabel(y, pxMax, '#228B22', '0°', rMax);
}

// 8) Update on "Show"
btnTypeShow.addEventListener('click', () => {
  const key = spectralType.value + subType.value;
  const avg = avgLumData[key] || 0;
  lumAvg.value = avg ? avg.toFixed(2) : '–';
  const { inner, outer } = computeHZ(avg);
  minR.value = inner.toFixed(2);
  maxR.value = outer.toFixed(2);
  typeResult.innerHTML = `
    <div><strong>rₘᵢₙ:</strong> ${inner.toFixed(2)} AU</div>
    <div><strong>rₒᵤₜ:</strong> ${outer.toFixed(2)} AU</div>
  `;
});

// 9) Button handlers
btnShowMin.addEventListener('click', () =>
  showInner(parseFloat(minR.value), parseFloat(maxR.value))
);
btnShowMax.addEventListener('click', () =>
  showOuter(parseFloat(minR.value), parseFloat(maxR.value))
);
btnShowAll.addEventListener('click', () =>
  showAll(parseFloat(minR.value), parseFloat(maxR.value))
);

// 10) Update details panel
btnUpdate.addEventListener('click', () => {
  const rMin  = parseFloat(minR.value);
  const rMax  = parseFloat(maxR.value);
  const width = (rMax - rMin).toFixed(2);
  const unit  = unitSelect.value.toUpperCase();
  loDetails.innerHTML = `
    <div><strong>Inner (100 °C):</strong> ${rMin.toFixed(2)} ${unit}</div>
    <div><strong>Outer (0 °C):</strong> ${rMax.toFixed(2)} ${unit}</div>
    <div><strong>Width:</strong> ${width} ${unit}</div>
  `;
});

// 11) Reset on change
[spectralType, subType].forEach(el =>
  el.addEventListener('change', () => {
    lumAvg.value        = '–';
    minR.value          = '';
    maxR.value          = '';
    typeResult.innerHTML = '';
    loDetails.innerHTML  = '';
    clearCanvas();
  })
);