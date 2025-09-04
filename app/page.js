@@ .. @@
 import MedicalRecords from '@/components/MedicalRecords'
 import Prescriptions from '@/components/Prescriptions'
 import VideoConsultation from '@/components/VideoConsultation'
+import PatientProfile from '@/components/PatientProfile'
+import Billing from '@/components/Billing'
+import Support from '@/components/Support'
+import DoctorDashboard from '@/components/DoctorDashboard'
+import AdminPanel from '@/components/AdminPanel'

 export default function Home() {
@@ .. @@
   const [activeTab, setActiveTab] = useState('dashboard')
   const [sidebarOpen, setSidebarOpen] = useState(false)
   const [loading, setLoading] = useState(true)
+  const [userRole, setUserRole] = useState('patient') // 'patient', 'doctor', 'admin'

   // Check for existing authentication on mount
@@ .. @@
         try {
           const userData = JSON.parse(savedUser)
           setUser(userData)
           setIsAuthenticated(true)
+          setUserRole(userData.role || 'patient')
         } catch (error) {
           console.error('Error parsing saved user data:', error)
@@ .. @@
   const handleAuthSuccess = (userData) => {
     setUser(userData)
     setIsAuthenticated(true)
+    setUserRole(userData.role || 'patient')
     localStorage.setItem('telehealth_user', JSON.stringify(userData))
   }

@@ .. @@
     setUser(null)
     setActiveTab('dashboard')
     localStorage.removeItem('telehealth_user')
+    setUserRole('patient')
   }

+  const handleUpdateUser = (updatedData) => {
+    const newUserData = { ...user, ...updatedData }
+    setUser(newUserData)
+    localStorage.setItem('telehealth_user', JSON.stringify(newUserData))
+  }
+
   const renderActiveComponent = () => {
+    // Show different dashboards based on user role
+    if (activeTab === 'dashboard') {
+      switch (userRole) {
+        case 'doctor':
+          return <DoctorDashboard />
+        case 'admin':
+          return <AdminPanel />
+        default:
+          return <Dashboard setActiveTab={setActiveTab} user={user} />
+      }
+    }
+
     switch (activeTab) {
-      case 'dashboard':
-        return <Dashboard setActiveTab={setActiveTab} user={user} />
       case 'appointments':
         return <Appointments />
       case 'doctors':
@@ -6,6 +32,12 @@
         return <Prescriptions />
       case 'consultation':
         return <VideoConsultation />
+      case 'profile':
+        return <PatientProfile user={user} onUpdateUser={handleUpdateUser} />
+      case 'billing':
+        return <Billing />
+      case 'support':
+        return <Support />
       default:
         return <Dashboard setActiveTab={setActiveTab} user={user} />
     }