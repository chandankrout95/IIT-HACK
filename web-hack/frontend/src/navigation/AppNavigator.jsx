import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// pages
import HomePage from "../features/home/pages/HomePage";
import NotFound from "../common/pages/NotFound";
import LandingPage from "../common/pages/LandingPage";
import LoginPage from "../features/auth/LoginPage";
import SignupPage from "../features/auth/SignupPage";
import MainLayout from "../layout/MainLayout";
import OrbitalMapPage from "../features/orbitalMap/pages/OrbitalMapPage";
import { ProtectedRoute, PublicRoute } from "../common/components/AuthGuards";
import RadarSweepPage from "../features/radarSweep/pages/RadarSweepPage";
import SectorCommunicationPage from "../features/sectorCommunication/pages/SectorCommunicationPage";
import AlertFeedPage from "../features/alertFeed/pages/AlertFeedPage";
import CommandCenterPage from "../features/commandCenter/pages/CommandCenterPage";
import TelemetryVaultPage from "../features/telemetryVault/pages/TelemetryVaultPage";
import QuantumEngine from "../features/quantumEngine/pages/QuantumEnginePage";
import RiskMatrixPage from "../features/riskMatrix/pages/RiskMatrixPage";

const AppNavigator = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public/Guest access only */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Protected Terminal access */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/visualizer" element={<OrbitalMapPage />} />
            <Route path="/command" element={<CommandCenterPage />} />
            <Route path="/radar" element={<RadarSweepPage />} />
            <Route path="/sector-com" element={<SectorCommunicationPage />} />
            <Route path="/alert-feed" element={<AlertFeedPage />} />
            <Route path="/telemetry-vault" element={<TelemetryVaultPage />} />
            <Route path="/quantum-engine" element={<QuantumEngine />} />
            <Route path="/risk-matrix" element={<RiskMatrixPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppNavigator;
