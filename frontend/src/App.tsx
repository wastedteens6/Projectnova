import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import { SettingsProvider, useSettings } from './context/SettingsContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import { BackgroundContainer } from './components/ui/BoxesBackground'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ProjectUpload from './pages/ProjectUpload'
import CustomProjectForm from './pages/CustomProjectForm'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import Cart from './pages/Cart'
import Receipt from './pages/Receipt'
import AdminLogin from './pages/AdminLogin'
import AdminRoute from './components/AdminRoute'
import ProtectedRoute from './components/ProtectedRoute'
import AdminDashboard from './pages/AdminDashboard'
import AdminProjects from './pages/AdminProjects'
import AdminCustomProjects from './pages/AdminCustomProjects'
import AdminUsers from './pages/AdminUsers'
import AdminOrders from './pages/AdminOrders'
import AdminSupport from './pages/AdminSupport'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminCreateProject from './pages/AdminCreateProject'
import AdminPurchases from './pages/AdminPurchases'
import AdminRoles from './pages/AdminRoles'
import AdminSettings from './pages/AdminSettings'
import Dashboard from './pages/Dashboard'
import Docs from './pages/Docs'
import Support from './pages/Support'
import NotFound from './pages/NotFound'

function SiteHeadUpdater() {
  const { settings } = useSettings()

  useEffect(() => {
    // Update Document Title
    if (settings.siteName) {
      document.title = `${settings.siteName} — Buy Smart Academic Projects`
    }

    // Update Favicon
    if (settings.favicon) {
      const link: HTMLLinkElement = document.querySelector("link[rel~='icon']") || document.createElement('link')
      link.rel = 'icon'
      link.href = `${import.meta.env.VITE_API_URL||'http://localhost:5000'}${settings.favicon}`
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }, [settings])

  return null
}

function AppContent() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin/')
  
  return (
    <BackgroundContainer>
      <SiteHeadUpdater />
      {!isAdminRoute && <Navbar className="pointer-events-auto" />}
      <main className="flex-grow flex flex-col pointer-events-auto">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<ProjectDetail />} />
          <Route path="/auth/login" element={<Login />} />
          <Route path="/auth/register" element={<Register />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected user routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/receipt/:transactionId" element={<Receipt />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/projects/custom" element={<CustomProjectForm />} />
            <Route path="/projects/upload" element={<ProjectUpload />} />
            <Route path="/support" element={<Support />} />
          </Route>

          {/* Protected admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects/create" element={<AdminCreateProject />} />
            <Route path="/admin/projects/edit/:id" element={<AdminCreateProject />} />
            <Route path="/admin/custom-projects" element={<AdminCustomProjects />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/roles" element={<AdminRoles />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/purchases" element={<AdminPurchases />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </Route>

          <Route path="/docs" element={<Docs />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer className="pointer-events-auto" />
    </BackgroundContainer>
  )
}

function App() {
  return (
    <ThemeProvider>
      <SettingsProvider>
        <Router>
          <AppContent />
        </Router>
      </SettingsProvider>
    </ThemeProvider>
  )
}

export default App
