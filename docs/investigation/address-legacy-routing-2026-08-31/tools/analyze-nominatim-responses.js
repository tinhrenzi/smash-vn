const fs = require("fs");
const path = require("path");

const inputDirectory = process.argv[2];
const outputPath = process.argv[3];
if (!inputDirectory || !outputPath) throw new Error("Usage: analyze-nominatim-responses.js <raw-dir> <output.json>");

const cases = fs.readdirSync(inputDirectory)
  .filter((name) => name.endsWith(".json") && !name.startsWith("multi-"))
  .sort()
  .map((fileName) => {
    const raw = JSON.parse(fs.readFileSync(path.join(inputDirectory, fileName), "utf8"));
    const address = raw.address ?? {};
    return {
      case: path.basename(fileName, ".json"),
      displayName: raw.display_name ?? null,
      provinceOrState: address.state ?? null,
      wardOrSuburb: address.city_district ?? address.suburb ?? address.village ?? null,
      districtOrCounty: address.county ?? address.state_district ?? null,
      cityOrTown: address.city ?? address.town ?? null,
      neighbourhood: address.neighbourhood ?? null,
      iso3166Level4: address["ISO3166-2-lvl4"] ?? null,
      countryCode: address.country_code ?? null,
      address,
      namedetails: raw.namedetails ?? null,
      extratags: raw.extratags ?? null,
    };
  });

fs.writeFileSync(outputPath, JSON.stringify({ cases }, null, 2));
console.log(JSON.stringify({ cases: cases.map(({ case: caseName, provinceOrState, wardOrSuburb, districtOrCounty, cityOrTown, neighbourhood, iso3166Level4 }) => ({
  case: caseName,
  provinceOrState,
  wardOrSuburb,
  districtOrCounty,
  cityOrTown,
  neighbourhood,
  iso3166Level4,
})) }, null, 2));
