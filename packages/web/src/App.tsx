import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { RunPage } from './pages/RunPage';
import { MyAppsPage } from './pages/MyAppsPage';
import { SettingsPage } from './pages/SettingsPage';
import { MirageProvider } from './hooks/useMirage';
import { AppActionsProvider } from './contexts/AppActionsContext';

function App() {
  return (
    <MirageProvider>
      <AppActionsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<RootLayout />}>
              <Route index element={<MyAppsPage />} />
              <Route path="create" element={<HomePage />} />
              <Route path="run/:naddr" element={<RunPage />} />
              <Route path="favorites" element={<div>Favorites (Coming Soon)</div>} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppActionsProvider>
    </MirageProvider>
  );
}

export default App;
