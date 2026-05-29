export interface Technician {
  id: number
  name: string
  phone: string
  category: string
  city: string
  rating: number
  experience: number
  photo: string
  photo_url?: string
  province?: string
  sector?: string
  bio: string
  verified: boolean
  approved: boolean
}

export interface ServiceRequest {
  id: number
  customer_name: string
  phone: string
  city: string
  service_type: string
  description: string
  photo_url?: string
  status: 'pendiente' | 'asignado' | 'completado'
  assigned_technician?: number
}

export interface Review {
  id: number
  technician_id: number
  customer_name: string
  rating: number
  comment: string
}

export interface PendingTechnician {
  id: number
  name: string
  specialty: string
  phone: string
  province?: string
  sector?: string
  experience: number
  photo_url?: string
  certificates_url?: string
  certifications?: string
}