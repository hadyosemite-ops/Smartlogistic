import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Exploitation from './pages/Exploitation';
import Securite from './pages/Securite';
import Maintenance from './pages/Maintenance';
import ControleGestion from './pages/ControleGestion';
import RH from './pages/RH';
import Administratif from './pages/Administratif';

function AppInner() {
  const { c } = useTheme();
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ background: c.bgApp, transition: 'background 0.3s ease' }}>
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col">
          <Routes>
            <Route path="/"              element={<Dashboard />} />
            <Route path="/exploitation"  element={<Exploitation />} />
            <Route path="/securite"      element={<Securite />} />
            <Route path="/maintenance"   element={<Maintenance />} />
            <Route path="/controle"      element={<ControleGestion />} />
            <Route path="/rh"            element={<RH />} />
            <Route path="/administratif" element={<Administratif />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
