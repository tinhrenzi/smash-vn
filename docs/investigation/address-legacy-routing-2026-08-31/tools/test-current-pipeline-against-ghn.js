import fs from "node:fs";

const envPath = process.argv[2];
const candidatePath = process.argv[3];
const provinceResponsePath = process.argv[4];
const outputPath = process.argv[5];

if (!envPath || !candidatePath || !provinceResponsePath || !outputPath) {
  throw new Error("Usage: test-current-pipeline-against-ghn.js <.env> <candidates.json> <provinces.json> <output.json>");
}

function readEnv(filePath) {
  const values = {};
  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (match) values[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

function normalize(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/đ/g, "d")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\bt\s*p\b/g, " thanh pho ")
    .replace(/\btp\b/g, " thanh pho ")
    .replace(/\bq\b/g, " quan ")
    .replace(/\bp\b/g, " phuong ")
    .replace(/\bh\b/g, " huyen ")
    .replace(/\btx\b/g, " thi xa ")
    .replace(/\s+/g, " ")
    .trim();
}

function core(value) {
  return normalize(value).replace(/^(tinh|thanh pho|quan|huyen|thi xa|phuong|xa|thi tran)\s+/, "").trim();
}

function score(left, right) {
  const normalizedLeft = normalize(left);
  const normalizedRight = normalize(right);
  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 100;
  const coreLeft = core(left);
  const coreRight = core(right);
  return coreLeft && coreLeft === coreRight ? 90 : 0;
}

function aliases(item, nameKey) {
  return [item[nameKey], ...(Array.isArray(item.NameExtension) ? item.NameExtension : [item.NameExtension])]
    .filter((value) => value !== null && value !== undefined && String(value).trim());
}

function findUnique(items, nameKey, idKey, candidates) {
  for (const candidate of candidates ?? []) {
    let best = null;
    let bestScore = 0;
    let ambiguous = false;
    for (const item of items ?? []) {
      const itemScore = Math.max(0, ...aliases(item, nameKey).map((alias) => score(candidate, alias)));
      if (itemScore > bestScore) {
        best = item;
        bestScore = itemScore;
        ambiguous = false;
      } else if (itemScore > 0 && itemScore === bestScore && best && String(item[idKey]) !== String(best[idKey])) {
        ambiguous = true;
      }
    }
    if (bestScore > 0 && !ambiguous) return { item: best, candidate, score: bestScore };
  }
  return null;
}

const env = readEnv(envPath);
const baseUrl = env.GHN_BASE_URL;
const token = env.GHN_TOKEN;
if (!baseUrl || !token) throw new Error("GHN_BASE_URL or GHN_TOKEN is not configured");

async function masterData(endpoint, body) {
  const response = await fetch(`${baseUrl}/shiip/public-api/master-data/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", token },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!response.ok || json.code !== 200) throw new Error(`${endpoint} returned HTTP ${response.status}, code ${json.code}`);
  return json.data ?? [];
}

const candidates = JSON.parse(fs.readFileSync(candidatePath, "utf8")).results;
const provinces = JSON.parse(fs.readFileSync(provinceResponsePath, "utf8")).data;
const districtCache = new Map();
const wardCache = new Map();

async function districts(provinceId) {
  if (!districtCache.has(provinceId)) districtCache.set(provinceId, await masterData("district", { province_id: provinceId }));
  return districtCache.get(provinceId);
}

async function wards(districtId) {
  if (!wardCache.has(districtId)) wardCache.set(districtId, await masterData("ward", { district_id: districtId }));
  return wardCache.get(districtId);
}

const results = [];
for (const test of candidates) {
  const provinceMatch = findUnique(provinces, "ProvinceName", "ProvinceID", test.currentAddressResolutionCandidates.province);
  if (!provinceMatch) {
    results.push({ slug: test.slug, resolutionLevel: "NONE", fullyResolved: false });
    continue;
  }

  const province = provinceMatch.item;
  const provinceDistricts = await districts(province.ProvinceID);
  let districtMatch = findUnique(provinceDistricts, "DistrictName", "DistrictID", test.currentAddressResolutionCandidates.district);
  let wardMatch = null;
  let inferredFromWard = false;

  if (!districtMatch) {
    const inferred = [];
    for (const district of provinceDistricts) {
      const match = findUnique(await wards(district.DistrictID), "WardName", "WardCode", test.currentAddressResolutionCandidates.ward);
      if (match) inferred.push({ district, wardMatch: match });
    }
    if (inferred.length === 1) {
      districtMatch = { item: inferred[0].district, candidate: null, score: null };
      wardMatch = inferred[0].wardMatch;
      inferredFromWard = true;
    }
  } else {
    wardMatch = findUnique(await wards(districtMatch.item.DistrictID), "WardName", "WardCode", test.currentAddressResolutionCandidates.ward);
  }

  results.push({
    slug: test.slug,
    expectedLegacy: test.expectedLegacy,
    resolutionLevel: wardMatch ? "WARD" : districtMatch ? "DISTRICT" : "PROVINCE",
    fullyResolved: Boolean(wardMatch),
    inferredFromWard,
    matched: {
      provinceId: province.ProvinceID,
      provinceName: province.ProvinceName,
      districtId: districtMatch?.item.DistrictID ?? null,
      districtName: districtMatch?.item.DistrictName ?? null,
      wardCode: wardMatch?.item.WardCode ?? null,
      wardName: wardMatch?.item.WardName ?? null,
    },
  });
}

fs.writeFileSync(outputPath, JSON.stringify({
  testedAt: new Date().toISOString(),
  baseHost: new URL(baseUrl).host,
  algorithm: "Equivalent to current AddressResolutionService + GhnService exact normalized matching",
  results,
}, null, 2));

console.log(JSON.stringify({ results }, null, 2));
