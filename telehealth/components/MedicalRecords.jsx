'use client'
import { useState } from 'react'
import { FileText, Download, Eye, Calendar, User, Stethoscope, Pill, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { medicalRecords } from '@/lib/data'

export default function MedicalRecords() {
  const [selectedRecord, setSelectedRecord] = useState(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleViewRecord = (record) => {
    setSelectedRecord(record)
    setShowDetails(true)
  }

  const VitalsCard = ({ vitals }) => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm">Blood Pressure</span>
          <span className="font-medium">{vitals.bloodPressure}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm">Heart Rate</span>
          <span className="font-medium">{vitals.heartRate}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm">Temperature</span>
          <span className="font-medium">{vitals.temperature}</span>
        </div>
        <div className="flex items-center justify-between p-2 rounded bg-muted/30">
          <span className="text-sm">Weight</span>
          <span className="font-medium">{vitals.weight}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Medical Records</h1>
          <p className="text-muted-foreground">Access your complete health history and documentation</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Records
        </Button>
      </div>

      <Tabs defaultValue="records" className="space-y-6">
        <TabsList>
          <TabsTrigger value="records">Visit Records</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="lab">Lab Results</TabsTrigger>
          <TabsTrigger value="imaging">Imaging</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {medicalRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {record.diagnosis}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {record.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {record.doctor}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant="outline">Consultation</Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Pill className="h-4 w-4" />
                      Prescription
                    </h4>
                    <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                      {record.prescription}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Vitals Summary
                    </h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>BP:</span>
                        <span>{record.vitals.bloodPressure}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>HR:</span>
                        <span>{record.vitals.heartRate}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Clinical Notes</h4>
                  <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                    {record.notes}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={() => handleViewRecord(record)}
                    variant="outline"
                    size="sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Vital Signs Trend</CardTitle>
              <CardDescription>Track your health metrics over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {medicalRecords.map((record) => (
                  <div key={record.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{record.date}</h4>
                      <Badge variant="outline">{record.doctor}</Badge>
                    </div>
                    <VitalsCard vitals={record.vitals} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <Stethoscope className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Lab Results</h3>
              <p className="text-muted-foreground">
                Your lab results will appear here once available.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imaging" className="space-y-4">
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Imaging Records</h3>
              <p className="text-muted-foreground">
                Your medical imaging results will be displayed here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Record Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Medical Record Details</DialogTitle>
            <DialogDescription>
              Complete information for this medical consultation
            </DialogDescription>
          </DialogHeader>
          
          {selectedRecord && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date</Label>
                  <p className="text-sm">{selectedRecord.date}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Healthcare Provider</Label>
                  <p className="text-sm">{selectedRecord.doctor}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Diagnosis</Label>
                  <p className="text-sm">{selectedRecord.diagnosis}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Prescription</Label>
                  <p className="text-sm">{selectedRecord.prescription}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Vital Signs</Label>
                <VitalsCard vitals={selectedRecord.vitals} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Clinical Notes</Label>
                <p className="text-sm bg-muted/30 p-4 rounded-md">{selectedRecord.notes}</p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
                <Button onClick={() => setShowDetails(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}