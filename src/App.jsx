import React, { useEffect } from "react";
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
import PhotoUpload from "./pages/PhotoUpload.jsx";
import { DataProvider } from "./context/DataContext.jsx";
import { testFirestoreConnection } from "./firebase/testConnection.js";

function App() {
  // Test Firebase connection on app load
  useEffect(() => {
    console.log("🚀 Running Firebase connection test...");
    testFirestoreConnection();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DataProvider>
        <Layout>
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Routes>
              <Route
                path="/"
                element={<Navigate to="/photo-upload" replace />}
              />
              <Route path="/photo-upload" element={<PhotoUpload />} />
            </Routes>
          </Container>
        </Layout>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
