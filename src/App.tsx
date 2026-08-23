import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from './context/ThemeContext.js';
import { SystemStatusProvider } from './context/SystemStatusContext.js';
import { LocationProvider } from './context/LocationContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

import { DashboardPage } from './pages/DashboardPage.js';
import { LiveMapPage } from './pages/LiveMapPage.js';
import { NowcastPage } from './pages/NowcastPage.js';
import { AlertsPage } from './pages/AlertsPage.js';
import { AnalyticsPage } from './pages/AnalyticsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { AuthorityPage } from './pages/AuthorityPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { PresentationPage } from './pages/PresentationPage.js';
import { DemoPage } from './pages/DemoPage.js';
import { DemoControlCenterPage } from './pages/DemoControlCenterPage.js';
import { JudgeModePage } from './pages/JudgeModePage.js';
import { InnovationPage } from './pages/InnovationPage.js';
import { ImpactPage } from './pages/ImpactPage.js';
import { LimitationsPage } from './pages/LimitationsPage.js';
import { ArchitecturePage } from './pages/ArchitecturePage.js';
import { SystemHealthPage } from './pages/SystemHealthPage.js';
import { ModelMonitoringPage } from './pages/ModelMonitoringPage.js';
import { DataQualityPage } from './pages/DataQualityPage.js';
import { NotFoundPage } from './pages/NotFoundPage.js';

// Phase 12 SIH Presentation & Evidence Suite Pages
import { SihJudgeDashboardPage } from './pages/sih/SihJudgeDashboardPage.js';
import { SihGuidedDemoPage } from './pages/sih/SihGuidedDemoPage.js';
import { SihPitchPage } from './pages/sih/SihPitchPage.js';
import { SihQAPage } from './pages/sih/SihQAPage.js';
import { SihScalabilityPage } from './pages/sih/SihScalabilityPage.js';
import { SihCheckPage } from './pages/sih/SihCheckPage.js';
import { SihModelEvidencePage } from './pages/sih/evidence/SihModelEvidencePage.js';
import { SihSystemEvidencePage } from './pages/sih/evidence/SihSystemEvidencePage.js';
import { SihSecurityEvidencePage } from './pages/sih/evidence/SihSecurityEvidencePage.js';
import { SihTestingEvidencePage } from './pages/sih/evidence/SihTestingEvidencePage.js';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <SystemStatusProvider>
          <LocationProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/map" element={<LiveMapPage />} />
                  <Route path="/nowcast" element={<NowcastPage />} />
                  <Route path="/alerts" element={<AlertsPage />} />
                  <Route path="/presentation" element={<PresentationPage />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/demo/control-center" element={<DemoControlCenterPage />} />
                  <Route path="/demo/judge" element={<JudgeModePage />} />
                  <Route path="/demo/innovation" element={<InnovationPage />} />
                  <Route path="/demo/impact" element={<ImpactPage />} />
                  <Route path="/limitations" element={<LimitationsPage />} />
                  <Route path="/architecture" element={<ArchitecturePage />} />

                  {/* Phase 12 SIH Presentation, Demo Simulation & Evidence Pack Routes */}
                  <Route path="/sih/judge" element={<SihJudgeDashboardPage />} />
                  <Route path="/sih/demo" element={<SihGuidedDemoPage />} />
                  <Route path="/sih/pitch" element={<SihPitchPage />} />
                  <Route path="/sih/qa" element={<SihQAPage />} />
                  <Route path="/sih/scalability" element={<SihScalabilityPage />} />
                  <Route path="/sih/check" element={<SihCheckPage />} />
                  <Route path="/sih/impact" element={<ImpactPage />} />
                  <Route path="/sih/limitations" element={<LimitationsPage />} />
                  <Route path="/sih/evidence/model" element={<SihModelEvidencePage />} />
                  <Route path="/sih/evidence/system" element={<SihSystemEvidencePage />} />
                  <Route path="/sih/evidence/security" element={<SihSecurityEvidencePage />} />
                  <Route path="/sih/evidence/testing" element={<SihTestingEvidencePage />} />

                  <Route path="/admin/system-health" element={<SystemHealthPage />} />
                  <Route path="/admin/models" element={<ModelMonitoringPage />} />
                  <Route path="/admin/data-quality" element={<DataQualityPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/authority" element={<AuthorityPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </LocationProvider>
        </SystemStatusProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
