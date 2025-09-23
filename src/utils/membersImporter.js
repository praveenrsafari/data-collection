import dayjs from "dayjs";

export function normalizeMemberRow(state, r, uuid, normalize) {
  const constituencyName =
    normalize(r["Constituency"]) ||
    normalize(r["constituency"]) ||
    normalize(r["constituencyName"]) ||
    "";
  const mandalName =
    normalize(r["Mandal"]) ||
    normalize(r["mandal"]) ||
    normalize(r["mandalName"]) ||
    "";
  const panchayatName =
    normalize(r["Panchayat"]) ||
    normalize(r["panchayat"]) ||
    normalize(r["panchayatName"]) ||
    "";
  const unitName = normalize(r["unitName"]) || normalize(r["Unit Name"]) || "";
  const name = normalize(r["Name"]) || normalize(r["name"]) || "";
  if (!name) return null;

  const phone = normalize(r["Phone"]) || normalize(r["phone"]) || "";
  const partyPosition =
    normalize(r["Party Position"]) || normalize(r["partyPosition"]) || "";
  const village = normalize(r["Village"]) || normalize(r["village"]) || "";
  const presentCity =
    normalize(r["Present City"]) || normalize(r["presentCity"]) || "";
  const presentArea =
    normalize(r["Present Area"]) || normalize(r["presentArea"]) || "";
  const country = normalize(r["Country"]) || normalize(r["country"]) || "";
  const working = normalize(r["Working"]) || normalize(r["working"]) || "";
  const qualification =
    normalize(r["Qualification"]) || normalize(r["qualification"]) || "";
  const caste = normalize(r["Cast"]) || normalize(r["caste"]) || "";

  let unitType = "";
  let resolvedUnitName = unitName;
  if (panchayatName)
    (unitType = "panchayat"), (resolvedUnitName = panchayatName);
  else if (mandalName) (unitType = "mandal"), (resolvedUnitName = mandalName);
  else if (constituencyName)
    (unitType = "constituency"), (resolvedUnitName = constituencyName);
  else if (unitName) unitType = "constituency";

  let unitId = "";
  if (unitType === "constituency")
    unitId =
      state.constituencies.find((c) => c.name === resolvedUnitName)?.id || "";
  else if (unitType === "mandal")
    unitId = state.mandals.find((m) => m.name === resolvedUnitName)?.id || "";
  else if (unitType === "panchayat")
    unitId =
      state.panchayats.find((p) => p.name === resolvedUnitName)?.id || "";
  if (!unitId) return null;

  return {
    id: uuid(),
    name,
    role: "IT Wing",
    roleLevel: unitType,
    unitType,
    unitId,
    phone,
    whatsapp: phone,
    email: "",
    voterId: "",
    address: "",
    village,
    partyPosition,
    presentCity,
    presentArea,
    country,
    working,
    qualification,
    caste,
    joinDate: dayjs().format("YYYY-MM-DD"),
    tags: ["IT"],
  };
}
