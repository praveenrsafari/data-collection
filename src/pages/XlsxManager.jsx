import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import FolderDeleteIcon from "@mui/icons-material/FolderDelete";
import * as XLSX from "xlsx";
// import defaultWorkbookUrl from "../assets/Jogivaripalli Committee updated.xlsx?url";

// ExcelJS CDN loader (avoids bundler resolution issues)
let excelJsLoadingPromise = null;
function loadExcelJSFromCDN() {
  if (window.ExcelJS) return Promise.resolve(window.ExcelJS);
  if (!excelJsLoadingPromise) {
    excelJsLoadingPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js";
      script.async = true;
      script.onload = () => resolve(window.ExcelJS);
      script.onerror = () =>
        reject(new Error("Failed to load ExcelJS from CDN"));
      document.head.appendChild(script);
    });
  }
  return excelJsLoadingPromise;
}

function deriveColumns(rows) {
  const columnSet = new Set();
  rows.forEach((row) =>
    Object.keys(row || {}).forEach((k) => columnSet.add(k))
  );
  return Array.from(columnSet);
}

function sanitizeHeader(base, index) {
  const name = String(base ?? "").trim();
  return name || `Column${index + 1}`;
}

function makeUniqueHeaders(rawHeaders) {
  const result = [];
  const used = new Map();
  rawHeaders.forEach((h, i) => {
    let base = sanitizeHeader(h, i);
    let name = base;
    let counter = used.get(base) || 0;
    while (result.includes(name)) {
      counter += 1;
      name = `${base}_${counter}`;
    }
    used.set(base, counter);
    result.push(name);
  });
  return result;
}

// column width helpers
function getColWidthsFromSheet(sheet) {
  const cols = sheet["!cols"] || [];
  return cols.map((c) => ({ wpx: c?.wpx, wch: c?.wch }));
}

function applyColWidthsToSheet(sheet, widths) {
  if (Array.isArray(widths) && widths.length) {
    sheet["!cols"] = widths.map((w) => ({
      ...(w?.wch ? { wch: w.wch } : {}),
      ...(w?.wpx ? { wpx: w.wpx } : {}),
    }));
  }
}

function getRowHeightsFromSheet(sheet) {
  const rows = sheet["!rows"] || [];
  return rows.map((r) => ({ hpx: r?.hpx, hpt: r?.hpt }));
}

function applyRowHeightsToSheet(sheet, heights) {
  if (Array.isArray(heights) && heights.length) {
    sheet["!rows"] = heights.map((h) => ({
      ...(h?.hpt ? { hpt: h.hpt } : {}),
      ...(h?.hpx ? { hpx: h.hpx } : {}),
    }));
  }
}

// merges helpers
function getMergesFromSheet(sheet) {
  return Array.isArray(sheet["!merges"])
    ? sheet["!merges"].map((m) => ({
        s: { r: m.s.r, c: m.s.c },
        e: { r: m.e.r, c: m.e.c },
      }))
    : [];
}

function applyMergesToSheet(sheet, merges) {
  if (Array.isArray(merges) && merges.length) {
    sheet["!merges"] = merges.map((m) => ({
      s: { r: m.s.r, c: m.s.c },
      e: { r: m.e.r, c: m.e.c },
    }));
  }
}

