import React, { useMemo, useState } from "react";
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
import UploadFileIcon from "@mui/icons-material/UploadFile";
import Papa from "papaparse";
import { useData } from "../context/DataContext.jsx";
import { parseTabularFile } from "../utils/importer.js";

function uuid() {
  return Math.random().toString(36).slice(2, 10);
}

export default function Panchayats() {
  const { state, upsertPanchayat, removePanchayat } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", mandalId: "" });

  const sorted = useMemo(
    () => [...state.panchayats].sort((a, b) => a.name.localeCompare(b.name)),
    [state.panchayats]
  );

  const handleSave = () => {
    if (!form.name || !form.mandalId) return;
    const existing = state.panchayats.find((x) => x.name === form.name.trim());
    const id = form.id || existing?.id || uuid();
    upsertPanchayat({ id, name: form.name.trim(), mandalId: form.mandalId });
    setOpen(false);
    setForm({ id: "", name: "", mandalId: "" });
  };

  const handleImportCSV = async (file) => {
    const rows = await parseTabularFile(file);
    const normalize = (s) => (s || "").trim();
    rows.forEach((r) => {
      const name = normalize(r["name"]) || normalize(r["Name"]) || "";
      const mandalName =
        normalize(r["mandalName"]) || normalize(r["Mandal"]) || "";
      if (!name || !mandalName) return;
      const mandal = state.mandals.find((m) => m.name === mandalName);
      if (!mandal) return;
      const existing = state.panchayats.find((p) => p.name === name);
      const id = existing?.id || uuid();
      upsertPanchayat({ id, name, mandalId: mandal.id });
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
        <Typography variant="h5">Panchayats</Typography>
        <Stack direction="row" spacing={1}>
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
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Panchayat
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {sorted.map((p) => {
          const m = state.mandals.find((x) => x.id === p.mandalId);
          return (
            <Grid item xs={12} md={4} key={p.id}>
              <Card>
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="start"
                  >
                    <div>
                      <Typography variant="h6">{p.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mandal: {m?.name || "-"}
                      </Typography>
                    </div>
                    <Stack direction="row" spacing={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setForm(p);
                          setOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removePanchayat(p.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{form.id ? "Edit" : "Add"} Panchayat</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              select
              label="Mandal"
              value={form.mandalId}
              onChange={(e) => setForm({ ...form, mandalId: e.target.value })}
            >
              {state.mandals.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
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
