const fs = require('fs');

const [datasetPath, targetsPath, outputPath] = process.argv.slice(2);
if (!datasetPath || !targetsPath) {
  throw new Error('Usage: node representative-points.js <geojson> <targets.json> [output.json]');
}

const collection = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

function normalized(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').replace(/[^a-z0-9]/gi, '').toLowerCase();
}

function signedArea(ring) {
  let area = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    area += ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
  }
  return area / 2;
}

function centroid(ring) {
  let x = 0;
  let y = 0;
  let factorSum = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const factor = ring[j][0] * ring[i][1] - ring[i][0] * ring[j][1];
    x += (ring[j][0] + ring[i][0]) * factor;
    y += (ring[j][1] + ring[i][1]) * factor;
    factorSum += factor;
  }
  return factorSum ? [x / (3 * factorSum), y / (3 * factorSum)] : ring[0];
}

function pointOnSegment(x, y, ax, ay, bx, by) {
  const squaredLength = (bx - ax) ** 2 + (by - ay) ** 2;
  if (squaredLength < 1e-20) return Math.abs(x - ax) < 1e-10 && Math.abs(y - ay) < 1e-10;
  const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
  if (Math.abs(cross) > 1e-10) return false;
  const dot = (x - ax) * (bx - ax) + (y - ay) * (by - ay);
  return dot >= 0 && dot <= squaredLength;
}

function ringContains(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (pointOnSegment(x, y, xi, yi, xj, yj)) return true;
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function polygonContains(polygon, point) {
  return ringContains(polygon[0], point[0], point[1])
    && !polygon.slice(1).some((hole) => ringContains(hole, point[0], point[1]));
}

function representativePoint(geometry) {
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.coordinates;
  const polygon = polygons.slice().sort((a, b) => Math.abs(signedArea(b[0])) - Math.abs(signedArea(a[0])))[0];
  const candidate = centroid(polygon[0]);
  if (polygonContains(polygon, candidate)) return candidate;

  const xs = polygon[0].map((point) => point[0]);
  const ys = polygon[0].map((point) => point[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  for (let radius = 0; radius <= 30; radius += 1) {
    for (let dx = -radius; dx <= radius; dx += 1) {
      for (let dy = -radius; dy <= radius; dy += 1) {
        const point = [
          (minX + maxX) / 2 + dx * (maxX - minX) / 62,
          (minY + maxY) / 2 + dy * (maxY - minY) / 62,
        ];
        if (polygonContains(polygon, point)) return point;
      }
    }
  }
  throw new Error('Unable to find representative point');
}

const results = targets.map((target) => {
  const matches = collection.features.filter((feature) =>
    normalized(feature.properties.NAME_1) === normalized(target.oldProvince)
    && normalized(feature.properties.NAME_2) === normalized(target.oldDistrict)
    && normalized(feature.properties.NAME_3) === normalized(target.oldWard));
  if (matches.length !== 1) throw new Error(`Expected one feature for ${target.oldWard}, found ${matches.length}`);
  const [lng, lat] = representativePoint(matches[0].geometry);
  return { ...target, lat, lng, gadm: matches[0].properties };
});

const payload = `${JSON.stringify(results, null, 2)}\n`;
if (outputPath) fs.writeFileSync(outputPath, payload, 'utf8');
process.stdout.write(payload);
