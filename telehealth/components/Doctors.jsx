'use client'
import { useState } from 'react'
import { Search, Star, Calendar, MapPin, Clock, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { doctors } from '@/lib/data'

export default function Doctors() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSpecialty, setSelectedSpecialty] = useState('all')
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [showBooking, setShowBooking] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const specialties = ['all', ...new Set(doctors.map(doctor => doctor.specialty))]

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSpecialty = selectedSpecialty === 'all' || doctor.specialty === selectedSpecialty
    return matchesSearch && matchesSpecialty
  })

  const handleBookAppointment = () => {
    console.log({
      doctor: selectedDoctor?.name,
      date: selectedDate,
      time: selectedTime
    })
    setShowBooking(false)
    setSelectedDate('')
    setSelectedTime('')
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Find Doctors</h1>
        <p className="text-muted-foreground">Discover and book appointments with qualified healthcare professionals</p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search doctors by name or specialty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Specialties" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty === 'all' ? 'All Specialties' : specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Doctors Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={doctor.image} alt={doctor.name} />
                  <AvatarFallback>{doctor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{doctor.name}</CardTitle>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="text-sm font-medium">{doctor.rating}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">{doctor.specialty}</Badge>
                  <p className="text-sm text-muted-foreground">{doctor.experience} experience</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">{doctor.bio}</p>
                <p className="text-xs text-muted-foreground">
                  <strong>Education:</strong> {doctor.education}
                </p>
              </div>

              {/* Available Times */}
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Available Today
                </h4>
                <div className="flex flex-wrap gap-2">
                  {doctor.availability.slice(0, 4).map((time, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {time}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={() => {
                    setSelectedDoctor(doctor)
                    setShowBooking(true)
                  }}
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button variant="outline" size="sm">
                  View Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No doctors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search criteria or browse all available doctors.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book Appointment with {selectedDoctor?.name}</DialogTitle>
            <DialogDescription>
              {selectedDoctor?.specialty} • {selectedDoctor?.experience} experience
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
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
              <Label>Available Times</Label>
              <div className="grid grid-cols-2 gap-2">
                {selectedDoctor?.availability.map((time) => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleBookAppointment}
                disabled={!selectedDate || !selectedTime}
                className="flex-1"
              >
                Confirm Booking
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBooking(false)}
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