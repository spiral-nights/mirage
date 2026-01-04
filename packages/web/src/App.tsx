import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { RunPage } from './pages/RunPage';
import { PreviewPage } from './pages/PreviewPage';
import { MyAppsPage } from './pages/MyAppsPage';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage';
import { MirageProvider } from './hooks/useMirage';
import { AppActionsProvider } from './contexts/AppActionsContext';

function App() {
  return (
    <MirageProvider>
      <AppActionsProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<MyAppsPage />} />
              <Route path="create" element={<HomePage />} />
              <Route path="run/:naddr" element={<RunPage />} />
              <Route path="preview" element={<PreviewPage />} />
              <Route path="favorites" element={<div>Favorites (Coming Soon)</div>} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppActionsProvider>
    </MirageProvider>
  );
}

export default App;
