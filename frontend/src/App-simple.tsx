import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import NotFound from './pages/NotFound'

function App() {
  console.log('App rendering...')
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#ffffff' }}>
      <Router>
        <nav style={{ height: '64px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc', display: 'flex', alignItems: 'center', padding: '0 20px' }}>
          <a href="/" style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed', textDecoration: 'none' }}>WastedTeens</a>
        </nav>
        
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<div style={{ padding: '40px', textAlign: 'center' }}>Projects Page (Not implemented yet)</div>} />
            <Route path="/projects/custom" element={<div style={{ padding: '40px', textAlign: 'center' }}>Custom Project Form (Not implemented yet)</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <footer style={{ backgroundColor: '#f0f0f0', borderTop: '1px solid #ccc', padding: '20px', textAlign: 'center', color: '#666' }}>
          &copy; 2026 WastedTeens. All rights reserved.
        </footer>
      </Router>
    </div>
  )
}

export default App
