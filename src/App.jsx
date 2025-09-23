import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { theme } from "./theme";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Constituencies from "./pages/Constituencies.jsx";
import Mandals from "./pages/Mandals.jsx";
import Panchayats from "./pages/Panchayats.jsx";
import Members from "./pages/Members.jsx";
import XlsxManager from "./pages/XlsxManager.jsx";
import { DataProvider } from "./context/DataContext.jsx";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Layout>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/data-collection/dashboard" replace />}
              />
              <Route
                path="/data-collection/dashboard"
                element={<Dashboard />}
              />
              <Route
                path="/data-collection/constituencies"
                element={<Constituencies />}
              />
              <Route path="/data-collection/mandals" element={<Mandals />} />
              <Route
                path="/data-collection/panchayats"
                element={<Panchayats />}
              />
              <Route path="/data-collection/members" element={<Members />} />
              <Route path="/data-collection/xlsx" element={<XlsxManager />} />
            </Routes>
          </Container>
        </Layout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
