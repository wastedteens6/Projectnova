import React from 'react'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', color: '#000000', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Welcome to WastedTeens</h1>
      <p style={{ fontSize: '18px', marginBottom: '30px', maxWidth: '600px', textAlign: 'center' }}>
        Stop wasting time. Buy smart projects. Premium academic projects for AI, ML, Web Dev, Cybersecurity & more.
      </p>
      <div style={{ display: 'flex', gap: '20px' }}>
        <a href="/projects" style={{ padding: '12px 30px', backgroundColor: '#7c3aed', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          Browse Projects
        </a>
        <a href="/projects/custom" style={{ padding: '12px 30px', backgroundColor: '#6366f1', color: 'white', textDecoration: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}>
          Custom Project
        </a>
      </div>
      <p style={{ marginTop: '50px', fontSize: '14px', color: '#666' }}>
        ✓ 500+ Projects · ✓ 10K+ Students · ✓ 4.9★ Ratings
      </p>
    </div>
  )
}
