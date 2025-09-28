import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import StartPressureTest from './pages/StartPressure';
import EndPressureTest from './pages/EndpressureTest';
import EndTestDetails from './pages/EndTestDetails';
import './App.css';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/start-test" element={<StartPressureTest />} />
          <Route path="/end-test" element={<EndPressureTest />} />
          <Route path="/end-test/:id" element={<EndTestDetails />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
