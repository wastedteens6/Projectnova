/**
 * Generates styled SVG project thumbnail images for each category.
 * Run with: node prisma/generate-images.mjs
 */
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '../public/projects');

const images = [
  {
    file: 'web-ecommerce.svg',
    bg: ['#1e1b4b', '#312e81'],
    accent: '#818cf8',
    accent2: '#6366f1',
    icon: `<rect x="60" y="60" width="280" height="180" rx="12" fill="none" stroke="#6366f1" stroke-width="2" opacity="0.6"/>
           <rect x="60" y="60" width="280" height="40" rx="12" fill="#312e81" opacity="0.9"/>
           <circle cx="82" cy="80" r="6" fill="#ef4444"/>
           <circle cx="100" cy="80" r="6" fill="#eab308"/>
           <circle cx="118" cy="80" r="6" fill="#22c55e"/>
           <rect x="75" y="115" width="80" height="80" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" opacity="0.8"/>
           <rect x="170" y="115" width="80" height="80" rx="8" fill="#1e1b4b" stroke="#6366f1" stroke-width="1.5" opacity="0.8"/>
           <rect x="265" y="115" width="60" height="80" rx="8" fill="#312e81" stroke="#818cf8" stroke-width="1.5" opacity="0.8"/>
           <rect x="75" y="205" width="250" height="20" rx="6" fill="#4338ca" opacity="0.5"/>
           <text x="115" y="160" font-family="monospace" font-size="10" fill="#a5b4fc">Product</text>
           <text x="205" y="160" font-family="monospace" font-size="10" fill="#a5b4fc">Cart</text>
           <text x="275" y="155" font-family="monospace" font-size="9" fill="#64748b">Admin</text>`,
    label: 'WEB',
  },
  {
    file: 'web-portal.svg',
    bg: ['#0f172a', '#1e3a5f'],
    accent: '#38bdf8',
    accent2: '#0ea5e9',
    icon: `<rect x="60" y="50" width="280" height="200" rx="14" fill="none" stroke="#0ea5e9" stroke-width="2" opacity="0.5"/>
           <rect x="60" y="50" width="80" height="200" rx="14" fill="#0f2744" opacity="0.8"/>
           <rect x="155" y="70" width="170" height="50" rx="8" fill="#0f2744" stroke="#38bdf8" stroke-width="1.5" opacity="0.7"/>
           <rect x="155" y="135" width="170" height="35" rx="6" fill="#0f2744" stroke="#0ea5e9" stroke-width="1" opacity="0.6"/>
           <rect x="155" y="180" width="170" height="35" rx="6" fill="#0f2744" stroke="#0ea5e9" stroke-width="1" opacity="0.6"/>
           <circle cx="100" cy="110" r="22" fill="#0ea5e9" opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
           <rect x="80" y="145" width="40" height="6" rx="3" fill="#38bdf8" opacity="0.5"/>
           <rect x="80" y="158" width="30" height="4" rx="2" fill="#64748b" opacity="0.5"/>`,
    label: 'WEB',
  },
  {
    file: 'ai-prediction.svg',
    bg: ['#1a0533', '#2d0f5e'],
    accent: '#a855f7',
    accent2: '#7c3aed',
    icon: `<circle cx="200" cy="140" r="40" fill="none" stroke="#a855f7" stroke-width="2" opacity="0.5"/>
           <circle cx="200" cy="140" r="12" fill="#a855f7" opacity="0.6"/>
           <circle cx="130" cy="100" r="8" fill="#7c3aed" opacity="0.8"/>
           <circle cx="270" cy="100" r="8" fill="#7c3aed" opacity="0.8"/>
           <circle cx="130" cy="180" r="8" fill="#7c3aed" opacity="0.8"/>
           <circle cx="270" cy="180" r="8" fill="#7c3aed" opacity="0.8"/>
           <line x1="138" y1="104" x2="188" y2="130" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
           <line x1="262" y1="104" x2="212" y2="130" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
           <line x1="138" y1="176" x2="188" y2="150" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
           <line x1="262" y1="176" x2="212" y2="150" stroke="#a855f7" stroke-width="1.5" opacity="0.6"/>
           <rect x="80" y="210" width="60" height="16" rx="4" fill="#7c3aed" opacity="0.6"/>
           <rect x="150" y="210" width="100" height="16" rx="4" fill="#a855f7" opacity="0.4"/>
           <rect x="260" y="210" width="60" height="16" rx="4" fill="#7c3aed" opacity="0.7"/>`,
    label: 'AI',
  },
  {
    file: 'ai-chatbot.svg',
    bg: ['#1a0533', '#2d0f5e'],
    accent: '#c084fc',
    accent2: '#9333ea',
    icon: `<rect x="80" y="60" width="240" height="160" rx="16" fill="#2d0f5e" stroke="#9333ea" stroke-width="2" opacity="0.8"/>
           <rect x="100" y="85" width="120" height="28" rx="14" fill="#4c1d95" opacity="0.9"/>
           <rect x="180" y="125" width="120" height="28" rx="14" fill="#6d28d9" opacity="0.9"/>
           <rect x="100" y="165" width="100" height="28" rx="14" fill="#4c1d95" opacity="0.9"/>
           <circle cx="95" cy="99" r="10" fill="#7c3aed"/>
           <circle cx="305" cy="139" r="10" fill="#9333ea"/>
           <circle cx="95" cy="179" r="10" fill="#7c3aed"/>
           <rect x="90" y="235" width="220" height="20" rx="10" fill="#2d0f5e" stroke="#9333ea" stroke-width="1.5" opacity="0.6"/>`,
    label: 'AI',
  },
  {
    file: 'ai-face.svg',
    bg: ['#1a0533', '#0f2744'],
    accent: '#818cf8',
    accent2: '#6366f1',
    icon: `<circle cx="200" cy="130" r="60" fill="none" stroke="#6366f1" stroke-width="2" stroke-dasharray="6 4" opacity="0.7"/>
           <circle cx="200" cy="120" r="35" fill="#1e1b4b" stroke="#818cf8" stroke-width="2" opacity="0.9"/>
           <circle cx="200" cy="110" r="18" fill="#312e81" opacity="0.8"/>
           <circle cx="193" cy="107" r="4" fill="#818cf8" opacity="0.9"/>
           <circle cx="207" cy="107" r="4" fill="#818cf8" opacity="0.9"/>
           <rect x="185" y="118" width="30" height="4" rx="2" fill="#818cf8" opacity="0.5"/>
           <rect x="80" y="205" width="240" height="12" rx="6" fill="#312e81" opacity="0.6"/>
           <rect x="80" y="225" width="100" height="10" rx="5" fill="#6366f1" opacity="0.7"/>
           <rect x="190" y="225" width="130" height="10" rx="5" fill="#4338ca" opacity="0.5"/>`,
    label: 'AI',
  },
  {
    file: 'ml-stock.svg',
    bg: ['#0f1a0f', '#1a3320'],
    accent: '#22c55e',
    accent2: '#16a34a',
    icon: `<polyline points="70,220 110,180 140,190 170,140 210,130 240,110 270,120 300,80 330,90" fill="none" stroke="#22c55e" stroke-width="2.5" opacity="0.9"/>
           <polygon points="100,200 100,170 120,170 120,200" fill="#22c55e" opacity="0.4"/>
           <polygon points="140,200 140,185 160,185 160,200" fill="#ef4444" opacity="0.4"/>
           <polygon points="180,200 180,155 200,155 200,200" fill="#22c55e" opacity="0.4"/>
           <polygon points="220,200 220,165 240,165 240,200" fill="#ef4444" opacity="0.4"/>
           <polygon points="260,200 260,140 280,140 280,200" fill="#22c55e" opacity="0.4"/>
           <line x1="70" y1="220" x2="330" y2="220" stroke="#166534" stroke-width="1" opacity="0.5"/>
           <line x1="70" y1="60" x2="70" y2="220" stroke="#166534" stroke-width="1" opacity="0.5"/>
           <rect x="80" y="60" width="120" height="30" rx="6" fill="#052e16" opacity="0.8" stroke="#16a34a" stroke-width="1"/>
           <text x="95" y="80" font-family="monospace" font-size="11" fill="#22c55e">+2.34%</text>`,
    label: 'ML',
  },
  {
    file: 'ml-sentiment.svg',
    bg: ['#0f172a', '#1e293b'],
    accent: '#fb923c',
    accent2: '#ea580c',
    icon: `<rect x="70" y="70" width="260" height="60" rx="10" fill="#1e293b" stroke="#ea580c" stroke-width="1.5" opacity="0.8"/>
           <rect x="80" y="85" width="160" height="16" rx="4" fill="#fb923c" opacity="0.7"/>
           <rect x="80" y="107" width="60" height="10" rx="3" fill="#64748b" opacity="0.5"/>
           <rect x="70" y="150" width="260" height="60" rx="10" fill="#1e293b" stroke="#ea580c" stroke-width="1.5" opacity="0.6"/>
           <rect x="80" y="165" width="80" height="16" rx="4" fill="#22c55e" opacity="0.7"/>
           <rect x="80" y="187" width="100" height="10" rx="3" fill="#64748b" opacity="0.5"/>
           <rect x="70" y="230" width="260" height="60" rx="10" fill="#1e293b" stroke="#ea580c" stroke-width="1.5" opacity="0.4"/>
           <rect x="80" y="245" width="40" height="16" rx="4" fill="#ef4444" opacity="0.7"/>`,
    label: 'ML',
  },
  {
    file: 'iot-smarthome.svg',
    bg: ['#042f2e', '#0f3d3a'],
    accent: '#2dd4bf',
    accent2: '#0d9488',
    icon: `<polygon points="200,55 290,120 290,230 110,230 110,120" fill="none" stroke="#0d9488" stroke-width="2" opacity="0.8"/>
           <rect x="170" y="170" width="60" height="60" rx="4" fill="#0f3d3a" stroke="#2dd4bf" stroke-width="1.5" opacity="0.8"/>
           <circle cx="150" cy="130" r="12" fill="#0d9488" opacity="0.8" stroke="#2dd4bf" stroke-width="1.5"/>
           <circle cx="250" cy="130" r="12" fill="#0d9488" opacity="0.8" stroke="#2dd4bf" stroke-width="1.5"/>
           <circle cx="200" cy="100" r="10" fill="#2dd4bf" opacity="0.6"/>
           <line x1="200" y1="100" x2="150" y2="130" stroke="#2dd4bf" stroke-width="1.5" opacity="0.5"/>
           <line x1="200" y1="100" x2="250" y2="130" stroke="#2dd4bf" stroke-width="1.5" opacity="0.5"/>
           <line x1="200" y1="100" x2="200" y2="170" stroke="#2dd4bf" stroke-width="1.5" opacity="0.5"/>`,
    label: 'IOT',
  },
  {
    file: 'iot-agriculture.svg',
    bg: ['#042f2e', '#1a3810'],
    accent: '#86efac',
    accent2: '#16a34a',
    icon: `<circle cx="200" cy="140" r="70" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="8 4" opacity="0.5"/>
           <circle cx="200" cy="140" r="8" fill="#22c55e" opacity="0.8"/>
           <circle cx="150" cy="95" r="10" fill="#0d9488" opacity="0.8" stroke="#86efac" stroke-width="1.5"/>
           <circle cx="250" cy="95" r="10" fill="#0d9488" opacity="0.8" stroke="#86efac" stroke-width="1.5"/>
           <circle cx="145" cy="175" r="10" fill="#0d9488" opacity="0.8" stroke="#86efac" stroke-width="1.5"/>
           <circle cx="255" cy="175" r="10" fill="#0d9488" opacity="0.8" stroke="#86efac" stroke-width="1.5"/>
           <line x1="155" y1="102" x2="192" y2="135" stroke="#86efac" stroke-width="1.5" opacity="0.5"/>
           <line x1="245" y1="102" x2="208" y2="135" stroke="#86efac" stroke-width="1.5" opacity="0.5"/>
           <line x1="152" y1="168" x2="192" y2="147" stroke="#86efac" stroke-width="1.5" opacity="0.5"/>
           <line x1="248" y1="168" x2="208" y2="147" stroke="#86efac" stroke-width="1.5" opacity="0.5"/>
           <rect x="90" y="215" width="220" height="25" rx="8" fill="#052e16" stroke="#16a34a" stroke-width="1.5" opacity="0.8"/>`,
    label: 'IOT',
  },
  {
    file: 'blockchain-voting.svg',
    bg: ['#1c1500', '#2d1f00'],
    accent: '#fbbf24',
    accent2: '#d97706',
    icon: `<rect x="70" y="80" width="80" height="60" rx="8" fill="#2d1f00" stroke="#d97706" stroke-width="2" opacity="0.9"/>
           <rect x="170" y="80" width="80" height="60" rx="8" fill="#2d1f00" stroke="#d97706" stroke-width="2" opacity="0.9"/>
           <rect x="270" y="80" width="60" height="60" rx="8" fill="#2d1f00" stroke="#fbbf24" stroke-width="2" opacity="0.9"/>
           <line x1="150" y1="110" x2="170" y2="110" stroke="#fbbf24" stroke-width="2" opacity="0.7"/>
           <line x1="250" y1="110" x2="270" y2="110" stroke="#fbbf24" stroke-width="2" opacity="0.7"/>
           <rect x="100" y="170" width="200" height="50" rx="10" fill="#1c1500" stroke="#fbbf24" stroke-width="1.5" opacity="0.8"/>
           <rect x="115" y="185" width="60" height="20" rx="5" fill="#d97706" opacity="0.5"/>
           <rect x="185" y="185" width="100" height="20" rx="5" fill="#fbbf24" opacity="0.3"/>
           <circle cx="110" cy="110" r="12" fill="#fbbf24" opacity="0.3" stroke="#d97706" stroke-width="1.5"/>
           <circle cx="210" cy="110" r="12" fill="#fbbf24" opacity="0.3" stroke="#d97706" stroke-width="1.5"/>
           <circle cx="300" cy="110" r="10" fill="#fbbf24" opacity="0.4" stroke="#d97706" stroke-width="1.5"/>`,
    label: 'BLOCKCHAIN',
  },
  {
    file: 'blockchain-nft.svg',
    bg: ['#1c1500', '#1e0a2e'],
    accent: '#e879f9',
    accent2: '#a21caf',
    icon: `<rect x="100" y="60" width="200" height="160" rx="16" fill="#1e0a2e" stroke="#a21caf" stroke-width="2" opacity="0.9"/>
           <rect x="115" y="75" width="170" height="110" rx="10" fill="#2d0f5e" opacity="0.7"/>
           <circle cx="200" cy="130" r="35" fill="none" stroke="#e879f9" stroke-width="2" opacity="0.6"/>
           <polygon points="200,100 225,145 175,145" fill="#e879f9" opacity="0.25" stroke="#e879f9" stroke-width="1.5"/>
           <rect x="115" y="195" width="170" height="14" rx="4" fill="#4c1d95" opacity="0.6"/>
           <rect x="80" y="235" width="250" height="35" rx="10" fill="#1e0a2e" stroke="#a21caf" stroke-width="1.5" opacity="0.8"/>
           <rect x="95" y="247" width="80" height="12" rx="4" fill="#e879f9" opacity="0.4"/>
           <rect x="185" y="247" width="130" height="12" rx="4" fill="#a21caf" opacity="0.4"/>`,
    label: 'BLOCKCHAIN',
  },
  {
    file: 'data-analytics.svg',
    bg: ['#0f172a', '#1e1040'],
    accent: '#38bdf8',
    accent2: '#0ea5e9',
    icon: `<rect x="70" y="65" width="70" height="150" rx="6" fill="#0ea5e9" opacity="0.3" stroke="#38bdf8" stroke-width="1.5"/>
           <rect x="155" y="90" width="70" height="125" rx="6" fill="#0ea5e9" opacity="0.5" stroke="#38bdf8" stroke-width="1.5"/>
           <rect x="240" y="110" width="70" height="105" rx="6" fill="#0ea5e9" opacity="0.4" stroke="#38bdf8" stroke-width="1.5"/>
           <polyline points="85,200 170,145 255,160 325,80" fill="none" stroke="#a78bfa" stroke-width="2.5" opacity="0.8"/>
           <circle cx="85" cy="200" r="4" fill="#a78bfa"/>
           <circle cx="170" cy="145" r="4" fill="#a78bfa"/>
           <circle cx="255" cy="160" r="4" fill="#a78bfa"/>
           <circle cx="325" cy="80" r="4" fill="#a78bfa"/>
           <rect x="70" y="225" width="260" height="2" fill="#1e40af" opacity="0.5"/>`,
    label: 'DATA',
  },
  {
    file: 'mobile-flutter.svg',
    bg: ['#0f172a', '#1a1035'],
    accent: '#fb923c',
    accent2: '#ea580c',
    icon: `<rect x="155" y="50" width="90" height="180" rx="16" fill="#1e293b" stroke="#ea580c" stroke-width="2" opacity="0.9"/>
           <rect x="163" y="65" width="74" height="130" rx="8" fill="#0f172a" opacity="0.9"/>
           <rect x="163" y="65" width="74" height="35" rx="8" fill="#1e3a1e" opacity="0.9"/>
           <circle cx="185" cy="83" r="8" fill="#fb923c" opacity="0.4"/>
           <rect x="167" y="110" width="66" height="12" rx="4" fill="#1e293b" stroke="#fb923c" stroke-width="1" opacity="0.7"/>
           <rect x="167" y="130" width="66" height="12" rx="4" fill="#1e293b" stroke="#fb923c" stroke-width="1" opacity="0.7"/>
           <rect x="167" y="150" width="66" height="12" rx="4" fill="#1e293b" stroke="#fb923c" stroke-width="1" opacity="0.7"/>
           <circle cx="200" cy="220" r="6" fill="#ea580c" opacity="0.5"/>
           <rect x="90" y="100" width="60" height="90" rx="12" fill="#1e293b" stroke="#ea580c" stroke-width="1.5" opacity="0.6"/>
           <rect x="250" y="100" width="60" height="90" rx="12" fill="#1e293b" stroke="#ea580c" stroke-width="1.5" opacity="0.6"/>`,
    label: 'MOBILE',
  },
  {
    file: 'cybersecurity-ids.svg',
    bg: ['#1a0000', '#2d0a0a'],
    accent: '#f87171',
    accent2: '#dc2626',
    icon: `<polyline points="70,180 110,160 150,170 190,130 230,140 270,80 310,90 330,70" fill="none" stroke="#22c55e" stroke-width="2" opacity="0.7"/>
           <circle cx="190" cy="130" r="6" fill="#ef4444" opacity="0.9"/>
           <circle cx="270" cy="80" r="6" fill="#ef4444" opacity="0.9"/>
           <rect x="160" y="90" width="70" height="40" rx="6" fill="#2d0a0a" stroke="#dc2626" stroke-width="2" opacity="0.9"/>
           <rect x="240" y="50" width="70" height="40" rx="6" fill="#2d0a0a" stroke="#dc2626" stroke-width="2" opacity="0.9"/>
           <text x="168" y="114" font-family="monospace" font-size="9" fill="#f87171">ALERT!</text>
           <rect x="70" y="215" width="260" height="30" rx="8" fill="#1a0000" stroke="#dc2626" stroke-width="1.5" opacity="0.8"/>
           <rect x="80" y="225" width="40" height="10" rx="3" fill="#dc2626" opacity="0.6"/>
           <rect x="130" y="225" width="80" height="10" rx="3" fill="#b91c1c" opacity="0.4"/>
           <rect x="220" y="225" width="100" height="10" rx="3" fill="#991b1b" opacity="0.3"/>`,
    label: 'CYBERSECURITY',
  },
  {
    file: 'dbms-inventory.svg',
    bg: ['#0c1628', '#0f2044'],
    accent: '#60a5fa',
    accent2: '#2563eb',
    icon: `<rect x="70" y="80" width="260" height="25" rx="6" fill="#1e3a5f" stroke="#2563eb" stroke-width="1.5" opacity="0.9"/>
           <rect x="70" y="115" width="260" height="20" rx="4" fill="#0c1628" stroke="#2563eb" stroke-width="1" opacity="0.7"/>
           <rect x="70" y="143" width="260" height="20" rx="4" fill="#0f2044" stroke="#2563eb" stroke-width="1" opacity="0.6"/>
           <rect x="70" y="171" width="260" height="20" rx="4" fill="#0c1628" stroke="#2563eb" stroke-width="1" opacity="0.7"/>
           <rect x="70" y="199" width="260" height="20" rx="4" fill="#0f2044" stroke="#2563eb" stroke-width="1" opacity="0.6"/>
           <rect x="75" y="85" width="50" height="15" rx="3" fill="#2563eb" opacity="0.4"/>
           <rect x="135" y="85" width="80" height="15" rx="3" fill="#2563eb" opacity="0.3"/>
           <rect x="225" y="85" width="50" height="15" rx="3" fill="#2563eb" opacity="0.3"/>
           <rect x="285" y="85" width="40" height="15" rx="3" fill="#2563eb" opacity="0.3"/>
           <rect x="80" y="235" width="100" height="20" rx="6" fill="#2563eb" opacity="0.5"/>
           <rect x="190" y="235" width="130" height="20" rx="6" fill="#1e3a5f" opacity="0.5"/>`,
    label: 'DBMS',
  },
  {
    file: 'web-hospital.svg',
    bg: ['#0f172a', '#1e2d3f'],
    accent: '#6ee7b7',
    accent2: '#059669',
    icon: `<rect x="80" y="60" width="240" height="170" rx="12" fill="#0f172a" stroke="#059669" stroke-width="2" opacity="0.8"/>
           <rect x="80" y="60" width="240" height="35" rx="12" fill="#064e3b" opacity="0.9"/>
           <rect x="175" y="45" width="50" height="30" rx="4" fill="#059669" opacity="0.8"/>
           <rect x="196" y="55" width="8" height="10" rx="1" fill="white" opacity="0.9"/>
           <rect x="192" y="59" width="16" height="2" rx="1" fill="white" opacity="0.9"/>
           <rect x="95" y="110" width="100" height="80" rx="8" fill="#064e3b" stroke="#6ee7b7" stroke-width="1.5" opacity="0.7"/>
           <rect x="210" y="110" width="95" height="35" rx="6" fill="#064e3b" stroke="#6ee7b7" stroke-width="1.5" opacity="0.7"/>
           <rect x="210" y="155" width="95" height="35" rx="6" fill="#064e3b" stroke="#059669" stroke-width="1.5" opacity="0.7"/>
           <rect x="80" y="245" width="240" height="15" rx="4" fill="#064e3b" opacity="0.5"/>`,
    label: 'WEB',
  },
  {
    file: 'web-lms.svg',
    bg: ['#0f172a', '#1a2744'],
    accent: '#a78bfa',
    accent2: '#7c3aed',
    icon: `<rect x="70" y="70" width="260" height="175" rx="12" fill="#1a2744" stroke="#7c3aed" stroke-width="2" opacity="0.8"/>
           <rect x="70" y="70" width="75" height="175" rx="12" fill="#0f172a" opacity="0.9"/>
           <rect x="80" y="90" width="55" height="30" rx="6" fill="#7c3aed" opacity="0.4"/>
           <rect x="80" y="130" width="55" height="20" rx="4" fill="#6d28d9" opacity="0.3"/>
           <rect x="80" y="158" width="55" height="20" rx="4" fill="#6d28d9" opacity="0.3"/>
           <rect x="80" y="186" width="55" height="20" rx="4" fill="#6d28d9" opacity="0.3"/>
           <rect x="160" y="85" width="155" height="60" rx="8" fill="#0f172a" stroke="#7c3aed" stroke-width="1.5" opacity="0.8"/>
           <rect x="170" y="100" width="100" height="10" rx="3" fill="#a78bfa" opacity="0.5"/>
           <rect x="170" y="118" width="70" height="8" rx="3" fill="#6d28d9" opacity="0.4"/>
           <rect x="160" y="160" width="155" height="60" rx="8" fill="#0f172a" stroke="#7c3aed" stroke-width="1.5" opacity="0.6"/>
           <rect x="170" y="175" width="100" height="10" rx="3" fill="#a78bfa" opacity="0.5"/>
           <rect x="85" y="255" width="230" height="15" rx="4" fill="#2d1f00" opacity="0"/>`,
    label: 'WEB',
  },
  {
    file: 'web-social.svg',
    bg: ['#0f172a', '#162033'],
    accent: '#34d399',
    accent2: '#059669',
    icon: `<circle cx="160" cy="120" r="30" fill="#1e293b" stroke="#059669" stroke-width="2" opacity="0.8"/>
           <circle cx="240" cy="100" r="22" fill="#1e293b" stroke="#059669" stroke-width="1.5" opacity="0.7"/>
           <circle cx="300" cy="150" r="18" fill="#1e293b" stroke="#059669" stroke-width="1.5" opacity="0.6"/>
           <line x1="185" y1="125" x2="220" y2="112" stroke="#34d399" stroke-width="1.5" opacity="0.5"/>
           <line x1="260" y1="107" x2="283" y2="138" stroke="#34d399" stroke-width="1.5" opacity="0.5"/>
           <rect x="80" y="170" width="240" height="14" rx="4" fill="#1e293b" stroke="#059669" stroke-width="1" opacity="0.7"/>
           <rect x="80" y="194" width="240" height="12" rx="4" fill="#0f2744" stroke="#059669" stroke-width="1" opacity="0.5"/>
           <rect x="80" y="216" width="240" height="12" rx="4" fill="#1e293b" stroke="#059669" stroke-width="1" opacity="0.6"/>
           <circle cx="160" cy="120" r="12" fill="#059669" opacity="0.3"/>
           <circle cx="240" cy="100" r="8" fill="#059669" opacity="0.3"/>`,
    label: 'WEB',
  },
];

