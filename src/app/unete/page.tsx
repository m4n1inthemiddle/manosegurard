'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

// Lista de provincias de República Dominicana
const dominicanProvinces = [
  'Distrito Nacional', 'Santo Domingo', 'Santiago', 'La Altagracia', 'La Romana',
  'San Cristóbal', 'Puerto Plata', 'San Pedro de Macorís', 'Duarte', 'Espaillat',
  'La Vega', 'Valverde', 'Barahona', 'Azua', 'Peravia', 'Monseñor Nouel',
  'Sánchez Ramírez', 'María Trinidad Sánchez', 'Samana', 'El Seibo', 'Hato Mayor',
  'Monte Plata', 'San Juan', 'Elías Piña', 'Dajabón', 'Santiago Rodríguez',
  'Monte Cristi', 'Bahoruco', 'Independencia', 'Pedernales'
]

// Sectores por provincia (ejemplo básico; puedes ampliarlo)
const sectorsByProvince: Record<string, string[]> = {
  'Distrito Nacional': ['Gazcue', 'Naco', 'Piantini', 'Los Cacicazgos', 'Ciudad Colonial', 'Bella Vista', 'El Millón'],
  'Santo Domingo': ['Santo Domingo Este', 'Santo Domingo Norte', 'Santo Domingo Oeste', 'Los Alcarrizos', 'Boca Chica'],
  'Santiago': ['Santiago de los Caballeros', 'Los Jardines', 'Pontezuela', 'La Herradura', 'Gurabo', 'Villa González'],
  'La Altagracia': ['Punta Cana', 'Bávaro', 'Verón', 'Higüey'],
  'La Romana': ['La Romana', 'Callejón', 'Villa Hermosa'],
  'Puerto Plata': ['Puerto Plata', 'Sosúa', 'Cabarete', 'Maimón', 'Costambar'],
  // Agrega más provincias y sectores según necesites
}

export default function UnetePage() {
  const [formData, setFormData] = useState({
    nombre: '',
    especialidad: '',
    telefono: '',
    provincia: '',
    sector: '',
    experiencia: '',
    certificaciones: '',
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [certFile, setCertFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Sectores disponibles según la provincia seleccionada
  const availableSectors = sectorsByProvince[formData.provincia] || []

  // Función para subir un archivo a Supabase Storage y obtener su URL pública
  const uploadFile = async (file: File, bucket: string, folder: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${folder}/${Date.now()}_${Math.random()}.${fileExt}`
    const { data, error } = await supabase.storage.from(bucket).upload(fileName, file)
    if (error) {
      console.error('Error subiendo archivo:', error)
      return null
    }
    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName)
    return urlData.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      // Subir foto si existe
      let photoUrl = ''
      if (photoFile) {
        const url = await uploadFile(photoFile, 'technician-photos', 'photos')
        if (url) photoUrl = url
      }

      // Subir certificado si existe
      let certUrl = ''
      if (certFile) {
        const url = await uploadFile(certFile, 'technician-certificates', 'certificates')
        if (url) certUrl = url
      }

      // Insertar en la tabla pending_technicians
      const { error } = await supabase
        .from('pending_technicians')
        .insert([{
          name: formData.nombre,
          specialty: formData.especialidad,
          phone: formData.telefono,
          province: formData.provincia,
          sector: formData.sector,
          experience: parseInt(formData.experiencia),
          photo_url: photoUrl,
          certificates_url: certUrl,
          certifications: formData.certificaciones,
          status: 'pendiente'
        }])

      if (error) throw error
      setSubmitted(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar solicitud')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="bg-green-100 text-green-700 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">¡Gracias por tu interés!</h2>
          <p>Hemos recibido tu solicitud. Un asesor se contactará contigo pronto para verificar tus credenciales.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Consigue más clientes con ManoSeguraRD</h1>
        <p className="text-gray-600">Únete a nuestra red de técnicos verificados y aumenta tus ingresos</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg"><h3 className="font-bold">✓ Más visibilidad</h3><p className="text-sm">Aparece en las primeras búsquedas de tu zona</p></div>
        <div className="bg-blue-50 p-6 rounded-lg"><h3 className="font-bold">✓ Clientes constantes</h3><p className="text-sm">Recibe solicitudes regularmente</p></div>
        <div className="bg-blue-50 p-6 rounded-lg"><h3 className="font-bold">✓ Reputación online</h3><p className="text-sm">Construye tu credibilidad con reseñas reales</p></div>
        <div className="bg-blue-50 p-6 rounded-lg"><h3 className="font-bold">✓ Soporte 24/7</h3><p className="text-sm">Te ayudamos en todo momento</p></div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Nombre completo *</label>
          <input type="text" required className="w-full p-3 border rounded-lg"
            value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Especialidad *</label>
          <select required className="w-full p-3 border rounded-lg"
            value={formData.especialidad} onChange={(e) => setFormData({...formData, especialidad: e.target.value})}>
            <option value="">Selecciona tu especialidad</option>
            <option>Electricidad</option><option>Plomería</option><option>Aires acondicionados</option>
            <option>Cámaras de seguridad</option><option>Cerrajería</option><option>Pintura</option>
            <option>Limpieza</option><option>Paneles solares</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Teléfono *</label>
          <input type="tel" required className="w-full p-3 border rounded-lg"
            value={formData.telefono} onChange={(e) => setFormData({...formData, telefono: e.target.value})} />
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-2">Provincia *</label>
            <select required className="w-full p-3 border rounded-lg"
              value={formData.provincia} onChange={(e) => setFormData({...formData, provincia: e.target.value, sector: ''})}>
              <option value="">Selecciona provincia</option>
              {dominicanProvinces.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-2">Sector *</label>
            <select required className="w-full p-3 border rounded-lg"
              value={formData.sector} onChange={(e) => setFormData({...formData, sector: e.target.value})}
              disabled={!formData.provincia}>
              <option value="">Selecciona sector</option>
              {availableSectors.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Años de experiencia *</label>
          <input type="number" required className="w-full p-3 border rounded-lg"
            value={formData.experiencia} onChange={(e) => setFormData({...formData, experiencia: e.target.value})} />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Foto de perfil (subir imagen)</label>
          <input type="file" accept="image/*" className="w-full p-2 border rounded-lg"
            onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, GIF. Máx 5MB.</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Certificaciones (PDF o imagen)</label>
          <input type="file" accept=".pdf,image/*" className="w-full p-2 border rounded-lg"
            onChange={(e) => setCertFile(e.target.files?.[0] || null)} />
          <p className="text-xs text-gray-500 mt-1">Puedes subir tu certificado en PDF o imagen.</p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Descripción adicional (opcional)</label>
          <textarea rows={3} className="w-full p-3 border rounded-lg"
            value={formData.certificaciones} onChange={(e) => setFormData({...formData, certificaciones: e.target.value})} />
        </div>

        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{errorMsg}</div>}

        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-50">
          {loading ? 'Enviando...' : 'Enviar solicitud'}
        </button>
      </form>
    </div>
  )
}