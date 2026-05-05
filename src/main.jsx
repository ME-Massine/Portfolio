import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.jsx';
import IoTHealth from './pages/IoTHealth.jsx';
import PulseStream from './pages/PulseStream.jsx';
import ERecruitment from './pages/ERecruitment.jsx';
import Learnova from './pages/Learnova.jsx';
import OrderFlow from './pages/OrderFlow.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/projects/iot-health" element={<IoTHealth />} />
        <Route path="/projects/pulsestream" element={<PulseStream />} />
        <Route path="/projects/e-recruitment" element={<ERecruitment />} />
        <Route path="/projects/learnova" element={<Learnova />} />
        <Route path="/projects/orderflow" element={<OrderFlow />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
