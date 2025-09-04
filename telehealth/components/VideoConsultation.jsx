'use client'
import { useState, useEffect } from 'react'
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Settings, Users, MessageCircle, Share, Camera, Volume2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'

export default function VideoConsultation() {
  const [isInCall, setIsInCall] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'Dr. Sarah Johnson', message: 'Hello John, how are you feeling today?', time: '10:30 AM' },
    { id: 2, sender: 'You', message: 'Hi Doctor, I\'ve been experiencing some chest discomfort.', time: '10:31 AM' }
  ])
  const [newMessage, setNewMessage] = useState('')

  const mockDoctor = {
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80'
  }

  useEffect(() => {
    let interval = null
    if (isInCall) {
      interval = setInterval(() => {
        setCallDuration(duration => duration + 1)
      }, 1000)
    } else if (!isInCall) {
      setCallDuration(0)
    }
    return () => clearInterval(interval)
  }, [isInCall])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startCall = () => {
    setIsInCall(true)
    setCallDuration(0)
  }

  const endCall = () => {
    setIsInCall(false)
    setCallDuration(0)
  }

  const sendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([
        ...chatMessages,
        { id: Date.now(), sender: 'You', message: newMessage, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
      ])
      setNewMessage('')
    }
  }

  if (!isInCall) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Video Consultation</h1>
          <p className="text-muted-foreground">Connect with your healthcare provider through secure video calls</p>
        </div>

        {/* Upcoming Consultation */}
        <Card className="gradient-bg text-white">
          <CardHeader>
            <CardTitle>Scheduled Consultation</CardTitle>
            <CardDescription className="text-blue-100">Your next appointment is ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={mockDoctor.image} />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold">{mockDoctor.name}</h3>
                <p className="text-blue-100">{mockDoctor.specialty}</p>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Today, 10:30 AM
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    Video Call
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={startCall}
                className="bg-white text-primary hover:bg-white/90"
              >
                <Video className="h-4 w-4 mr-2" />
                Join Video Call
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10">
                <Phone className="h-4 w-4 mr-2" />
                Audio Only
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pre-call Setup */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Before Your Call</CardTitle>
              <CardDescription>Prepare for your consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                <Camera className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Test Your Camera</p>
                  <p className="text-sm text-muted-foreground">Camera is working properly</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                <Mic className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Test Your Microphone</p>
                  <p className="text-sm text-muted-foreground">Microphone is working properly</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-md bg-muted/30">
                <Volume2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">Test Your Speakers</p>
                  <p className="text-sm text-muted-foreground">Audio output is working</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Audio/Video Settings
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Session Information</CardTitle>
              <CardDescription>Important details for your consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Session Duration</p>
                  <p className="text-sm text-muted-foreground">30 minutes scheduled</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Consultation Type</p>
                  <p className="text-sm text-muted-foreground">Follow-up appointment</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Privacy</p>
                  <p className="text-sm text-muted-foreground">End-to-end encrypted session</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Recording</p>
                  <p className="text-sm text-muted-foreground">Not being recorded</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <div className="h-full flex flex-col gap-4">
        {/* Call Header */}
        <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={mockDoctor.image} />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{mockDoctor.name}</h3>
              <p className="text-sm text-muted-foreground">{mockDoctor.specialty}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              {formatDuration(callDuration)}
            </Badge>
            <Badge variant="secondary">HD</Badge>
          </div>
        </div>

        {/* Video Area */}
        <div className="flex-1 grid md:grid-cols-4 gap-4">
          {/* Main Video */}
          <div className="md:col-span-3 relative">
            <Card className="h-full">
              <CardContent className="p-0 h-full">
                <div className="h-full bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-lg flex items-center justify-center relative">
                  <div className="text-center">
                    <Avatar className="h-32 w-32 mx-auto mb-4">
                      <AvatarImage src={mockDoctor.image} />
                      <AvatarFallback className="text-2xl">SJ</AvatarFallback>
                    </Avatar>
                    <h3 className="text-2xl font-semibold mb-2">{mockDoctor.name}</h3>
                    <Badge variant="outline">Video Connected</Badge>
                  </div>
                  
                  {/* Self Video (Picture-in-Picture) */}
                  <div className="absolute bottom-4 right-4 w-32 h-24 bg-black/50 rounded-lg border-2 border-primary flex items-center justify-center">
                    {isVideoOn ? (
                      <div className="text-white text-xs">Your Video</div>
                    ) : (
                      <div className="text-center text-white">
                        <VideoOff className="h-6 w-6 mx-auto mb-1" />
                        <div className="text-xs">Video Off</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Panel */}
          <Card className="flex flex-col h-full">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-3">
              <div className="flex-1 space-y-3 overflow-y-auto mb-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium">{msg.sender}</span>
                      <span className="text-xs text-muted-foreground">{msg.time}</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded text-sm">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button size="sm" onClick={sendMessage}>
                  Send
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Control Bar */}
        <div className="flex items-center justify-center gap-3 p-4 bg-card rounded-lg border">
          <Button
            variant={isVideoOn ? "default" : "destructive"}
            size="icon"
            onClick={() => setIsVideoOn(!isVideoOn)}
            className="rounded-full"
          >
            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isAudioOn ? "default" : "destructive"}
            size="icon"
            onClick={() => setIsAudioOn(!isAudioOn)}
            className="rounded-full"
          >
            {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isScreenSharing ? "default" : "outline"}
            size="icon"
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className="rounded-full"
          >
            <Share className="h-5 w-5" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowSettings(true)}
            className="rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="destructive"
            onClick={endCall}
            className="rounded-full px-6"
          >
            <PhoneOff className="h-5 w-5 mr-2" />
            End Call
          </Button>
        </div>
      </div>

      {/* Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Settings</DialogTitle>
            <DialogDescription>
              Adjust your audio and video settings for the call
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Camera</h4>
              <Button variant="outline" className="w-full justify-start">
                Default Camera
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Microphone</h4>
              <Button variant="outline" className="w-full justify-start">
                Default Microphone
              </Button>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Speakers</h4>
              <Button variant="outline" className="w-full justify-start">
                Default Speakers
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}