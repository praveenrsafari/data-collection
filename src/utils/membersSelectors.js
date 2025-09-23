export function mapMemberWithUnit(state, member) {
  let unitName = "-";
  let district = "";
  if (member.unitType === "constituency") {
    const c = state.constituencies.find((x) => x.id === member.unitId);
    unitName = c?.name || "-";
    district = c?.district || "";
  }
  if (member.unitType === "mandal") {
    const mandal = state.mandals.find((x) => x.id === member.unitId);
    unitName = mandal?.name || "-";
    const c = state.constituencies.find((x) => x.id === mandal?.constituencyId);
    district = c?.district || "";
  }
  if (member.unitType === "panchayat") {
    const p = state.panchayats.find((x) => x.id === member.unitId);
    unitName = p?.name || "-";
    const mandal = state.mandals.find((x) => x.id === p?.mandalId);
    const c = state.constituencies.find((x) => x.id === mandal?.constituencyId);
    district = c?.district || "";
  }
  return { ...member, unitName, district };
}

export function getDistricts(state) {
  const set = new Set(
    state.constituencies.map((c) => c.district).filter(Boolean)
  );
  return Array.from(set).sort();
}

export function sortMembersByName(members) {
  return [...members].sort((a, b) => a.name.localeCompare(b.name));
}

export function filterMembers(members, filters) {
  return members.filter((m) => {
    if (filters.q) {
      const q = filters.q.toLowerCase();
      if (
        !(
          m.name.toLowerCase().includes(q) ||
          (m.phone || "").includes(q) ||
          (m.whatsapp || "").includes(q) ||
          (m.email || "").toLowerCase().includes(q)
        )
      ) {
        return false;
      }
    }
    if (filters.role && m.role !== filters.role) return false;
    if (filters.unitType && m.unitType !== filters.unitType) return false;
    if (filters.district && m.district !== filters.district) return false;
    return true;
  });
}

export function unitOptionsFor(state, unitType) {
  if (unitType === "constituency") return state.constituencies;
  if (unitType === "mandal") return state.mandals;
  return state.panchayats;
}
