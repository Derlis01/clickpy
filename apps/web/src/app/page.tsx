import type { Metadata } from 'next'

// Import section components
import NavigationBar from './components/NavigationBar'
import HeroSection from './components/HeroSection'
import BeforeAfterSection from './components/BeforeAfterSection'
import WhatsAppBusinessSection from './components/WhatsAppBusinessSection'
import CommissionSection from './components/CommissionSection'
import MarketingSection from './components/MarketingSection'
import PricingSection from './components/PricingSection'
import FAQSection from './components/FAQSection'
import CTASection from './components/CTASection'
import Footer from './components/Footer'

// Define la URL base de tu sitio. Esto es crucial para que las URLs relativas de las imágenes funcionen correctamente.
const siteUrl = 'https://clickpy.app' // Asegúrate que esta sea la URL correcta de tu sitio

export const metadata: Metadata = {
  // metadataBase ayuda a resolver URLs relativas para Open Graph y otras etiquetas.
  metadataBase: new URL(siteUrl),

  title: 'Clickpy: Tu Tienda Online Fácil', // Ligeramente más corto y directo
  description:
    'Crea tu tienda online gratis con Clickpy y vende directo por WhatsApp. Gestiona pedidos, productos y clientes en un solo lugar.', // Tono más activo
  keywords: [
    'tienda online',
    'whatsapp business',
    'ecommerce',
    'venta online',
    'catálogo digital',
    'paraguay',
    'clickpy',
    'emprender'
  ], // Añadí 'catálogo digital' y 'emprender'

  // 'authors' es más común para artículos. Para un sitio/aplicación, 'creator' y 'publisher' son suficientes.
  // authors: [{ name: 'Clickpy Team' }], // Si quieres mantenerlo, quizás 'Clickpy Team'
  creator: 'Clickpy',
  publisher: 'Clickpy',

  // Open Graph (para Facebook, LinkedIn, etc.)
  openGraph: {
    title: 'Clickpy: Tu Tiendas Online', // Título atractivo para compartir
    description:
      'Lleva tu negocio al siguiente nivel. Crea tu tienda online en minutos con Clickpy y gestiona tus ventas por WhatsApp de forma sencilla.', // Descripción para compartir
    url: siteUrl, // URL canónica de la página
    siteName: 'Clickpy',
    images: [
      {
        url: '/icon1.png', // Next.js resolverá esto a: https://clickpy.app/og-image.png gracias a metadataBase
        width: 1200,
        height: 630,
        alt: 'Crea tu tienda online con Clickpy y vende por WhatsApp'
      }
    ],
    locale: 'es_PY', // Especifica el idioma y la región
    type: 'website'
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image', // 'summary_large_image' es usualmente mejor para el engagement
    title: 'Clickpy: Vende Más Fácil con Tu Tienda Online y WhatsApp', // Título específico para Twitter
    description:
      'Transforma tu manera de vender. Con Clickpy, crea tu tienda online y recibe pedidos por WhatsApp sin complicaciones. ¡Ideal para emprendedores!',
    images: ['/og-image.png'] // Next.js resolverá esto también. Asegúrate que /og-image.png exista en tu carpeta /public
    // creator: '@tuUsuarioDeTwitter', // Opcional: El usuario de Twitter del creador/compañía
  },

  // Favicons y otros iconos
  icons: {
    icon: '/favicon.ico', // Ruta a tu favicon.ico en la carpeta /public
    shortcut: '/favicon-16x16.png', // Ejemplo
    apple: '/apple-touch-icon.png' // Ejemplo
    // otros: [
    //   { rel: 'android-chrome-192x192', url: '/android-chrome-192x192.png' },
    //   { rel: 'android-chrome-512x512', url: '/android-chrome-512x512.png' },
    // ],
  },

  // Robots: Define cómo los motores de búsqueda deben rastrear e indexar
  robots: {
    index: true, // Permitir indexación
    follow: true, // Permitir seguir enlaces
    googleBot: {
      // Instrucciones específicas para GoogleBot
      index: true,
      follow: true,
      'max-video-preview': -1, // Permitir previsualizaciones de video sin límite
      'max-image-preview': 'large', // Permitir previsualizaciones de imagen grandes
      'max-snippet': -1 // Permitir fragmentos de texto sin límite
    }
  }
}

export default function Home() {
  return (
    <div className='min-h-screen bg-white text-gray-800'>
      {/* Header */}
      <NavigationBar />

      {/* Sections */}
      <HeroSection />
      <BeforeAfterSection />
      <WhatsAppBusinessSection />
      <CommissionSection />
      <PricingSection />
      <FAQSection />
      {/* <MarketingSection />
      <CTASection /> */}
      <Footer />
    </div>
  )
}
