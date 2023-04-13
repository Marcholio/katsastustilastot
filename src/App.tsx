import React from 'react'
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom'

import 'react-select-search/style.css'
import './App.css'
import Comparison from './Comparison'
import Home from './Home'
import Table from './Table'

const basePath = '/katsastustilastot'

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <nav>
          <Link to={`${basePath}/`}>Etusivu</Link>
          <Link to={`${basePath}/vertailu`}>Vertailu</Link>
          <Link to={`${basePath}/tilastot`}>Tilastot</Link>
        </nav>
        <Routes>
          <Route path={`${basePath}/`} element={<Home />} />
          <Route path={`${basePath}/vertailu`} element={<Comparison />} />
          <Route path={`${basePath}/tilastot`} element={<Table />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
