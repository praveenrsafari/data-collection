import * as XLSX from "xlsx";

export function exportMembersToCSV(members) {
  const headers = [
    "Name",
    "Role",
    "Role Level",
    "Unit Type",
    "Unit Name",
    "District",
    "Phone",
    "WhatsApp",
    "Email",
    "Voter ID",
    "Address",
    "Village",
    "Party Position",
    "Present City",
    "Present Area",
    "Country",
    "Working",
    "Qualification",
    "Caste",
    "Join Date",
    "Tags",
  ];
  const rows = members.map((m) => [
    m.name,
    m.role,
    m.roleLevel || "",
    m.unitType,
    m.unitName || "",
    m.district || "",
    m.phone || "",
    m.whatsapp || "",
    m.email || "",
    m.voterId || "",
    (m.address || "").replace(/\n/g, " "),
    m.village || "",
    m.partyPosition || "",
    m.presentCity || "",
    m.presentArea || "",
    m.country || "",
    m.working || "",
    m.qualification || "",
    m.caste || "",
    m.joinDate || "",
    (m.tags || []).join("|"),
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map(csvEscape).join(","))
    .join("\n");
  downloadFile(
    csv,
    "text/csv;charset=utf-8;",
    `ysrcp_members_${Date.now()}.csv`
  );
}

export function exportMembersToExcel(members) {
  const data = members.map((m) => ({
    Name: m.name,
    Role: m.role,
    "Role Level": m.roleLevel || "",
    "Unit Type": m.unitType,
    "Unit Name": m.unitName || "",
    District: m.district || "",
    Phone: m.phone || "",
    WhatsApp: m.whatsapp || "",
    Email: m.email || "",
    "Voter ID": m.voterId || "",
    Address: m.address || "",
    Village: m.village || "",
    "Party Position": m.partyPosition || "",
    "Present City": m.presentCity || "",
    "Present Area": m.presentArea || "",
    Country: m.country || "",
    Working: m.working || "",
    Qualification: m.qualification || "",
    Caste: m.caste || "",
    "Join Date": m.joinDate || "",
    Tags: (m.tags || []).join("|"),
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Members");
  XLSX.writeFile(wb, `ysrcp_members_${Date.now()}.xlsx`);
}

export function downloadITWingTemplate() {
  const headers = [
    "Constituency",
    "Mandal",
    "Panchayat",
    "Village",
    "Name",
    "Phone",
    "Party Position",
    "Present City",
    "Present Area",
    "Country",
    "Working",
    "Qualification",
    "Cast",
  ];
  const csv = headers.join(",") + "\n";
  downloadFile(csv, "text/csv;charset=utf-8;", "it_wing_template.csv");
}

function csvEscape(value) {
  const s = String(value ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadFile(content, type, filename) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
