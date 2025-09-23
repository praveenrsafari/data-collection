import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { apSeed } from "../seed/apSeed.js";

const STORAGE_KEY = "ysrcp_directory_data_v1";

const initialState = {
  constituencies: [], // { id, name, district }
  mandals: [], // { id, name, constituencyId }
  panchayats: [], // { id, name, mandalId }
  members: [], // { id, name, role, unitType, unitId, phone, email, joinDate, tags: [] }
};

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...initialState, ...JSON.parse(raw) };
  } catch (_) {}
  // If no saved data, seed AP units
  if (apSeed && apSeed.constituencies?.length) {
    return {
      ...initialState,
      constituencies: apSeed.constituencies,
      mandals: apSeed.mandals,
      panchayats: apSeed.panchayats,
    };
  }
  return initialState;
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

function reducer(state, action) {
  switch (action.type) {
    case "reset":
      return { ...initialState };
    case "hydrate":
      return { ...state, ...action.payload };
    case "upsert": {
      const { key, item } = action.payload; // key in [constituencies, mandals, panchayats, members]
      const existing = state[key].find((x) => x.id === item.id);
      const next = existing
        ? state[key].map((x) => (x.id === item.id ? { ...x, ...item } : x))
        : [...state[key], item];
      return { ...state, [key]: next };
    }
    case "remove": {
      const { key, id } = action.payload;
      return { ...state, [key]: state[key].filter((x) => x.id !== id) };
    }
    default:
      return state;
  }
}

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const actions = useMemo(
    () => ({
      upsertConstituency: (item) =>
        dispatch({ type: "upsert", payload: { key: "constituencies", item } }),
      removeConstituency: (id) =>
        dispatch({ type: "remove", payload: { key: "constituencies", id } }),

      upsertMandal: (item) =>
        dispatch({ type: "upsert", payload: { key: "mandals", item } }),
      removeMandal: (id) =>
        dispatch({ type: "remove", payload: { key: "mandals", id } }),

      upsertPanchayat: (item) =>
        dispatch({ type: "upsert", payload: { key: "panchayats", item } }),
      removePanchayat: (id) =>
        dispatch({ type: "remove", payload: { key: "panchayats", id } }),

      upsertMember: (item) =>
        dispatch({ type: "upsert", payload: { key: "members", item } }),
      removeMember: (id) =>
        dispatch({ type: "remove", payload: { key: "members", id } }),

      reset: () => dispatch({ type: "reset" }),
    }),
    []
  );

  const value = useMemo(() => ({ state, ...actions }), [state, actions]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
