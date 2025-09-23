import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseTabularFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    return new Promise((resolve) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => resolve(results.data || []),
      });
    });
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    const arrayBuffer = await file.arrayBuffer();
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json(ws, { defval: "" });
    return json;
  }
  throw new Error("Unsupported file type. Please upload .csv, .xlsx or .xls");
}
