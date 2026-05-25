import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Exploitation from './pages/Exploitation';
import Securite from './pages/Securite';
import Placeholder from './pages/Placeholder';

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
            <Route path="/maintenance"   element={<Placeholder module="maintenance" />} />
            <Route path="/controle"      element={<Placeholder module="controle" />} />
            <Route path="/rh"            element={<Placeholder module="rh" />} />
            <Route path="/administratif" element={<Placeholder module="administratif" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
