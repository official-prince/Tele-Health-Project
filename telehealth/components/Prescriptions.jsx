'use client'
import { useState } from 'react'
import { Pill, Calendar, User, RefreshCw, AlertTriangle, Check, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { prescriptions } from '@/lib/data'

export default function Prescriptions() {
  const [selectedPrescription, setSelectedPrescription] = useState(null)
  const [showRefillDialog, setShowRefillDialog] = useState(false)

  const activePrescriptions = prescriptions.filter(p => p.status === 'active')
  const completedPrescriptions = prescriptions.filter(p => p.status === 'completed')

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'expired': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const handleRefillRequest = () => {
    console.log('Refill requested for:', selectedPrescription)
    setShowRefillDialog(false)
  }

  const PrescriptionCard = ({ prescription, showRefillButton = true }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5" />
              {prescription.medication}
            </CardTitle>
            <CardDescription className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Issued: {prescription.dateIssued}
              </span>
              <span className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {prescription.prescribedBy}
              </span>
            </CardDescription>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(prescription.status)}`} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium">Dosage</p>
            <p className="text-lg font-bold text-primary">{prescription.dosage}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Frequency</p>
            <p className="text-sm">{prescription.frequency}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">Refills Remaining</p>
            <div className="flex items-center gap-2">
              <Badge 
                variant={prescription.refillsRemaining > 0 ? "default" : "destructive"}
                className="text-xs"
              >
                {prescription.refillsRemaining}
              </Badge>
              {prescription.refillsRemaining <= 1 && prescription.status === 'active' && (
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          </div>
        </div>

        {showRefillButton && prescription.status === 'active' && (
          <div className="flex gap-2">
            <Button 
              onClick={() => {
                setSelectedPrescription(prescription)
                setShowRefillDialog(true)
              }}
              disabled={prescription.refillsRemaining === 0}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Request Refill
            </Button>
            <Button variant="outline" size="sm">
              View Instructions
            </Button>
          </div>
        )}

        {prescription.status === 'completed' && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Check className="h-4 w-4 text-green-500" />
            Treatment completed
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Prescriptions</h1>
        <p className="text-muted-foreground">Manage your medications and refill requests</p>
      </div>

      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Active ({activePrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            Completed ({completedPrescriptions.length})
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            All Prescriptions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activePrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Pill className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Prescriptions</h3>
                <p className="text-muted-foreground">
                  You currently have no active prescriptions. Your new prescriptions will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Refill Alerts */}
              {activePrescriptions.filter(p => p.refillsRemaining <= 1).length > 0 && (
                <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                      <AlertTriangle className="h-5 w-5" />
                      Refill Alerts
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      {activePrescriptions.filter(p => p.refillsRemaining <= 1).length} prescription(s) 
                      need refills soon. Request refills before they run out.
                    </p>
                  </CardContent>
                </Card>
              )}

              {activePrescriptions.map((prescription) => (
                <PrescriptionCard key={prescription.id} prescription={prescription} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedPrescriptions.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Check className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Completed Prescriptions</h3>
                <p className="text-muted-foreground">
                  Your completed treatments will be shown here.
                </p>
              </CardContent>
            </Card>
          ) : (
            completedPrescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} prescription={prescription} showRefillButton={false} />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionCard key={prescription.id} prescription={prescription} />
          ))}
        </TabsContent>
      </Tabs>

      {/* Refill Request Dialog */}
      <Dialog open={showRefillDialog} onOpenChange={setShowRefillDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Refill</DialogTitle>
            <DialogDescription>
              Confirm your refill request for this prescription
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrescription && (
            <div className="space-y-4">
              <div className="bg-muted/30 p-4 rounded-md space-y-2">
                <h4 className="font-medium">{selectedPrescription.medication}</h4>
                <p className="text-sm text-muted-foreground">
                  Dosage: {selectedPrescription.dosage} • {selectedPrescription.frequency}
                </p>
                <p className="text-sm text-muted-foreground">
                  Prescribed by: {selectedPrescription.prescribedBy}
                </p>
                <p className="text-sm">
                  Refills remaining: <Badge variant="outline">{selectedPrescription.refillsRemaining}</Badge>
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This refill request will be sent to your pharmacy and prescribing doctor. 
                  You'll receive a notification once it's processed.
                </p>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleRefillRequest}
                  className="flex-1"
                >
                  Confirm Request
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowRefillDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}