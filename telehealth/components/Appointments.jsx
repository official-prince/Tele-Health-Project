'use client'
import { useState } from 'react'
import { Calendar, Clock, Video, Phone, MapPin, Plus, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { appointments, doctors } from '@/lib/data'

export default function Appointments() {
  const [showNewAppointment, setShowNewAppointment] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [appointmentType, setAppointmentType] = useState('video')
  const [filterStatus, setFilterStatus] = useState('all')

  const filteredAppointments = appointments.filter(apt => 
    filterStatus === 'all' || apt.status === filterStatus
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleBookAppointment = () => {
    // In a real app, this would make an API call
    console.log({
      doctor: selectedDoctor,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType
    })
    setShowNewAppointment(false)
    // Reset form
    setSelectedDoctor('')
    setSelectedDate('')
    setSelectedTime('')
    setAppointmentType('video')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage your medical consultations</p>
        </div>
        <Button onClick={() => setShowNewAppointment(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Book New Appointment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <Label className="text-sm font-medium">Filter by status:</Label>
            <div className="flex flex-wrap gap-2">
              {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <div className="grid gap-4">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No appointments found</h3>
              <p className="text-muted-foreground mb-4">
                {filterStatus === 'all' 
                  ? "You don't have any appointments scheduled." 
                  : `No ${filterStatus} appointments found.`
                }
              </p>
              <Button onClick={() => setShowNewAppointment(true)}>
                Book Your First Appointment
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(appointment.status)}`} />
                      <h3 className="text-xl font-semibold">{appointment.doctorName}</h3>
                      <Badge variant="outline">{appointment.specialty}</Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {appointment.date}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {appointment.time}
                      </div>
                      <div className="flex items-center gap-2">
                        {appointment.type === 'video' ? (
                          <Video className="h-4 w-4" />
                        ) : appointment.type === 'phone' ? (
                          <Phone className="h-4 w-4" />
                        ) : (
                          <MapPin className="h-4 w-4" />
                        )}
                        {appointment.type === 'video' ? 'Video Call' : appointment.type === 'phone' ? 'Phone Call' : 'In-Person'}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    {appointment.status === 'confirmed' && (
                      <Button className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Join Call
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      {appointment.status === 'pending' ? 'Cancel' : 'Reschedule'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Book New Appointment Dialog */}
      <Dialog open={showNewAppointment} onOpenChange={setShowNewAppointment}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              Schedule a consultation with one of our healthcare professionals.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doctor">Select Doctor</Label>
              <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a doctor" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.name}>
                      {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Appointment Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Preferred Time</Label>
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {['9:00 AM', '10:00 AM', '11:00 AM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Consultation Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video Call</SelectItem>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleBookAppointment}
                disabled={!selectedDoctor || !selectedDate || !selectedTime}
                className="flex-1"
              >
                Book Appointment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowNewAppointment(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}