for (const img of images) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <defs>
    <linearGradient id="bg-${img.file}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${img.bg[0]}"/>
      <stop offset="100%" stop-color="${img.bg[1]}"/>
    </linearGradient>
    <pattern id="grid-${img.file}" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${img.accent}" stroke-width="0.35" opacity="0.15"/>
    </pattern>
  </defs>
  <!-- Background -->
  <rect width="400" height="300" fill="url(#bg-${img.file})"/>
  <!-- Grid -->
  <rect width="400" height="300" fill="url(#grid-${img.file})"/>
  <!-- Category badge -->
  <rect x="14" y="14" width="${img.label.length * 9 + 16}" height="22" rx="6" fill="${img.accent2}" opacity="0.85"/>
  <text x="22" y="29" font-family="ui-monospace,monospace" font-size="11" font-weight="bold" fill="white" letter-spacing="1">${img.label}</text>
  <!-- Main illustration -->
  ${img.icon}
  <!-- Bottom glow -->
  <rect x="0" y="260" width="400" height="40" fill="url(#bg-${img.file})" opacity="0.7"/>
</svg>`;

  writeFileSync(join(OUT, img.file), svg, 'utf8');
  console.log('✅', img.file);
}

console.log(`\n✨ Generated ${images.length} SVG project images → public/projects/`);