// Preserve header order, ensure unique headers; capture merges and dims
function toWorkbookDataWithMeta(workbook) {
  const data = {};
  workbook.SheetNames.forEach((name) => {
    const sheet = workbook.Sheets[name];
    const aoa = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
      blankrows: false,
    });
    const totalRows = Array.isArray(aoa) ? aoa.length : 0;
    const headerAoA = totalRows >= 4 ? aoa.slice(0, 4) : aoa || [];
    const footerRowAoA = totalRows >= 5 ? aoa[totalRows - 1] : [];

    // Columns come from 4th header row if present, else derive
    const headerRow = Array.isArray(headerAoA[3]) ? headerAoA[3] : [];
    const columns = headerRow.length
      ? makeUniqueHeaders(headerRow)
      : makeUniqueHeaders(
          deriveColumns(XLSX.utils.sheet_to_json(sheet, { defval: "" }))
        );

    // Records are between headers and footer
    const startIdx = 4; // 0-based index -> 5th row
    const endIdx = totalRows >= 5 ? totalRows - 1 : totalRows; // exclude footer if present
    const bodyAoA = (aoa || []).slice(startIdx, endIdx);

    const rows = bodyAoA.map((arr) => {
      const obj = {};
      columns.forEach((c, i) => {
        obj[c] = arr && typeof arr[i] !== "undefined" ? arr[i] : "";
      });
      return obj;
    });

    const merges = getMergesFromSheet(sheet);
    const colWidths = getColWidthsFromSheet(sheet);
    const rowHeights = getRowHeightsFromSheet(sheet);

    data[name] = {
      rows,
      columns,
      merges,
      colWidths,
      rowHeights,
      styles: {},
      headerAoA,
      footerRowAoA,
      footerRowIndex1: totalRows > 0 ? totalRows : 0, // original last row index (1-based)
    };
  });
  return data;
}

// ExcelJS style helpers
function coordKey(r, c) {
  return `${r},${c}`;
}

function extractStyleFromCell(cell) {
  const style = {};
  if (cell.font) style.font = { ...cell.font };
  if (cell.alignment) style.alignment = { ...cell.alignment };
  if (cell.fill) style.fill = JSON.parse(JSON.stringify(cell.fill));
  if (cell.border) style.border = JSON.parse(JSON.stringify(cell.border));
  if (cell.numFmt) style.numFmt = cell.numFmt;
  return style;
}

async function extractExcelJsStylesBySheet(arrayBuffer) {
  try {
    const ExcelJS = await loadExcelJSFromCDN();
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(arrayBuffer);
    const result = {};
    wb.eachSheet((ws) => {
      const sheetStyles = {};
      const rowCount = ws.rowCount || 0;
      const colCount = (ws.columns || []).length || 0;
      for (let r = 1; r <= rowCount; r += 1) {
        const row = ws.getRow(r);
        for (let c = 1; c <= colCount; c += 1) {
          const cell = row.getCell(c);
          if (
            cell &&
            (cell.font ||
              cell.fill ||
              cell.border ||
              cell.alignment ||
              cell.numFmt)
          ) {
            sheetStyles[coordKey(r, c)] = extractStyleFromCell(cell);
          }
        }
      }
      result[ws.name] = sheetStyles;
    });
    return result;
  } catch (e) {
    console.warn("ExcelJS style extraction failed", e);
    return {};
  }
}

// Metadata extraction from first two detail rows (3rd and 4th rows overall)
function extractMetaFromAoA(aoa) {
  const meta = { district: "", constituency: "", mandal: "", panchayat: "" };
  const rows = Array.isArray(aoa) ? aoa : [];
  const detailRows = [rows[2] || [], rows[3] || []];
  const setIfEmpty = (key, val) => {
    if (!meta[key] && val) meta[key] = String(val).trim();
  };
  detailRows.forEach((r) => {
    const arr = Array.isArray(r) ? r : [];
    for (let i = 0; i < arr.length; i += 1) {
      const cell = String(arr[i] ?? "").toLowerCase();
      const next = arr[i + 1];
      if (cell.includes("district")) {
        const v = cell.includes(":")
          ? cell.split(":").slice(1).join(":")
          : next;
        setIfEmpty("district", v);
      }
      if (cell.includes("constituency")) {
        const v = cell.includes(":")
          ? cell.split(":").slice(1).join(":")
          : next;
        setIfEmpty("constituency", v);
      }
      if (cell.includes("mandal")) {
        const v = cell.includes(":")
          ? cell.split(":").slice(1).join(":")
          : next;
        setIfEmpty("mandal", v);
      }
      if (cell.includes("panchayat")) {
        const v = cell.includes(":")
          ? cell.split(":").slice(1).join(":")
          : next;
        setIfEmpty("panchayat", v);
      }
    }
  });
  return meta;
}

