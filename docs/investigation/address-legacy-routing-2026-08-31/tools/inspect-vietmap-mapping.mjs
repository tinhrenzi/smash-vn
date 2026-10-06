import fs from "node:fs/promises";
import {
  FileBlob,
  SpreadsheetFile,
} from "file:///C:/Users/NITRO%205/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs";

const workbookPath = process.argv[2];
const outputPath = process.argv[3];

if (!workbookPath || !outputPath) {
  throw new Error("Usage: inspect-vietmap-mapping.mjs <workbook.xlsx> <output.json>");
}

const input = await FileBlob.load(workbookPath);
const workbook = await SpreadsheetFile.importXlsx(input);
const sheets = [];

for (const sheet of workbook.worksheets.items) {
  const usedRange = sheet.getUsedRange(true);
  const values = usedRange ? usedRange.values : [];
  const matchingRows = [];

  for (let rowIndex = 0; rowIndex < values.length; rowIndex += 1) {
    const row = values[rowIndex];
    const joined = row.map((value) => String(value ?? "")).join(" | ");
    if (/Thủ Dầu Một|Phú Cường|Phú Thọ|Chánh Nghĩa|Vũng Tàu|Bắc Giang|Phan Thiết|Vị Thanh|Vị Tân/i.test(joined)) {
      matchingRows.push({ rowNumber: rowIndex + 1, values: row });
    }
  }

  sheets.push({
    name: sheet.name,
    rowCount: values.length,
    columnCount: values.reduce((max, row) => Math.max(max, row.length), 0),
    headerRows: values.slice(0, 5),
    matchingRows,
  });
}

await fs.writeFile(
  outputPath,
  JSON.stringify({ source: workbookPath, sheets }, null, 2),
  "utf8",
);

console.log(JSON.stringify({
  sheetCount: sheets.length,
  sheets: sheets.map(({ name, rowCount, columnCount, matchingRows }) => ({
    name,
    rowCount,
    columnCount,
    matchingRowCount: matchingRows.length,
  })),
}, null, 2));
