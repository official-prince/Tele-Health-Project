'use client'
import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, Phone, Calendar, Shield } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function AuthForm({ mode, onModeChange, onAuthSuccess }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    dateOfBirth: '',
    gender: ''
  })
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (mode === 'signup') {
      if (!formData.firstName) newErrors.firstName = 'First name is required'
      if (!formData.lastName) newErrors.lastName = 'Last name is required'
      if (!formData.phone) newErrors.phone = 'Phone number is required'
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required'
      if (!formData.gender) newErrors.gender = 'Gender is required'
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      if (mode === 'signup') {
        // Store user data in localStorage for demo
        localStorage.setItem('telehealth_user', JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          id: Date.now().toString()
        }))
      }
      onAuthSuccess({
        email: formData.email,
        firstName: formData.firstName || formData.email.split('@')[0],
        lastName: formData.lastName || ''
      })
    }, 1500)
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md glass-effect border-white/20">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
              <span className="text-lg font-bold text-primary-foreground">TH</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription className="text-blue-100">
            {mode === 'login' 
              ? 'Sign in to access your health dashboard'
              : 'Join our telehealth platform today'
            }
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-white">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && <p className="text-xs text-red-300">{errors.firstName}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-white">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                        placeholder="Doe"
                      />
                    </div>
                    {errors.lastName && <p className="text-xs text-red-300">{errors.lastName}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-white">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  {errors.phone && <p className="text-xs text-red-300">{errors.phone}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth" className="text-white">Date of Birth</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                        className="pl-10 bg-white/10 border-white/20 text-white"
                      />
                    </div>
                    {errors.dateOfBirth && <p className="text-xs text-red-300">{errors.dateOfBirth}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-white">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.gender && <p className="text-xs text-red-300">{errors.gender}</p>}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="john@example.com"
                />
              </div>
              {errors.email && <p className="text-xs text-red-300">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  placeholder="Enter your password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-white/60" />
                  ) : (
                    <Eye className="h-4 w-4 text-white/60" />
                  )}
                </Button>
              </div>
              {errors.password && <p className="text-xs text-red-300">{errors.password}</p>}
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    placeholder="Confirm your password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4 text-white/60" />
                    ) : (
                      <Eye className="h-4 w-4 text-white/60" />
                    )}
                  </Button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-red-300">{errors.confirmPassword}</p>}
              </div>
            )}

            {mode === 'signup' && (
              <div className="flex items-start gap-3 p-4 bg-white/5 rounded-lg border border-white/10">
                <Shield className="h-5 w-5 text-white/80 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-white/90 font-medium">Privacy & Security</p>
                  <p className="text-xs text-white/70 mt-1">
                    Your personal health information is encrypted and protected according to HIPAA standards.
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => onModeChange(mode === 'login' ? 'signup' : 'login')}
                className="text-blue-200 hover:text-white"
              >
                {mode === 'login' 
                  ? "Don't have an account? Sign up"
                  : "Already have an account? Sign in"
                }
              </Button>
            </div>

            {mode === 'login' && (
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  className="text-blue-200 hover:text-white text-sm"
                >
                  Forgot your password?
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  )
}