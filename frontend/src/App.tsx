import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import ProjectUpload from './pages/ProjectUpload'
import CustomProjectForm from './pages/CustomProjectForm'
import Login from './pages/Login'
import Register from './pages/Register'
import Checkout from './pages/Checkout'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import AdminProjects from './pages/AdminProjects'
import AdminCustomProjects from './pages/AdminCustomProjects'
import AdminUsers from './pages/AdminUsers'
import AdminOrders from './pages/AdminOrders'
import AdminSupport from './pages/AdminSupport'
import AdminAnalytics from './pages/AdminAnalytics'
import AdminCreateProject from './pages/AdminCreateProject'
import Dashboard from './pages/Dashboard'
import Docs from './pages/Docs'
import Support from './pages/Support'
import NotFound from './pages/NotFound'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/custom" element={<CustomProjectForm />} />
            <Route path="/projects/upload" element={<ProjectUpload />} />
            <Route path="/projects/:slug" element={<ProjectDetail />} />
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/projects/create" element={<AdminCreateProject />} />
            <Route path="/admin/projects/edit/:id" element={<AdminCreateProject />} />
            <Route path="/admin/custom-projects" element={<AdminCustomProjects />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/support" element={<AdminSupport />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/support" element={<Support />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </Router>
    </ThemeProvider>
  )
}

export default App