function extractWorkbookMetaFromSheets(sheetsObj) {
  const names = Object.keys(sheetsObj || {});
  for (let i = 0; i < names.length; i += 1) {
    const name = names[i];
    const headerAoA = sheetsObj[name]?.headerAoA;
    const meta = extractMetaFromAoA(headerAoA);
    const hasAny = Object.values(meta).some((v) => !!String(v || "").trim());
    if (hasAny) return meta;
  }
  return { district: "", constituency: "", mandal: "", panchayat: "" };
}

// Lightweight, memoized cell editor that commits on blur/Enter
const CellEditor = React.memo(function CellEditor({ value, onCommit }) {
  const [val, setVal] = useState(value ?? "");
  useEffect(() => {
    setVal(value ?? "");
  }, [value]);
  const handleBlur = useCallback(() => {
    if ((val ?? "") !== (value ?? "")) onCommit(val);
  }, [val, value, onCommit]);
  const handleKeyDown = useCallback((e) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  }, []);
  return (
    <input
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      style={{
        width: "100%",
        padding: 6,
        border: "1px solid #e0e0e0",
        borderRadius: 4,
        fontSize: 14,
      }}
    />
  );
});

// Virtualized body for large datasets (no extra deps)
function VirtualBody({
  rows,
  columns,
  rowHeight = 44,
  onDeleteRow,
  onCommitCell,
}) {
  const containerRef = useRef(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [containerH, setContainerH] = useState(480);

  useEffect(() => {
    function measure() {
      const el = containerRef.current;
      if (el) setContainerH(el.clientHeight);
    }
    measure();
    const onResize = () => measure();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const total = rows.length;
  const visibleCount = Math.max(1, Math.ceil(containerH / rowHeight) + 6);
  const start = Math.max(0, Math.floor(scrollTop / rowHeight));
  const end = Math.min(total, start + visibleCount);

  const gridTemplate = useMemo(
    () => `repeat(${columns.length}, minmax(140px, 1fr)) 56px`,
    [columns.length]
  );

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "60vh",
        overflow: "auto",
        position: "relative",
        borderTop: "1px solid #eee",
      }}
      onScroll={handleScroll}
    >
      <Box sx={{ height: total * rowHeight, position: "relative" }}>
        <Box
          sx={{
            position: "absolute",
            top: start * rowHeight,
            left: 0,
            right: 0,
          }}
        >
          {rows.slice(start, end).map((row, idx) => {
            const rIdx = start + idx;
            return (
              <Box
                key={rIdx}
                sx={{
                  display: "grid",
                  gridTemplateColumns: gridTemplate,
                  alignItems: "center",
                  height: rowHeight,
                  px: 1,
                  borderBottom: "1px solid #f0f0f0",
                  "&:hover": { backgroundColor: "#fafafa" },
                }}
              >
                {columns.map((col, cIdx) => (
                  <Box key={`${col}__${cIdx}`} sx={{ pr: 1 }}>
                    <CellEditor
                      value={row[col] ?? ""}
                      onCommit={(v) => onCommitCell(rIdx, col, v)}
                    />
                  </Box>
                ))}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Tooltip title="Delete row">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteRow(rIdx)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}

export default function XlsxManager() {
  const [sheets, setSheets] = useState({});
  const [sheetNames, setSheetNames] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const fileInputRef = useRef(null);

  // Library of uploaded workbooks
  const [library, setLibrary] = useState([]); // {id, name, sheets, sheetNames, meta, uploadedAt}
  const [activeLibraryId, setActiveLibraryId] = useState("");
  const [filters, setFilters] = useState({
    district: "",
    constituency: "",
    mandal: "",
    panchayat: "",
  });

  // Persist/restore library
  useEffect(() => {
    try {
      const saved = localStorage.getItem("xlsx_library_v1");
      const savedActive = localStorage.getItem("xlsx_active_id_v1");
      if (saved) {
        const parsed = JSON.parse(saved);
        setLibrary(parsed);
        if (savedActive) setActiveLibraryId(savedActive);
        // Load active file sheets if available
        const active = parsed.find((x) => x.id === savedActive) || parsed[0];
        if (active) {
          setSheets(active.sheets || {});
          setSheetNames(active.sheetNames || Object.keys(active.sheets || {}));
          setActiveTab(0);
        }
        return;
      }
    } catch (_) {}
    // No saved library: do not auto-load default unless asked; but keep prior default behavior guarded
    (async () => {
      try {
        const res = await fetch(defaultWorkbookUrl);
        const arrayBuffer = await res.arrayBuffer();
        await addWorkbookFromArrayBuffer(arrayBuffer, "Default Workbook");
      } catch (e) {
        console.error("Failed to load default workbook", e);
      }
    })();
  }, []);

  // Debounced persistence to localStorage to avoid frequent heavy writes
  const saveTimerRef = useRef(null);
  useEffect(() => {
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem("xlsx_library_v1", JSON.stringify(library));
        localStorage.setItem("xlsx_active_id_v1", activeLibraryId);
      } catch (_) {}
    }, 600); // debounce 600ms
    return () => clearTimeout(saveTimerRef.current);
  }, [library, activeLibraryId]);

  const activeSheetName = useMemo(
    () => sheetNames[activeTab] || "",
    [sheetNames, activeTab]
  );
  const activeSheet = useMemo(
    () =>
      sheets[activeSheetName] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
      },
    [sheets, activeSheetName]
  );
  const activeLibraryItem = useMemo(
    () => library.find((x) => x.id === activeLibraryId),
    [library, activeLibraryId]
  );

  const distincts = useMemo(() => {
    const vals = {
      district: new Set(),
      constituency: new Set(),
      mandal: new Set(),
      panchayat: new Set(),
    };
    library.forEach((it) => {
      if (it.meta?.district) vals.district.add(String(it.meta.district).trim());
      if (it.meta?.constituency)
        vals.constituency.add(String(it.meta.constituency).trim());
      if (it.meta?.mandal) vals.mandal.add(String(it.meta.mandal).trim());
      if (it.meta?.panchayat)
        vals.panchayat.add(String(it.meta.panchayat).trim());
    });
    return {
      district: Array.from(vals.district).sort(),
      constituency: Array.from(vals.constituency).sort(),
      mandal: Array.from(vals.mandal).sort(),
      panchayat: Array.from(vals.panchayat).sort(),
    };
  }, [library]);

  const filteredLibrary = useMemo(() => {
    return library.filter((it) => {
      const m = it.meta || {};
      if (
        filters.district &&
        String(m.district || "").trim() !== filters.district
      )
        return false;
      if (
        filters.constituency &&
        String(m.constituency || "").trim() !== filters.constituency
      )
        return false;
      if (filters.mandal && String(m.mandal || "").trim() !== filters.mandal)
        return false;
      if (
        filters.panchayat &&
        String(m.panchayat || "").trim() !== filters.panchayat
      )
        return false;
      return true;
    });
  }, [library, filters]);

  function setActiveSheets(updater) {
    setSheets((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (activeLibraryId) {
        setLibrary((prevLib) =>
          prevLib.map((it) =>
            it.id === activeLibraryId
              ? { ...it, sheets: next, sheetNames: Object.keys(next) }
              : it
          )
        );
        setSheetNames(Object.keys(next));
      }
      return next;
    });
  }

  async function addWorkbookFromArrayBuffer(arrayBuffer, fileName) {
    const wb = XLSX.read(arrayBuffer, { type: "array" });
    const data = toWorkbookDataWithMeta(wb);
    const stylesBySheet = await extractExcelJsStylesBySheet(arrayBuffer);
    Object.keys(data).forEach((name) => {
      data[name].styles = stylesBySheet[name] || {};
      delete data[name]._aoa;
    });
    const meta = extractWorkbookMetaFromSheets(toWorkbookDataWithMeta(wb));
    const item = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: fileName || "Workbook",
      sheets: data,
      sheetNames: Object.keys(data),
      meta,
      uploadedAt: new Date().toISOString(),
    };
    setLibrary((prev) => [item, ...prev]);
    setActiveLibraryId(item.id);
    setSheets(item.sheets);
    setSheetNames(item.sheetNames);
    setActiveTab(0);
  }

  function handleImportFileChange(e) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (!files.length) return;
    const reader = new FileReader();
    let idx = 0;
    const next = async () => {
      if (idx >= files.length) {
        e.target.value = "";
        return;
      }
      const file = files[idx++];
      const fr = new FileReader();
      fr.onload = async (evt) => {
        try {
          await addWorkbookFromArrayBuffer(evt.target.result, file.name);
        } catch (err) {
          console.error("Error parsing file", err);
        } finally {
          next();
        }
      };
      fr.readAsArrayBuffer(file);
    };
    next();
  }

  function handleExport() {
    const wb = XLSX.utils.book_new();
    sheetNames.forEach((name) => {
      const {
        rows,
        columns,
        merges,
        colWidths,
        rowHeights,
        headerAoA,
        footerRowAoA,
      } = sheets[name] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        headerAoA: [],
        footerRowAoA: [],
      };

      // Build AOA: headers (4 rows) + body + footer
      const aoa = [];
      if (Array.isArray(headerAoA) && headerAoA.length) aoa.push(...headerAoA);
      const body = rows.map((r) => columns.map((c) => r[c]));
      aoa.push(...body);
      if (Array.isArray(footerRowAoA) && footerRowAoA.length)
        aoa.push(footerRowAoA);

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      applyColWidthsToSheet(ws, colWidths);
      applyRowHeightsToSheet(ws, rowHeights);
      try {
        applyMergesToSheet(ws, merges);
      } catch (_) {}

      XLSX.utils.book_append_sheet(wb, ws, name.substring(0, 31));
    });
    XLSX.writeFile(wb, "updated-workbook.xlsx");
  }

  async function handleStyledExport() {
    const ExcelJS = await loadExcelJSFromCDN();
    const wb = new ExcelJS.Workbook();

    sheetNames.forEach((name) => {
      const {
        rows,
        columns,
        merges,
        colWidths,
        rowHeights,
        styles,
        headerAoA,
        footerRowAoA,
        footerRowIndex1,
      } = sheets[name] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
        headerAoA: [],
        footerRowAoA: [],
        footerRowIndex1: 0,
      };
      const ws = wb.addWorksheet(name.substring(0, 31));

      if (Array.isArray(colWidths) && colWidths.length) {
        ws.columns = (
          columns.length ? columns : new Array(colWidths.length).fill(null)
        ).map((_, i) => ({
          width: colWidths[i]?.wch ? colWidths[i].wch : undefined,
        }));
      } else if (columns.length) {
        ws.columns = columns.map(() => ({ width: 20 }));
      }

      // Write header rows (1..4)
      const hdr = Array.isArray(headerAoA) ? headerAoA : [];
      hdr.forEach((rowArr, rIdx) => {
        const row = ws.addRow(rowArr || []);
        row.eachCell((cell, cIdx) => {
          const snap = styles[coordKey(rIdx + 1, cIdx)];
          if (snap)
            Object.assign(cell, {
              font: snap.font,
              alignment: snap.alignment,
              fill: snap.fill,
              border: snap.border,
              numFmt: snap.numFmt,
            });
          else {
            if (rIdx === 3) row.font = { bold: true };
          }
        });
      });

      // Write body rows starting at row 5
      rows.forEach((r, rIdx) => {
        const values = columns.map((c) => r[c]);
        const row = ws.addRow(values);
        row.eachCell((cell, cIdx) => {
          const snap = styles[coordKey(rIdx + 5, cIdx)];
          if (snap)
            Object.assign(cell, {
              font: snap.font,
              alignment: snap.alignment,
              fill: snap.fill,
              border: snap.border,
              numFmt: snap.numFmt,
            });
          else {
            cell.border = {
              top: { style: "thin", color: { argb: "FFEEEEEE" } },
              left: { style: "thin", color: { argb: "FFEEEEEE" } },
              bottom: { style: "thin", color: { argb: "FFEEEEEE" } },
              right: { style: "thin", color: { argb: "FFEEEEEE" } },
            };
          }
        });
      });

      // Footer row (last)
      if (Array.isArray(footerRowAoA) && footerRowAoA.length) {
        const row = ws.addRow(footerRowAoA);
        const estimatedOrigRow =
          footerRowIndex1 || rows.length + (headerAoA?.length || 0) + 1;
        row.eachCell((cell, cIdx) => {
          const snap = styles[coordKey(estimatedOrigRow, cIdx)];
          if (snap)
            Object.assign(cell, {
              font: snap.font,
              alignment: snap.alignment,
              fill: snap.fill,
              border: snap.border,
              numFmt: snap.numFmt,
            });
          else {
            row.font = { bold: true };
          }
        });
      }

      if (Array.isArray(rowHeights) && rowHeights.length) {
        rowHeights.forEach((h, idx) => {
          const row = ws.getRow(idx + 1);
          if (h?.hpt) row.height = h.hpt;
        });
      }

      if (Array.isArray(merges) && merges.length) {
        merges.forEach((m) => {
          try {
            ws.mergeCells(m.s.r + 1, m.s.c + 1, m.e.r + 1, m.e.c + 1);
          } catch (_) {}
        });
      }
    });

    const buffer = await wb.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "styled-workbook.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleAddRow() {
    if (!activeSheetName) return;
    setActiveSheets((prev) => {
      const sheet = prev[activeSheetName] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
      };
      const newRow = Object.fromEntries(
        (sheet.columns || []).map((c) => [c, ""])
      );
      return {
        ...prev,
        [activeSheetName]: { ...sheet, rows: [...(sheet.rows || []), newRow] },
      };
    });
  }

  function handleDeleteRow(idx) {
    if (!activeSheetName) return;
    setActiveSheets((prev) => {
      const sheet = prev[activeSheetName] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
      };
      const newRows = sheet.rows.filter((_, i) => i !== idx);
      return {
        ...prev,
        [activeSheetName]: { ...sheet, rows: newRows, merges: [] },
      };
    });
  }

  // Commit a single cell change (called by CellEditor on blur/Enter)
  const handleCellCommit = useCallback(
    (rowIdx, column, newValue) => {
      setActiveSheets((prev) => {
        const sheet = prev[activeSheetName] || {
          rows: [],
          columns: [],
          merges: [],
          colWidths: [],
          rowHeights: [],
          styles: {},
        };
        const oldVal = sheet.rows?.[rowIdx]?.[column];
        if ((oldVal ?? "") === (newValue ?? "")) return prev; // no-op
        const rows = sheet.rows.map((r, i) =>
          i === rowIdx ? { ...r, [column]: newValue } : r
        );
        return { ...prev, [activeSheetName]: { ...sheet, rows } };
      });
    },
    [activeSheetName]
  );

  function uniqueNewColumnName(existing, desiredBase) {
    const base =
      String(desiredBase || "").trim() || `Column${existing.length + 1}`;
    if (!existing.includes(base)) return base;
    let i = 2;
    let name = `${base}_${i}`;
    while (existing.includes(name)) {
      i += 1;
      name = `${base}_${i}`;
    }
    return name;
  }

  function handleAddColumn() {
    if (!activeSheetName) return;
    const suggested = `Column${(activeSheet.columns.length || 0) + 1}`;
    const entered = prompt("New column name:", suggested);
    setActiveSheets((prev) => {
      const sheet = prev[activeSheetName] || {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
      };
      const columns = [...(sheet.columns || [])];
      const newCol = uniqueNewColumnName(columns, entered);
      const newColumns = [...columns, newCol];
      const rows = (sheet.rows || []).map((r) => ({ ...r, [newCol]: "" }));
      return {
        ...prev,
        [activeSheetName]: { ...sheet, rows, columns: newColumns, merges: [] },
      };
    });
  }

  function handleAddSheet() {
    let base = "Sheet";
    let idx = 1;
    let name = `${base}${idx}`;
    const existing = new Set(sheetNames);
    while (existing.has(name)) {
      idx += 1;
      name = `${base}${idx}`;
    }
    const finalName = prompt("New sheet name:", name);
    if (!finalName) return;
    if (existing.has(finalName)) {
      alert("A sheet with this name already exists.");
      return;
    }
    setActiveSheets((prev) => ({
      ...prev,
      [finalName]: {
        rows: [],
        columns: [],
        merges: [],
        colWidths: [],
        rowHeights: [],
        styles: {},
      },
    }));
    setActiveTab(sheetNames.length);
  }

  function handleDeleteSheet() {
    if (!activeSheetName) return;
    if (!confirm(`Delete sheet "${activeSheetName}"? This cannot be undone.`))
      return;
    setActiveSheets((prev) => {
      const { [activeSheetName]: _removed, ...rest } = prev;
      const newNames = Object.keys(rest);
      setSheetNames(newNames);
      setActiveTab((prevIdx) =>
        Math.max(0, Math.min(prevIdx, newNames.length - 1))
      );
      return rest;
    });
  }

  function handleRenameSheet() {
    if (!activeSheetName) return;
    const newName = prompt("Rename sheet:", activeSheetName);
    if (!newName || newName === activeSheetName) return;
    if (sheetNames.includes(newName)) {
      alert("A sheet with this name already exists.");
      return;
    }
    setActiveSheets((prev) => {
      const { [activeSheetName]: sheetData, ...rest } = prev;
      const updated = { ...rest, [newName]: sheetData };
      const names = Object.keys(updated);
      setSheetNames(names);
      const idx = names.indexOf(newName);
      setActiveTab(idx >= 0 ? idx : 0);
      return updated;
    });
  }

  function clearFilter(key) {
    setFilters((f) => ({ ...f, [key]: "" }));
  }

  function setFilter(key, value) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  function handleSelectLibrary(id) {
    const item = library.find((x) => x.id === id);
    if (!item) return;
    setActiveLibraryId(id);
    setSheets(item.sheets);
    setSheetNames(item.sheetNames);
    setActiveTab(0);
  }

  function handleDeleteLibrary(id) {
    setLibrary((prev) => prev.filter((x) => x.id !== id));
    if (id === activeLibraryId) {
      const next = library.find((x) => x.id !== id);
      if (next) handleSelectLibrary(next.id);
      else {
        setActiveLibraryId("");
        setSheets({});
        setSheetNames([]);
        setActiveTab(0);
      }
    }
  }

  function handleClearAll() {
    if (!confirm("Clear all uploaded files? This cannot be undone.")) return;
    setLibrary([]);
    setActiveLibraryId("");
    setSheets({});
    setSheetNames([]);
    setActiveTab(0);
    try {
      localStorage.removeItem("xlsx_library_v1");
      localStorage.removeItem("xlsx_active_id_v1");
    } catch (_) {}
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        XLSX Manager
      </Typography>

      <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <TextField
            select
            label="District"
            value={filters.district}
            onChange={(e) => setFilter("district", e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <option value=""></option>
            {distincts.district.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Constituency"
            value={filters.constituency}
            onChange={(e) => setFilter("constituency", e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <option value=""></option>
            {distincts.constituency.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Mandal"
            value={filters.mandal}
            onChange={(e) => setFilter("mandal", e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <option value=""></option>
            {distincts.mandal.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </TextField>
          <TextField
            select
            label="Panchayat"
            value={filters.panchayat}
            onChange={(e) => setFilter("panchayat", e.target.value)}
            size="small"
            sx={{ minWidth: 180 }}
          >
            <option value=""></option>
            {distincts.panchayat.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </TextField>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({
                district: "",
                constituency: "",
                mandal: "",
                panchayat: "",
              })
            }
          >
            Clear Filters
          </Button>
          <Button variant="outlined" color="error" onClick={handleClearAll}>
            Clear All Files
          </Button>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>File</TableCell>
              <TableCell>District</TableCell>
              <TableCell>Constituency</TableCell>
              <TableCell>Mandal</TableCell>
              <TableCell>Panchayat</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLibrary.map((it) => (
              <TableRow key={it.id} selected={it.id === activeLibraryId} hover>
                <TableCell>{it.name}</TableCell>
                <TableCell>{it.meta?.district || ""}</TableCell>
                <TableCell>{it.meta?.constituency || ""}</TableCell>
                <TableCell>{it.meta?.mandal || ""}</TableCell>
                <TableCell>{it.meta?.panchayat || ""}</TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleSelectLibrary(it.id)}
                    >
                      Open
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      onClick={() => handleDeleteLibrary(it.id)}
                    >
                      Delete
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {filteredLibrary.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No files match filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={!sheetNames.length}
        >
          Export XLSX
        </Button>
        <Button
          variant="outlined"
          onClick={handleStyledExport}
          disabled={!sheetNames.length}
        >
          Export Styled (Excel)
        </Button>
        <Button
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={() => fileInputRef.current && fileInputRef.current.click()}
        >
          Import XLSX (Multiple)
        </Button>
        <input
          type="file"
          accept=".xlsx,.xls"
          multiple
          style={{ display: "none" }}
          ref={fileInputRef}
          onChange={handleImportFileChange}
        />
      </Stack>

      <Paper variant="outlined" sx={{ mb: 2, p: 1 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={1}
        >
          <Tabs
            value={activeTab}
            onChange={(_, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
            sx={{ flexGrow: 1 }}
          >
            {sheetNames.map((n) => (
              <Tab key={n} label={n} />
            ))}
          </Tabs>
          <Tooltip title="Add sheet">
            <span>
              <IconButton color="primary" onClick={handleAddSheet}>
                <InsertDriveFileIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Rename sheet">
            <span>
              <IconButton
                onClick={handleRenameSheet}
                disabled={!activeSheetName}
              >
                <DriveFileRenameOutlineIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete sheet">
            <span>
              <IconButton
                color="error"
                onClick={handleDeleteSheet}
                disabled={!activeSheetName || sheetNames.length <= 1}
              >
                <FolderDeleteIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Paper>

      {activeSheetName ? (
        <Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Button
              size="small"
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddRow}
            >
              Add Row
            </Button>
            <Button size="small" variant="outlined" onClick={handleAddColumn}>
              Add Column
            </Button>
          </Stack>

          {/* Header table for column labels */}
          <TableContainer component={Paper} variant="outlined">
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  {activeSheet.columns.map((col, idx) => (
                    <TableCell key={`${col}__${idx}`}>{col}</TableCell>
                  ))}
                  <TableCell width={56} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
            </Table>
          </TableContainer>

          {/* Virtualized body below header */}
          <VirtualBody
            rows={activeSheet.rows || []}
            columns={activeSheet.columns}
            rowHeight={44}
            onDeleteRow={handleDeleteRow}
            onCommitCell={handleCellCommit}
          />
        </Box>
      ) : (
        <Typography color="text.secondary">No sheets loaded.</Typography>
      )}
    </Box>
  );
}
