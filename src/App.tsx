import React from 'react'
import { Route, Routes, Link, HashRouter } from 'react-router-dom'

import 'react-select-search/style.css'
import './App.css'
import Comparison from './Comparison'
import Home from './Home'
import Table from './Table'

function App() {
  return (
    <div className="App">
      <HashRouter>
        <nav>
          <Link to={`/`}>Etusivu</Link>
          <Link to={`/vertailu`}>Vertailu</Link>
          <Link to={`/tilastot`}>Tilastot</Link>
        </nav>
        <Routes>
          <Route path={`/`} element={<Home />} />
          <Route path={`/vertailu`} element={<Comparison />} />
          <Route path={`/tilastot`} element={<Table />} />
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App
