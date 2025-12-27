import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { RunPage } from './pages/RunPage';
import { MyAppsPage } from './pages/MyAppsPage';
import { MirageProvider } from './hooks/useMirage';

function App() {
  return (
    <MirageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<MyAppsPage />} />
            <Route path="create" element={<HomePage />} />
            <Route path="favorites" element={<div>Favorites (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>
          <Route path="/run/:naddr" element={<RunPage />} />
        </Routes>
      </BrowserRouter>
    </MirageProvider>
  );
}

export default App;