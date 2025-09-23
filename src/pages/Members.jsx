import React, { useMemo, useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import dayjs from "dayjs";
import { useData } from "../context/DataContext.jsx";
import DownloadIcon from "@mui/icons-material/Download";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import LibraryAddIcon from "@mui/icons-material/LibraryAdd";
import {
  exportMembersToCSV,
  exportMembersToExcel,
  downloadITWingTemplate,
} from "../utils/exporters.js";
import { parseTabularFile } from "../utils/importer.js";
import {
  roles,
  unitTypes,
  roleLevels,
  tagOptions,
} from "../constants/members.js";
import {
  mapMemberWithUnit,
  getDistricts,
  sortMembersByName,
  filterMembers,
  unitOptionsFor,
} from "../utils/membersSelectors.js";
import { normalizeMemberRow } from "../utils/membersImporter.js";
import Pagination from "@mui/material/Pagination";

function uuid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Members() {
  const { state, upsertMember, removeMember } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    id: "",
    name: "",
    role: "",
    roleLevel: "constituency",
    unitType: "constituency",
    unitId: "",
    phone: "",
    whatsapp: "",
    email: "",
    voterId: "",
    address: "",
    village: "",
    partyPosition: "",
    presentCity: "",
    presentArea: "",
    country: "",
    working: "",
    qualification: "",
    caste: "",
    joinDate: dayjs().format("YYYY-MM-DD"),
    tags: [],
  });

  const [filters, setFilters] = useState({
    q: "",
    role: "",
    unitType: "",
    district: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);
  useEffect(() => {
    setPage(1);
  }, [filters, rowsPerPage]);

  const members = state.members.map((m) => mapMemberWithUnit(state, m));
  const districts = useMemo(() => getDistricts(state), [state.constituencies]);
  const sorted = useMemo(
    () => sortMembersByName(members),
    [state.members, state.constituencies, state.mandals, state.panchayats]
  );
  const filtered = useMemo(
    () => filterMembers(sorted, filters),
    [sorted, filters]
  );
  const unitOptions = useMemo(
    () => unitOptionsFor(state, form.unitType),
    [form.unitType, state]
  );

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / rowsPerPage));
  const start = (page - 1) * rowsPerPage;
  const pageItems = filtered.slice(start, start + rowsPerPage);

  const handleSave = () => {
    if (!form.name || !form.role || !form.unitId) return;
    const id = form.id || uuid();
    upsertMember({ ...form, id, name: form.name.trim() });
    setOpen(false);
    setForm({
      id: "",
      name: "",
      role: "",
      roleLevel: "constituency",
      unitType: "constituency",
      unitId: "",
      phone: "",
      whatsapp: "",
      email: "",
      voterId: "",
      address: "",
      village: "",
      partyPosition: "",
      presentCity: "",
      presentArea: "",
      country: "",
      working: "",
      qualification: "",
      caste: "",
      joinDate: dayjs().format("YYYY-MM-DD"),
      tags: [],
    });
  };

  const toggleTag = (tag) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag)
        ? f.tags.filter((t) => t !== tag)
        : [...f.tags, tag],
    }));
  };

  const handleImportCSV = async (file) => {
    const rows = await parseTabularFile(file);
    const normalize = (s) => (s || "").trim();
    rows.forEach((r) => {
      const payload = normalizeMemberRow(state, r, uuid, normalize);
      if (!payload) return;
      upsertMember(payload);
    });
  };

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="h5">Members</Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => exportMembersToCSV(filtered)}
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={() => exportMembersToExcel(filtered)}
          >
            Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<LibraryAddIcon />}
            onClick={downloadITWingTemplate}
          >
            IT Wing CSV Template
          </Button>
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Member
          </Button>
          <Button
            component="label"
            variant="outlined"
            startIcon={<UploadFileIcon />}
          >
            Import CSV/Excel
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              hidden
              onChange={(e) =>
                e.target.files?.[0] && handleImportCSV(e.target.files[0])
              }
            />
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search by name/phone/whatsapp/email"
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Role"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Unit Type"
          value={filters.unitType}
          onChange={(e) => setFilters({ ...filters, unitType: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {unitTypes.map((u) => (
            <MenuItem key={u.value} value={u.value}>
              {u.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="District"
          value={filters.district}
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All</MenuItem>
          {districts.map((d) => (
            <MenuItem key={d} value={d}>
              {d}
            </MenuItem>
          ))}
        </TextField>
      </Stack>

      <Grid container spacing={2}>
        {pageItems.map((m) => (
          <Grid item xs={12} md={4} key={m.id}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <Box>
                    <Typography variant="h6">{m.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {m.role} • {m.roleLevel || ""} • {m.unitType} •{" "}
                      {m.unitName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      District: {m.district || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {m.phone || "-"} | WhatsApp: {m.whatsapp || "-"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Email: {m.email || "-"} • Voter ID: {m.voterId || "-"}
                    </Typography>
                    {m.address ? (
                      <Typography variant="body2" color="text.secondary">
                        Address: {m.address}
                      </Typography>
                    ) : null}
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 1, flexWrap: "wrap" }}
                    >
                      {m.tags.map((t) => (
                        <Chip key={t} label={t} size="small" />
                      ))}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setForm(m);
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeMember(m.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 3 }}
      >
        <Typography variant="body2">
          Showing {total === 0 ? 0 : start + 1}-
          {Math.min(start + rowsPerPage, total)} of {total}
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            select
            size="small"
            label="Rows"
            value={rowsPerPage}
            onChange={(e) => setRowsPerPage(Number(e.target.value))}
          >
            {[12, 24, 48, 96].map((n) => (
              <MenuItem key={n} value={n}>
                {n}
              </MenuItem>
            ))}
          </TextField>
          <Pagination
            color="primary"
            count={pageCount}
            page={page}
            onChange={(_, p) => setPage(p)}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Stack>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{form.id ? "Edit" : "Add"} Member</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Full Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Role Level"
              value={form.roleLevel}
              onChange={(e) => setForm({ ...form, roleLevel: e.target.value })}
            >
              {roleLevels.map((r) => (
                <MenuItem key={r.value} value={r.value}>
                  {r.label}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                label="Unit Type"
                value={form.unitType}
                onChange={(e) =>
                  setForm({ ...form, unitType: e.target.value, unitId: "" })
                }
                sx={{ flex: 1 }}
              >
                {unitTypes.map((u) => (
                  <MenuItem key={u.value} value={u.value}>
                    {u.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Unit"
                value={form.unitId}
                onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                sx={{ flex: 2 }}
              >
                {unitOptions.map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              <TextField
                label="WhatsApp"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
              <TextField
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Stack>
            <TextField
              label="Voter ID"
              value={form.voterId}
              onChange={(e) => setForm({ ...form, voterId: e.target.value })}
            />
            <TextField
              label="Address"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Village"
                value={form.village}
                onChange={(e) => setForm({ ...form, village: e.target.value })}
              />
              <TextField
                label="Party Position"
                value={form.partyPosition}
                onChange={(e) =>
                  setForm({ ...form, partyPosition: e.target.value })
                }
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Present City"
                value={form.presentCity}
                onChange={(e) =>
                  setForm({ ...form, presentCity: e.target.value })
                }
              />
              <TextField
                label="Present Area"
                value={form.presentArea}
                onChange={(e) =>
                  setForm({ ...form, presentArea: e.target.value })
                }
              />
              <TextField
                label="Country"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Working"
                value={form.working}
                onChange={(e) => setForm({ ...form, working: e.target.value })}
              />
              <TextField
                label="Qualification"
                value={form.qualification}
                onChange={(e) =>
                  setForm({ ...form, qualification: e.target.value })
                }
              />
              <TextField
                label="Caste"
                value={form.caste}
                onChange={(e) => setForm({ ...form, caste: e.target.value })}
              />
            </Stack>
            <TextField
              label="Join Date"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={form.joinDate}
              onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
            />
            <Stack direction="row" spacing={1} sx={{ flexWrap: "wrap" }}>
              {tagOptions.map((t) => (
                <Chip
                  key={t}
                  label={t}
                  color={form.tags.includes(t) ? "primary" : "default"}
                  onClick={() => toggleTag(t)}
                />
              ))}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
