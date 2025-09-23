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

export default function Constituencies() {
  const { state, upsertConstituency, removeConstituency } = useData();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ id: "", name: "", district: "" });

  const sorted = useMemo(
    () =>
      [...state.constituencies].sort((a, b) => a.name.localeCompare(b.name)),
    [state.constituencies]
  );

  const handleSave = () => {
    if (!form.name) return;
    const existing = state.constituencies.find(
      (x) => x.name === form.name.trim()
    );
    const id = form.id || existing?.id || uuid();
    upsertConstituency({
      id,
      name: form.name.trim(),
      district: form.district.trim(),
    });
    setOpen(false);
    setForm({ id: "", name: "", district: "" });
  };

  const handleImportCSV = async (file) => {
    const rows = await parseTabularFile(file);
    const normalize = (s) => (s || "").trim();
    rows.forEach((r) => {
      const name = normalize(r["name"]) || normalize(r["Name"]) || "";
      if (!name) return;
      const district =
        normalize(r["district"]) || normalize(r["District"]) || "";
      const existing = state.constituencies.find((c) => c.name === name);
      const id = existing?.id || uuid();
      upsertConstituency({ id, name, district });
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
        <Typography variant="h5">Constituencies</Typography>
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
            Add Constituency
          </Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        {sorted.map((c) => (
          <Grid item xs={12} md={4} key={c.id}>
            <Card>
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="start"
                >
                  <div>
                    <Typography variant="h6">{c.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      District: {c.district || "-"}
                    </Typography>
                  </div>
                  <Stack direction="row" spacing={1}>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setForm(c);
                        setOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeConstituency(c.id)}
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

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{form.id ? "Edit" : "Add"} Constituency</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              autoFocus
            />
            <TextField
              label="District"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
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
