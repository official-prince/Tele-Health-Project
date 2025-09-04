'use client'
import { useState } from 'react'
import { Bell, Menu, Search, User, Video, Calendar, FileText, Pill, LogOut, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { notifications } from '@/lib/data'

export default function Header({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen, user, onSignOut }) {
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const unreadCount = notifications.filter(n => n.unread).length

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'doctors', label: 'Find Doctors', icon: User },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'consultation', label: 'Video Call', icon: Video },
  ]

  const userInitials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U'
  const userName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'User'

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">TH</span>
            </div>
            <h1 className="hidden text-xl font-bold text-primary md:block">TeleHealth Pro</h1>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search doctors, appointments..."
              className="h-9 w-64 rounded-md border border-input bg-background pl-10 pr-4 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setNotificationOpen(!notificationOpen)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -right-2 -top-2 h-5 w-5 rounded-full p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>

            {notificationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-md border bg-popover p-4 shadow-md">
                <h3 className="font-semibold text-sm mb-3">Notifications</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 rounded-md ${notification.unread ? 'bg-accent' : 'bg-muted/50'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{notification.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                        </div>
                        {notification.unread && (
                          <div className="h-2 w-2 rounded-full bg-primary"></div>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <Button
              variant="ghost"
              className="flex items-center gap-2"
              onClick={() => setProfileOpen(!profileOpen)}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&q=80" />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
              <span className="hidden md:block">{userName}</span>
            </Button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-md border bg-popover p-2 shadow-md">
                <div className="px-3 py-2">
                  <p className="font-medium">{userName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <hr className="my-2" />
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Button>
                <hr className="my-2" />
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-sm text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  onClick={onSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {sidebarOpen && (
        <div className="md:hidden border-t">
          <nav className="grid grid-cols-2 gap-1 p-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeTab === item.id ? "default" : "ghost"}
                  className="flex items-center gap-2 justify-start"
                  onClick={() => {
                    setActiveTab(item.id)
                    setSidebarOpen(false)
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              )
            })}
          </nav>
        </div>
      )}
    </header>
  )
}