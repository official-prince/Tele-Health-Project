export const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    experience: "15 years",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&q=80",
    availability: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM"],
    bio: "Specialized in cardiovascular diseases and preventive cardiology.",
    education: "MD - Harvard Medical School"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatology",
    experience: "12 years",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&q=80",
    availability: ["10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
    bio: "Expert in skin conditions, cosmetic dermatology, and skin cancer prevention.",
    education: "MD - Stanford University"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    experience: "10 years",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1594824388647-82b8e2c9dd20?w=400&h=400&fit=crop&q=80",
    availability: ["9:00 AM", "12:00 PM", "2:30 PM", "4:30 PM"],
    bio: "Dedicated pediatrician with expertise in child development and immunizations.",
    education: "MD - Johns Hopkins University"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Orthopedics",
    experience: "18 years",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&q=80",
    availability: ["8:00 AM", "11:30 AM", "2:00 PM", "4:00 PM"],
    bio: "Specialized in joint replacement surgery and sports medicine.",
    education: "MD - Mayo Clinic"
  }
]

export const appointments = [
  {
    id: 1,
    doctorName: "Dr. Sarah Johnson",
    specialty: "Cardiology",
    date: "2024-01-15",
    time: "10:00 AM",
    status: "confirmed",
    type: "video"
  },
  {
    id: 2,
    doctorName: "Dr. Michael Chen",
    specialty: "Dermatology", 
    date: "2024-01-18",
    time: "2:00 PM",
    status: "pending",
    type: "video"
  },
  {
    id: 3,
    doctorName: "Dr. Emily Rodriguez",
    specialty: "Pediatrics",
    date: "2024-01-20",
    time: "11:00 AM",
    status: "completed",
    type: "video"
  }
]

export const medicalRecords = [
  {
    id: 1,
    date: "2024-01-10",
    doctor: "Dr. Sarah Johnson",
    diagnosis: "Hypertension",
    prescription: "Lisinopril 10mg daily",
    notes: "Blood pressure monitoring recommended. Follow-up in 3 months.",
    vitals: {
      bloodPressure: "140/90",
      heartRate: "78 bpm",
      temperature: "98.6°F",
      weight: "165 lbs"
    }
  },
  {
    id: 2,
    date: "2024-01-05",
    doctor: "Dr. Michael Chen",
    diagnosis: "Eczema",
    prescription: "Hydrocortisone cream 2%",
    notes: "Apply twice daily to affected areas. Avoid harsh soaps.",
    vitals: {
      bloodPressure: "120/80",
      heartRate: "72 bpm",
      temperature: "98.4°F",
      weight: "165 lbs"
    }
  }
]

export const prescriptions = [
  {
    id: 1,
    medication: "Lisinopril",
    dosage: "10mg",
    frequency: "Once daily",
    prescribedBy: "Dr. Sarah Johnson",
    dateIssued: "2024-01-10",
    refillsRemaining: 3,
    status: "active"
  },
  {
    id: 2,
    medication: "Hydrocortisone Cream",
    dosage: "2%",
    frequency: "Twice daily",
    prescribedBy: "Dr. Michael Chen",
    dateIssued: "2024-01-05",
    refillsRemaining: 2,
    status: "active"
  },
  {
    id: 3,
    medication: "Amoxicillin",
    dosage: "500mg",
    frequency: "Three times daily",
    prescribedBy: "Dr. Emily Rodriguez",
    dateIssued: "2023-12-20",
    refillsRemaining: 0,
    status: "completed"
  }
]

export const notifications = [
  {
    id: 1,
    type: "appointment",
    title: "Upcoming Appointment",
    message: "You have an appointment with Dr. Sarah Johnson tomorrow at 10:00 AM",
    time: "2 hours ago",
    unread: true
  },
  {
    id: 2,
    type: "prescription",
    title: "Prescription Refill",
    message: "Your Lisinopril prescription has 3 refills remaining",
    time: "1 day ago",
    unread: true
  },
  {
    id: 3,
    type: "results",
    title: "Test Results Available",
    message: "Your recent blood work results are now available",
    time: "3 days ago",
    unread: false
  }
]