const fs = require('fs');

const [datasetPath, pointsPath, outputPath] = process.argv.slice(2);
if (!datasetPath || !pointsPath) {
  throw new Error('Usage: node point-in-polygon.js <geojson> <points.json>');
}

const collection = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));
const points = JSON.parse(fs.readFileSync(pointsPath, 'utf8'));

function pointOnSegment(x, y, ax, ay, bx, by) {
  const squaredLength = (bx - ax) ** 2 + (by - ay) ** 2;
  if (squaredLength < 1e-20) {
    return Math.abs(x - ax) < 1e-10 && Math.abs(y - ay) < 1e-10;
  }
  const cross = (x - ax) * (by - ay) - (y - ay) * (bx - ax);
  if (Math.abs(cross) > 1e-10) return false;
  const dot = (x - ax) * (bx - ax) + (y - ay) * (by - ay);
  if (dot < 0) return false;
  return dot <= squaredLength;
}

function ringContains(ring, x, y) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (pointOnSegment(x, y, xi, yi, xj, yj)) return true;
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function polygonContains(polygon, x, y) {
  if (!polygon.length || !ringContains(polygon[0], x, y)) return false;
  return !polygon.slice(1).some((hole) => ringContains(hole, x, y));
}

function geometryContains(geometry, x, y) {
  if (!geometry) return false;
  if (geometry.type === 'Polygon') return polygonContains(geometry.coordinates, x, y);
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.some((polygon) => polygonContains(polygon, x, y));
  }
  return false;
}

const results = points.map((point) => ({
  ...point,
  matches: collection.features
    .filter((feature) => geometryContains(feature.geometry, point.lng, point.lat))
    .map((feature) => feature.properties),
}));

const payload = `${JSON.stringify(results, null, 2)}\n`;
if (outputPath) fs.writeFileSync(outputPath, payload, 'utf8');
process.stdout.write(payload);
