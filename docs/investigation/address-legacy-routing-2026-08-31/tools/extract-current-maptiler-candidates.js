const fs = require("fs");
const path = require("path");

const inputDirectory = process.argv[2];
const outputPath = process.argv[3];

if (!inputDirectory || !outputPath) {
  throw new Error("Usage: extract-current-maptiler-candidates.js <raw-maptiler-dir> <output.json>");
}

const expectedLegacy = {
  "thu-dau-mot": ["Bình Dương", "Thủ Dầu Một", "Phú Cường"],
  "vung-tau": ["Bà Rịa - Vũng Tàu", "Vũng Tàu", "Thắng Tam"],
  "bac-giang": ["Bắc Giang", "Bắc Giang", "Ngô Quyền"],
  "phan-thiet": ["Bình Thuận", "Phan Thiết", "Bình Hưng"],
  "vi-thanh": ["Hậu Giang", "Vị Thanh", "Vị Tân"],
};

function featureType(item) {
  if (Array.isArray(item.place_type) && item.place_type.length > 0) return item.place_type[0];
  if (typeof item.id === "string" && item.id.includes(".")) return item.id.split(".")[0];
  return null;
}

function collect(item, candidates) {
  const name = typeof item.text === "string" ? item.text.trim() : "";
  const type = featureType(item);
  if (!name || !type) return;

  if (type === "region") candidates.province.add(name);
  else if (["subregion", "county", "joint_municipality", "municipal_district"].includes(type)) {
    candidates.district.add(name);
  } else if (["joint_submunicipality", "locality", "neighbourhood", "place"].includes(type)) {
    candidates.ward.add(name);
  } else if (type === "municipality") {
    if (/^(phường|xã|thị trấn)\b/i.test(name)) candidates.ward.add(name);
    else if (/^(quận|huyện|thị xã|thành phố|tp\.?)\b/i.test(name)) candidates.district.add(name);
    else {
      candidates.district.add(name);
      candidates.ward.add(name);
    }
  }
}

const results = [];
for (const [slug, legacy] of Object.entries(expectedLegacy)) {
  const raw = JSON.parse(fs.readFileSync(path.join(inputDirectory, `${slug}.json`), "utf8"));
  const candidates = { province: new Set(), district: new Set(), ward: new Set() };
  for (const feature of raw.features ?? []) {
    collect(feature, candidates);
    for (const context of feature.context ?? []) collect(context, candidates);
  }
  const arrays = Object.fromEntries(Object.entries(candidates).map(([key, value]) => [key, [...value]]));
  results.push({
    slug,
    expectedLegacy: { province: legacy[0], district: legacy[1], ward: legacy[2] },
    currentAddressResolutionCandidates: arrays,
    containsExpectedLegacyProvince: arrays.province.includes(legacy[0]),
    containsExpectedLegacyDistrict: arrays.district.includes(legacy[1]),
    containsExpectedLegacyWard: arrays.ward.includes(legacy[2]),
  });
}

fs.writeFileSync(outputPath, JSON.stringify({ results }, null, 2));
console.log(JSON.stringify({ results }, null, 2));
