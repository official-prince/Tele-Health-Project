import { Calendar, Clock, Users, Activity, TrendingUp, Heart, Thermometer, Weight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { appointments, notifications } from '@/lib/data'

export default function Dashboard({ setActiveTab, user }) {
  const upcomingAppointments = appointments.filter(apt => apt.status === 'confirmed').slice(0, 3)
  const recentNotifications = notifications.slice(0, 4)

  const userName = user ? user.firstName || user.email.split('@')[0] : 'User'

  const vitalStats = [
    { icon: Heart, label: 'Heart Rate', value: '72 bpm', status: 'normal', color: 'text-green-500' },
    { icon: Thermometer, label: 'Temperature', value: '98.6°F', status: 'normal', color: 'text-green-500' },
    { icon: Weight, label: 'Weight', value: '165 lbs', status: 'stable', color: 'text-blue-500' },
    { icon: TrendingUp, label: 'Blood Pressure', value: '120/80', status: 'normal', color: 'text-green-500' },
  ]

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="gradient-bg rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
            <p className="text-blue-100">Your health dashboard is ready. Stay on top of your wellness journey.</p>
          </div>
          <div className="hidden md:block">
            <Activity className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Tomorrow</div>
            <p className="text-xs text-muted-foreground">
              Dr. Sarah Johnson at 10:00 AM
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 due for refill soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">85/100</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              This year
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your scheduled consultations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                <div className="space-y-1">
                  <p className="font-medium">{appointment.doctorName}</p>
                  <p className="text-sm text-muted-foreground">{appointment.specialty}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-3 w-3" />
                    {appointment.date} at {appointment.time}
                  </div>
                </div>
                <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                  {appointment.status}
                </Badge>
              </div>
            ))}
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setActiveTab('appointments')}
            >
              View All Appointments
            </Button>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle>Latest Vitals</CardTitle>
            <CardDescription>Your recent health metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {vitalStats.map((vital, index) => {
              const Icon = vital.icon
              return (
                <div key={index} className="flex items-center justify-between p-3 rounded-md bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${vital.color}`} />
                    <div>
                      <p className="font-medium">{vital.label}</p>
                      <p className="text-sm text-muted-foreground">{vital.status}</p>
                    </div>
                  </div>
                  <span className="font-bold">{vital.value}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest health updates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentNotifications.map((notification) => (
              <div key={notification.id} className="flex items-start gap-3 p-3 rounded-md bg-muted/30">
                <div className={`h-2 w-2 rounded-full mt-2 ${notification.type === 'appointment' ? 'bg-blue-500' : notification.type === 'prescription' ? 'bg-purple-500' : 'bg-green-500'}`} />
                <div className="flex-1">
                  <p className="font-medium">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}