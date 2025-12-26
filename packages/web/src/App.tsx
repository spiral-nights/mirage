import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RootLayout } from './layouts/RootLayout';
import { HomePage } from './pages/HomePage';
import { MirageProvider } from './hooks/useMirage';

function App() {
  return (
    <MirageProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<HomePage />} />
            <Route path="apps" element={<div>My Apps (Coming Soon)</div>} />
            <Route path="favorites" element={<div>Favorites (Coming Soon)</div>} />
            <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </MirageProvider>
  );
}

export default App;