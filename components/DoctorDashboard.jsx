'use client'
import { useState } from 'react'
import { Calendar, Clock, Users, DollarSign, FileText, Video, Phone, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

const doctorAppointments = [
  {
    id: 1,
    patientName: "John Smith",
    time: "10:00 AM",
    type: "video",
    status: "confirmed",
    reason: "Follow-up consultation"
  },
  {
    id: 2,
    patientName: "Sarah Wilson",
    time: "11:30 AM",
    type: "video",
    status: "confirmed",
    reason: "Initial consultation"
  },
  {
    id: 3,
    patientName: "Michael Brown",
    time: "2:00 PM",
    type: "phone",
    status: "pending",
    reason: "Prescription review"
  }
]

const earnings = {
  today: 450.00,
  thisWeek: 2100.00,
  thisMonth: 8500.00,
  consultationsToday: 3,
  consultationsWeek: 14,
  consultationsMonth: 56
}

export default function DoctorDashboard() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  return (
    <div className="space-y-6 p-6">
      <div className="gradient-bg rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Good morning, Dr. Johnson!</h1>
            <p className="text-blue-100">You have 3 appointments scheduled for today</p>
          </div>
          <div className="hidden md:block">
            <Users className="h-16 w-16 opacity-20" />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.today.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {earnings.consultationsToday} consultations
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.thisWeek.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {earnings.consultationsWeek} consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${earnings.thisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {earnings.consultationsMonth} consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Patient Rating</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4.9</div>
            <p className="text-xs text-muted-foreground">
              Based on 127 reviews
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="appointments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="appointments">Today's Schedule</TabsTrigger>
          <TabsTrigger value="patients">Patient Management</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Appointments</CardTitle>
              <CardDescription>January 15, 2024</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {doctorAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarFallback>{appointment.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{appointment.patientName}</h3>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-3 w-3" />
                        {appointment.time}
                        {appointment.type === 'video' ? (
                          <Video className="h-3 w-3" />
                        ) : (
                          <Phone className="h-3 w-3" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                      {appointment.status}
                    </Badge>
                    <Button size="sm">
                      {appointment.type === 'video' ? 'Start Video' : 'Start Call'}
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Patients</CardTitle>
              <CardDescription>Patients you've consulted with recently</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {doctorAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>{appointment.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{appointment.patientName}</h3>
                        <p className="text-sm text-muted-foreground">Last visit: Today, {appointment.time}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        View Records
                      </Button>
                      <Button size="sm">
                        Schedule Follow-up
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earnings" className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.today.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{earnings.consultationsToday} consultations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.thisWeek.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{earnings.consultationsWeek} consultations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${earnings.thisMonth.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">{earnings.consultationsMonth} consultations</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="availability" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Set Your Availability</CardTitle>
              <CardDescription>Manage when patients can book appointments with you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center">
                    <p className="font-medium mb-2">{day}</p>
                    <div className="space-y-1">
                      <Button variant="outline" size="sm" className="w-full text-xs">9:00 AM</Button>
                      <Button variant="outline" size="sm" className="w-full text-xs">11:00 AM</Button>
                      <Button variant="outline" size="sm" className="w-full text-xs">2:00 PM</Button>
                      <Button variant="outline" size="sm" className="w-full text-xs">4:00 PM</Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full">Update Availability</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}