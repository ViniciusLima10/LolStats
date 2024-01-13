import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home/Home.jsx';
import Summoner from './pages/summoner/Summoner.jsx';

function Rotas() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/invocador" element={<Summoner />} />
      </Routes>
    </Router>
  );
}

export default Rotas;