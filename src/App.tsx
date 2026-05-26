import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Exploitation from './pages/Exploitation';
import Securite from './pages/Securite';
import Maintenance from './pages/Maintenance';
import ControleGestion from './pages/ControleGestion';
import RH from './pages/RH';
import Administratif from './pages/Administratif';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden" style={{ background: '#020817' }}>
        <Sidebar />
        <main className="flex-1 overflow-hidden flex flex-col"
          style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(10,30,60,0.18) 0%, transparent 60%)' }}>
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
