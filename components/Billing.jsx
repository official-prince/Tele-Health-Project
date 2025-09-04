'use client'
import { useState } from 'react'
import { CreditCard, Download, Calendar, DollarSign, Receipt, Plus, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const billingHistory = [
  {
    id: 1,
    date: '2024-01-10',
    description: 'Video Consultation - Dr. Sarah Johnson',
    amount: 150.00,
    status: 'paid',
    invoiceNumber: 'INV-001'
  },
  {
    id: 2,
    date: '2024-01-05',
    description: 'Video Consultation - Dr. Michael Chen',
    amount: 120.00,
    status: 'paid',
    invoiceNumber: 'INV-002'
  },
  {
    id: 3,
    date: '2023-12-20',
    description: 'Follow-up Consultation - Dr. Emily Rodriguez',
    amount: 100.00,
    status: 'paid',
    invoiceNumber: 'INV-003'
  }
]

const subscriptionPlans = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 29.99,
    period: 'month',
    features: ['3 consultations per month', 'Basic health tracking', 'Email support'],
    current: false
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    price: 59.99,
    period: 'month',
    features: ['Unlimited consultations', 'Advanced health analytics', '24/7 support', 'Priority booking'],
    current: true
  },
  {
    id: 'family',
    name: 'Family Plan',
    price: 99.99,
    period: 'month',
    features: ['Up to 6 family members', 'Unlimited consultations', 'Family health dashboard', 'Pediatric specialists'],
    current: false
  }
]

export default function Billing() {
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [showChangePlan, setShowChangePlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('premium')

  const totalSpent = billingHistory.reduce((sum, item) => sum + item.amount, 0)

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Payments</h1>
        <p className="text-muted-foreground">Manage your subscription, payments, and billing history</p>
      </div>

      {/* Current Plan */}
      <Card className="gradient-bg text-white">
        <CardHeader>
          <CardTitle>Current Subscription</CardTitle>
          <CardDescription className="text-blue-100">Your active plan and usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">Premium Plan</h3>
              <p className="text-blue-100">$59.99/month • Renews on Jan 15, 2024</p>
            </div>
            <Badge className="bg-white/20 text-white">Active</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">∞</p>
              <p className="text-sm text-blue-100">Consultations</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-blue-100">This Month</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">24/7</p>
              <p className="text-sm text-blue-100">Support</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">✓</p>
              <p className="text-sm text-blue-100">Priority</p>
            </div>
          </div>
          <Button 
            onClick={() => setShowChangePlan(true)}
            className="bg-white text-primary hover:bg-white/90"
          >
            Change Plan
          </Button>
        </CardContent>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList>
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalSpent.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">This year</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Consultations</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{billingHistory.length}</div>
                <p className="text-xs text-muted-foreground">Completed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Cost</CardTitle>
                <Receipt className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${(totalSpent / billingHistory.length).toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Per consultation</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {billingHistory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">{item.description}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {item.date}
                        </span>
                        <span>Invoice: {item.invoiceNumber}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">${item.amount.toFixed(2)}</p>
                      <Badge variant={item.status === 'paid' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Payment Methods</h3>
            <Button onClick={() => setShowAddPayment(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Payment Method
            </Button>
          </div>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">Primary</Badge>
                  <Button variant="outline" size="sm">Edit</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <div className="space-y-4">
            {billingHistory.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium">Invoice {item.invoiceNumber}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <p className="text-sm text-muted-foreground">Date: {item.date}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">${item.amount.toFixed(2)}</p>
                        <Badge variant="default">Paid</Badge>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlan} onOpenChange={setShowChangePlan}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select the plan that best fits your healthcare needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-4">
            {subscriptionPlans.map((plan) => (
              <Card key={plan.id} className={`relative ${plan.current ? 'ring-2 ring-primary' : ''}`}>
                {plan.current && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    Current Plan
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle>{plan.name}</CardTitle>
                  <div className="text-3xl font-bold">
                    ${plan.price}
                    <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full"
                    variant={plan.current ? 'outline' : 'default'}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Payment Method Dialog */}
      <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <DialogDescription>
              Add a new credit or debit card to your account
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry Date</Label>
                <Input id="expiry" placeholder="MM/YY" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvv">CVV</Label>
                <Input id="cvv" placeholder="123" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardName">Cardholder Name</Label>
              <Input id="cardName" placeholder="John Doe" />
            </div>

            <div className="flex gap-2">
              <Button className="flex-1">Add Card</Button>
              <Button variant="outline" onClick={() => setShowAddPayment(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}