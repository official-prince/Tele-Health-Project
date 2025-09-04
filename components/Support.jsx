'use client'
import { useState } from 'react'
import { MessageCircle, Phone, Mail, Search, HelpCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const faqData = [
  {
    id: 1,
    question: "How do I schedule an appointment?",
    answer: "You can schedule an appointment by going to the 'Find Doctors' section, selecting your preferred doctor, and clicking 'Book Appointment'. Choose your preferred date and time from the available slots."
  },
  {
    id: 2,
    question: "What do I need for a video consultation?",
    answer: "You'll need a device with a camera and microphone (computer, tablet, or smartphone), a stable internet connection, and a quiet, private space for your consultation."
  },
  {
    id: 3,
    question: "How secure are my medical records?",
    answer: "All medical records are encrypted and stored securely in compliance with HIPAA regulations. Only you and your authorized healthcare providers can access your information."
  },
  {
    id: 4,
    question: "Can I get prescriptions through telehealth?",
    answer: "Yes, licensed doctors can prescribe medications during your consultation. Prescriptions are sent electronically to your preferred pharmacy."
  },
  {
    id: 5,
    question: "What if I need emergency care?",
    answer: "For medical emergencies, call 911 immediately. Our platform is designed for non-emergency consultations and routine healthcare needs."
  }
]

const supportTickets = [
  {
    id: 1,
    subject: "Unable to join video call",
    status: "open",
    priority: "high",
    created: "2024-01-12",
    lastUpdate: "2024-01-12"
  },
  {
    id: 2,
    subject: "Prescription refill question",
    status: "resolved",
    priority: "medium",
    created: "2024-01-10",
    lastUpdate: "2024-01-11"
  }
]

export default function Support() {
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  })

  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <Clock className="h-4 w-4 text-yellow-500" />
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'urgent': return <AlertTriangle className="h-4 w-4 text-red-500" />
      default: return <HelpCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const handleSubmitTicket = () => {
    console.log('Support ticket submitted:', ticketForm)
    setShowNewTicket(false)
    setTicketForm({ subject: '', category: '', priority: 'medium', description: '' })
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get assistance with your telehealth experience</p>
      </div>

      {/* Emergency Contact */}
      <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Medical Emergency
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-700 dark:text-red-300 mb-4">
            If you're experiencing a medical emergency, call 911 immediately or go to your nearest emergency room.
          </p>
          <Button variant="destructive" className="w-full">
            <Phone className="h-4 w-4 mr-2" />
            Call Emergency Services (911)
          </Button>
        </CardContent>
      </Card>

      {/* Quick Support Options */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowChatbot(true)}>
          <CardContent className="p-6 text-center">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Live Chat</h3>
            <p className="text-sm text-muted-foreground">Get instant help from our AI assistant</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Phone className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Phone Support</h3>
            <p className="text-sm text-muted-foreground mb-3">Call us at (555) 123-4567</p>
            <Badge variant="outline">24/7 Available</Badge>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow" onClick={() => setShowNewTicket(true)}>
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Submit Ticket</h3>
            <p className="text-sm text-muted-foreground">Send us a detailed message</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="faq" className="space-y-6">
        <TabsList>
          <TabsTrigger value="faq">FAQ</TabsTrigger>
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="guides">User Guides</TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search frequently asked questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredFAQ.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{item.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Support Tickets</h3>
            <Button onClick={() => setShowNewTicket(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Ticket
            </Button>
          </div>

          <div className="space-y-4">
            {supportTickets.map((ticket) => (
              <Card key={ticket.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(ticket.status)}
                        <h3 className="font-medium">{ticket.subject}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Created: {ticket.created}</span>
                        <span>Last update: {ticket.lastUpdate}</span>
                        <Badge variant="outline">{ticket.priority} priority</Badge>
                      </div>
                    </div>
                    <Badge variant={ticket.status === 'resolved' ? 'default' : 'secondary'}>
                      {ticket.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Learn the basics of using TeleHealth Pro</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Video Consultation Setup</CardTitle>
                <CardDescription>Prepare for your first video call</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Managing Prescriptions</CardTitle>
                <CardDescription>How to request refills and track medications</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Understanding how we protect your data</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">View Guide</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Ticket Dialog */}
      <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll get back to you as soon as possible
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="Brief description of your issue"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={ticketForm.category} onValueChange={(value) => setTicketForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical Issue</SelectItem>
                    <SelectItem value="billing">Billing Question</SelectItem>
                    <SelectItem value="appointment">Appointment Help</SelectItem>
                    <SelectItem value="prescription">Prescription Issue</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={ticketForm.priority} onValueChange={(value) => setTicketForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Please provide detailed information about your issue..."
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitTicket}
                disabled={!ticketForm.subject || !ticketForm.description}
                className="flex-1"
              >
                Submit Ticket
              </Button>
              <Button variant="outline" onClick={() => setShowNewTicket(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chatbot Dialog */}
      <Dialog open={showChatbot} onOpenChange={setShowChatbot}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>TeleHealth Assistant</DialogTitle>
            <DialogDescription>
              I'm here to help you with common questions and issues
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="h-64 border rounded-md p-4 bg-muted/30 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">Hello! I'm your TeleHealth assistant. How can I help you today?</p>
                </div>
                <div className="bg-muted p-3 rounded-lg ml-8">
                  <p className="text-sm">Hi, I'm having trouble joining my video call.</p>
                </div>
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">I can help with that! First, please check that your camera and microphone permissions are enabled for this website.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Input placeholder="Type your message..." className="flex-1" />
              <Button size="sm">Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}