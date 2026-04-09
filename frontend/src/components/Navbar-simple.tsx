import React from 'react'

export default function Navbar() {
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      zIndex: 50,
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e5e7eb',
      padding: '0 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      height: '64px'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#7c3aed' }}>
        WastedTeens☠️
      </div>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
        <a href="/" style={{ color: '#000000', textDecoration: 'none', fontWeight: '500' }}>Home</a>
        <a href="/projects" style={{ color: '#000000', textDecoration: 'none', fontWeight: '500' }}>Browse</a>
        <a href="/auth/login" style={{ padding: '8px 16px', backgroundColor: '#7c3aed', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>Login</a>
      </div>
    </nav>
  )
}
