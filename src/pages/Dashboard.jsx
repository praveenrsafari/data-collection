import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { useData } from "../context/DataContext.jsx";

function Stat({ label, value }) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{label}</Typography>
        <Typography variant="h4" color="primary" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { state } = useData();
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={3}>
        <Stat label="Constituencies" value={state.constituencies.length} />
      </Grid>
      <Grid item xs={12} md={3}>
        <Stat label="Mandals" value={state.mandals.length} />
      </Grid>
      <Grid item xs={12} md={3}>
        <Stat label="Panchayats" value={state.panchayats.length} />
      </Grid>
      <Grid item xs={12} md={3}>
        <Stat label="Members" value={state.members.length} />
      </Grid>
    </Grid>
  );
}
