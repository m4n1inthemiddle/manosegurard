
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">ManoSeguraRD</h3>
            <p className="text-gray-400">Técnicos confiables para tu hogar en República Dominicana</p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Enlaces</h4>
            <ul className="space-y-2">
              <li><Link href="/servicios" className="text-gray-400 hover:text-white">Servicios</Link></li>
              <li><Link href="/tecnicos" className="text-gray-400 hover:text-white">Técnicos</Link></li>
              <li><Link href="/unete" className="text-gray-400 hover:text-white">Únete</Link></li>
              <li><Link href="/privacidad" className="text-gray-400 hover:text-white">Privacidad</Link></li>
              <li><Link href="/terminos" className="text-gray-400 hover:text-white">Términos</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <ul className="space-y-2">
              <li><a href="https://instagram.com" className="text-gray-400 hover:text-white">Instagram</a></li>
              <li><a href="https://wa.me/18493587828" className="text-gray-400 hover:text-white">WhatsApp</a></li>
              <li><a href="mailto:info@manosegurard.com" className="text-gray-400 hover:text-white">info@manosegurard.com</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Horario</h4>
            <p className="text-gray-400">Lunes a Domingo<br />8:00 AM - 8:00 PM</p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 ManoSeguraRD. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )

}