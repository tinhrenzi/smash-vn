const fs = require("fs");
const path = require("path");

const inputDirectory = process.argv[2];
const outputPath = process.argv[3];
if (!inputDirectory || !outputPath) throw new Error("Usage: analyze-maptiler-full-responses.js <raw-dir> <output.json>");

const files = fs.readdirSync(inputDirectory)
  .filter((name) => name.endsWith(".json") && !name.startsWith("multi-"))
  .sort();

function unique(values) {
  return [...new Set(values)].sort();
}

function fieldPaths(value, prefix = "", output = []) {
  if (!value || typeof value !== "object") return output;
  if (Array.isArray(value)) {
    for (const item of value) fieldPaths(item, `${prefix}[]`, output);
    return output;
  }
  for (const [key, child] of Object.entries(value)) {
    const fieldPath = prefix ? `${prefix}.${key}` : key;
    output.push(fieldPath);
    fieldPaths(child, fieldPath, output);
  }
  return output;
}

const cases = files.map((fileName) => {
  const body = fs.readFileSync(path.join(inputDirectory, fileName), "utf8");
  const raw = JSON.parse(body);
  const features = raw.features ?? [];
  const paths = unique(fieldPaths(raw));
  const featureKeys = unique(features.flatMap((feature) => Object.keys(feature)));
  const propertyKeys = unique(features.flatMap((feature) => Object.keys(feature.properties ?? {})));
  const contextKeys = unique(features.flatMap((feature) => (feature.context ?? []).flatMap((item) => Object.keys(item))));
  const providerIdentifiers = features.map((feature) => ({
    id: feature.id ?? null,
    ref: feature.properties?.ref ?? null,
    wikidata: feature.properties?.wikidata ?? null,
  })).filter((item) => item.id || item.ref || item.wikidata);

  return {
    case: path.basename(fileName, ".json"),
    bytes: Buffer.byteLength(body),
    featureCount: features.length,
    featureKeys,
    propertyKeys,
    contextKeys,
    hasContext: paths.some((item) => item.includes("context")),
    hasParentField: paths.some((item) => /(^|\.)parent($|\.)/i.test(item)),
    hasAlternateNameField: paths.some((item) => /(^|\.)(alternate|alt_name|old_name|former_name|previous_name)($|\.)/i.test(item)),
    hasMatchingNameField: paths.some((item) => /(^|\.)(matching_text|matching_place_name)($|\.)/i.test(item)),
    hasVietnamAdminCodeField: paths.some((item) => /(^|\.)(province_code|district_code|ward_code|admin_code)($|\.)/i.test(item)),
    providerIdentifiers,
  };
});

fs.writeFileSync(outputPath, JSON.stringify({ cases }, null, 2));
console.log(JSON.stringify({ cases: cases.map((item) => ({
  case: item.case,
  featureCount: item.featureCount,
  hasContext: item.hasContext,
  hasParentField: item.hasParentField,
  hasAlternateNameField: item.hasAlternateNameField,
  hasMatchingNameField: item.hasMatchingNameField,
  hasVietnamAdminCodeField: item.hasVietnamAdminCodeField,
})) }, null, 2));
