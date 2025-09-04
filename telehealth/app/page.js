'use client'
import { useState, useEffect } from 'react'
import AuthForm from '@/components/auth/AuthForm'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import Appointments from '@/components/Appointments'
import Doctors from '@/components/Doctors'
import MedicalRecords from '@/components/MedicalRecords'
import Prescriptions from '@/components/Prescriptions'
import VideoConsultation from '@/components/VideoConsultation'

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('telehealth_user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setIsAuthenticated(true)
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('telehealth_user')
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const handleAuthSuccess = (userData) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('telehealth_user', JSON.stringify(userData))
  }

  const handleSignOut = () => {
    setIsAuthenticated(false)
    setUser(null)
    setActiveTab('dashboard')
    localStorage.removeItem('telehealth_user')
  }

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} user={user} />
      case 'appointments':
        return <Appointments />
      case 'doctors':
        return <Doctors />
      case 'records':
        return <MedicalRecords />
      case 'prescriptions':
        return <Prescriptions />
      case 'consultation':
        return <VideoConsultation />
      default:
        return <Dashboard setActiveTab={setActiveTab} user={user} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-lg">Loading TeleHealth Pro...</span>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <AuthForm
        mode={authMode}
        onModeChange={setAuthMode}
        onAuthSuccess={handleAuthSuccess}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        user={user}
        onSignOut={handleSignOut}
      />
      <main className="pb-6">
        {renderActiveComponent()}
      </main>
    </div>
  )
}