
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Results from './pages/Results';

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav style={{ padding: '1rem 2rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'bold', background: 'linear-gradient(to right, #a78bfa, #2dd4bf)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            AuraSkin AI
          </h1>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
