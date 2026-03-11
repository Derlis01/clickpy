'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import CardAdminContainer from '@/components/admin/CardAdminContainer'
import useCommerceStore from '@/store/commerceStore'
import { Button, Tooltip, Spinner, Link } from '@heroui/react'
import { Download, Link as LinkIcon, AlertTriangle, Camera, Globe, FileText, ArrowRight } from 'react-feather'
import QRCodeStyling from 'qr-code-styling'
import tinycolor from 'tinycolor2'

// CONFIGURACIÓN DE DISEÑO QR - MODIFICA ESTOS VALORES PARA AJUSTAR EL DISEÑO
const QR_CONFIG = {
  // Tamaños
  CANVAS_WIDTH: 1080,
  CANVAS_HEIGHT: 1920,
  QR_SIZE: 700,
  LOGO_HEIGHT: 220,
  LOGO_CONTAINER_PADDING: 30,

  // Espaciados (posiciones Y)
  TOP_MARGIN: 220, // Espacio antes del título principal
  TITLE_TO_QR: 100, // Espacio entre título y QR
  QR_TO_LOGO: 150, // Espacio entre QR y logo
  LOGO_TO_NAME: 100, // Espacio entre logo y nombre del comercio
  NAME_TO_SUBTITLE: 80, // Espacio entre nombre del comercio y subtítulo
  SUBTITLE_TO_URL: 100, // Espacio entre subtítulo y URL

  // Bordes redondeados
  LOGO_CONTAINER_RADIUS: 40,
  LOGO_RADIUS: 20,
  URL_CONTAINER_RADIUS: 30,

  // Tipografía
  TITLE_FONT: '700 72px Inter, Helvetica, Arial, sans-serif',
  SUBTITLE_FONT: '500 40px Inter, Helvetica, Arial, sans-serif',
  NAME_FONT: '600 54px Inter, Helvetica, Arial, sans-serif',
  URL_FONT: '400 32px Inter, Helvetica, Arial, sans-serif',

  // Textos
  TITLE_TEXT: '¡ESCANÉAME!',
  SUBTITLE_TEXT: 'Descubre nuestros productos'
}

const QRCodeCard = () => {
  const { commerceSlug, commerceName, commercePrimaryColor, commerceLogo } = useCommerceStore(state => ({
    commerceSlug: state.commerceSlug,
    commerceLogo: state.commerceLogo,
    commerceName: state.commerceName,
    commercePrimaryColor: state.commercePrimaryColor
  }))

  // Add validation for required fields
  const missingRequirements = useMemo(() => {
    const missing = []
    if (!commerceSlug) missing.push({ field: 'URL del negocio', message: 'Configura la URL de tu negocio' })
    if (!commerceName) missing.push({ field: 'Nombre del negocio', message: 'Agrega el nombre de tu negocio' })
    if (!commerceLogo) missing.push({ field: 'Logo', message: 'Sube un logo para tu negocio' })
    return missing
  }, [commerceSlug, commerceName, commerceLogo])

  const hasRequiredFields = missingRequirements.length === 0

  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const qrCode = useRef<any>(null)
  const [qrRendered, setQrRendered] = useState(false)
  const [canDownload, setCanDownload] = useState(true)
  const [isGenerating, setIsGenerating] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [renderComplete, setRenderComplete] = useState(false)

  // Ref para evitar regeneraciones repetidas
  const hasGenerated = useRef(false)

  // Memoize derived values to avoid recalculations
  // Añadimos commerceSlug explícitamente como dependencia para garantizar
  // que se actualiza si cambia el comercio (incluso si window no cambia)
  const businessUrl = useMemo(() => {
    return typeof window !== 'undefined' && commerceSlug ? `${window.location.origin}/${commerceSlug}` : ''
  }, [commerceSlug])

  // Memoize color calculations
  // Esta memorización se actualizará si cambia el color primario del comercio
  const { primaryColor, QR_COLOR, TEXT_COLOR, isLightColor } = useMemo(() => {
    const primary = commercePrimaryColor || '#1A202C'
    const isLight = tinycolor(primary).isLight()
    return {
      primaryColor: primary,
      isLightColor: isLight,
      QR_COLOR: isLight ? '#1A202C' : '#FFFFFF',
      TEXT_COLOR: isLight ? '#1A202C' : '#FFFFFF'
    }
  }, [commercePrimaryColor])

  // Initialize QR Code only once when dependencies change
  useEffect(() => {
    if (typeof window === 'undefined' || !businessUrl || !hasRequiredFields) return

    // Siempre empezamos con generación activa
    setIsGenerating(true)
    setRenderComplete(false)

    // Clean up previous QR code if any
    if (qrCode.current) {
      setQrRendered(false)
      setRenderComplete(false) // Reset render complete flag
    }

    // Create QR immediately instead of using requestAnimationFrame
    try {
      qrCode.current = new QRCodeStyling({
        width: 700,
        height: 700,
        type: 'svg',
        data: businessUrl,
        margin: 10,
        qrOptions: {
          errorCorrectionLevel: 'H',
          typeNumber: 0
        },
        dotsOptions: {
          type: 'extra-rounded',
          color: QR_COLOR
        },
        cornersSquareOptions: {
          type: 'extra-rounded',
          color: QR_COLOR
        },
        cornersDotOptions: {
          type: 'dot',
          color: QR_COLOR
        },
        backgroundOptions: {
          color: primaryColor
        }
      })

      // Append to container and set as rendered
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
        qrCode.current.append(containerRef.current)
        setQrRendered(true)
      }
    } catch (error) {
      console.error('Error initializing QR code:', error)
    }

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [businessUrl, primaryColor, QR_COLOR, hasRequiredFields])

  // Generate the custom QR with better performance
  useEffect(() => {
    // Verificación de condiciones para generar el QR
    if (!qrRendered || !containerRef.current || !canvasRef.current || !hasRequiredFields) return

    // Evitamos regenerar si ya se generó correctamente
    if (hasGenerated.current && renderComplete) {
      setIsGenerating(false) // Aseguramos que se oculta el spinner si ya está listo
      return
    }

    const generateCustomQR = async () => {
      // No verificamos isGenerating aquí para permitir el inicio del proceso
      setIsGenerating(true)
      setRenderComplete(false)

      try {
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) {
          console.error('Could not get canvas context')
          setIsGenerating(false)
          return
        }

        // Setup canvas size immediately
        canvas.width = QR_CONFIG.CANVAS_WIDTH
        canvas.height = QR_CONFIG.CANVAS_HEIGHT

        // Draw background
        ctx.fillStyle = primaryColor
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Helper function for drawing centered text
        const drawCenteredText = (text: string, y: number, font: string, color: string = TEXT_COLOR): void => {
          ctx.fillStyle = color
          ctx.font = font
          ctx.textAlign = 'center'
          ctx.fillText(text, canvas.width / 2, y)
        }

        // Start positioning elements
        let currentY = QR_CONFIG.TOP_MARGIN

        // 1. Main title
        drawCenteredText(QR_CONFIG.TITLE_TEXT, currentY, QR_CONFIG.TITLE_FONT)
        currentY += QR_CONFIG.TITLE_TO_QR

        try {
          // 2. QR Code - Get QR as image with better quality
          const qrImage = await new Promise<HTMLImageElement>((resolve, reject) => {
            try {
              const img = new Image()
              const svgElement = containerRef.current?.querySelector('svg')
              if (!svgElement) {
                reject(new Error('SVG element not found'))
                return
              }

              // Simplify SVG processing
              const svgData = new XMLSerializer().serializeToString(svgElement)
              const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
              const svgUrl = URL.createObjectURL(svgBlob)

              img.onload = () => {
                URL.revokeObjectURL(svgUrl)
                resolve(img)
              }
              img.onerror = e => {
                URL.revokeObjectURL(svgUrl)
                reject(new Error(`Failed to load QR image: ${e}`))
              }
              img.src = svgUrl
            } catch (e) {
              reject(e)
            }
          })

          // Center and draw QR
          const qrX = (canvas.width - QR_CONFIG.QR_SIZE) / 2
          const qrY = currentY
          ctx.drawImage(qrImage, qrX, qrY, QR_CONFIG.QR_SIZE, QR_CONFIG.QR_SIZE)

          // Update position
          currentY = qrY + QR_CONFIG.QR_SIZE + QR_CONFIG.QR_TO_LOGO

          // 3. Logo with container
          if (commerceLogo) {
            try {
              // Pre-load logo image with timeout
              const logoImg = await new Promise<HTMLImageElement>((resolve, reject) => {
                const img = new Image()
                img.crossOrigin = 'anonymous'

                // Set timeout to prevent hanging on image load
                const timeoutId = setTimeout(() => {
                  console.warn('Logo image load timeout')
                  reject(new Error('Logo image load timeout'))
                }, 5000)

                img.onload = () => {
                  clearTimeout(timeoutId)
                  setCanDownload(true)
                  resolve(img)
                }

                img.onerror = e => {
                  clearTimeout(timeoutId)
                  console.error(`Error loading logo: ${e}`)
                  setCanDownload(false)
                  reject(new Error('Failed to load logo image'))
                }

                // Add cache busting
                const cacheBuster = `t=${Date.now()}`
                img.src = commerceLogo.includes('?')
                  ? `${commerceLogo}&${cacheBuster}`
                  : `${commerceLogo}?${cacheBuster}`
              }).catch(error => {
                console.error('Error loading logo:', error)
                throw error
              })

              // Calculate dimensions while maintaining aspect ratio
              const aspectRatio = logoImg.width / logoImg.height
              const logoHeight = QR_CONFIG.LOGO_HEIGHT
              const logoWidth = logoHeight * aspectRatio

              // Logo container
              const containerPadding = QR_CONFIG.LOGO_CONTAINER_PADDING
              const logoContainerWidth = logoWidth + containerPadding * 2
              const logoContainerHeight = logoHeight + containerPadding * 2

              // Center position
              const logoX = canvas.width / 2 - logoContainerWidth / 2
              const logoY = currentY

              // Gradient for background
              const isVeryLightColor = tinycolor(primaryColor).getBrightness() > 200
              const gradientColor1 = isLightColor
                ? tinycolor(QR_COLOR).setAlpha(0.03).toRgbString()
                : tinycolor('#FFFFFF').setAlpha(0.05).toRgbString()
              const gradientColor2 = isLightColor
                ? tinycolor(QR_COLOR).setAlpha(0.08).toRgbString()
                : tinycolor('#FFFFFF').setAlpha(0.15).toRgbString()

              const gradient = ctx.createLinearGradient(
                logoX,
                logoY,
                logoX + logoContainerWidth,
                logoY + logoContainerHeight
              )
              gradient.addColorStop(0, gradientColor1)
              gradient.addColorStop(1, gradientColor2)

              // Draw container
              ctx.fillStyle = gradient
              ctx.beginPath()
              ctx.roundRect(logoX, logoY, logoContainerWidth, logoContainerHeight, QR_CONFIG.LOGO_CONTAINER_RADIUS)
              ctx.fill()

              // Border and shadow
              ctx.shadowColor = isVeryLightColor ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.3)'
              ctx.shadowBlur = 20
              ctx.shadowOffsetY = 8
              ctx.strokeStyle = isLightColor
                ? tinycolor(QR_COLOR).setAlpha(0.15).toRgbString()
                : tinycolor('#FFFFFF').setAlpha(0.25).toRgbString()
              ctx.lineWidth = 2
              ctx.stroke()

              // Reset shadow
              ctx.shadowColor = 'transparent'
              ctx.shadowBlur = 0
              ctx.shadowOffsetY = 0

              // Draw logo with rounded corners
              const logoDrawX = logoX + containerPadding
              const logoDrawY = logoY + containerPadding

              ctx.save()
              ctx.beginPath()
              ctx.roundRect(logoDrawX, logoDrawY, logoWidth, logoHeight, QR_CONFIG.LOGO_RADIUS)
              ctx.clip()
              ctx.drawImage(logoImg, logoDrawX, logoDrawY, logoWidth, logoHeight)
              ctx.restore()

              // Update position
              currentY += logoContainerHeight + QR_CONFIG.LOGO_TO_NAME
            } catch (error) {
              console.error('Error processing logo:', error)
              currentY += 40
              setCanDownload(false)
            }
          } else {
            currentY += 40
          }

          // 4. Business name
          if (commerceName) {
            drawCenteredText(commerceName, currentY, QR_CONFIG.NAME_FONT)
            currentY += QR_CONFIG.NAME_TO_SUBTITLE
          } else {
            currentY += 50
          }

          // 5. Subtitle
          drawCenteredText(QR_CONFIG.SUBTITLE_TEXT, currentY, QR_CONFIG.SUBTITLE_FONT)
          currentY += QR_CONFIG.SUBTITLE_TO_URL

          // 6. URL with background and text
          const urlText = businessUrl
          ctx.font = QR_CONFIG.URL_FONT
          const urlMetrics = ctx.measureText(urlText)
          const urlWidth = urlMetrics.width + 80
          const urlHeight = 60
          const urlX = canvas.width / 2 - urlWidth / 2
          const urlY = currentY - 40

          // URL background
          ctx.fillStyle = isLightColor
            ? tinycolor(QR_COLOR).setAlpha(0.08).toRgbString()
            : tinycolor('#FFFFFF').setAlpha(0.12).toRgbString()
          ctx.beginPath()
          ctx.roundRect(urlX, urlY, urlWidth, urlHeight, QR_CONFIG.URL_CONTAINER_RADIUS)
          ctx.fill()

          // URL text
          drawCenteredText(urlText, currentY, QR_CONFIG.URL_FONT)

          // Marcar como generado para evitar regeneraciones innecesarias
          hasGenerated.current = true
          setRenderComplete(true)
          setIsGenerating(false) // Aseguramos que se establece en false
        } catch (error) {
          console.error('Error in QR generation process:', error)
          hasGenerated.current = false
          setIsGenerating(false) // También desactivamos en caso de error
        } finally {
          setIsGenerating(false) // Garantizamos que siempre se desactive
        }
      } catch (error) {
        console.error('Error in QR generation setup:', error)
        hasGenerated.current = false
        setIsGenerating(false)
      }
    }

    // Iniciamos la generación sin depender del estado isGenerating
    generateCustomQR()
  }, [qrRendered, primaryColor, commerceName, commerceLogo, businessUrl, hasRequiredFields]) // Agregamos las dependencias necesarias

  // Optimized download with error handling
  const downloadQRCode = useCallback(async () => {
    if (isDownloading) return
    setIsDownloading(true)

    try {
      if (!canDownload) {
        if (qrCode.current) {
          await qrCode.current.download({
            extension: 'png',
            name: `qr-${commerceSlug || 'mi-negocio'}`
          })
        }
        alert(
          'Debido a restricciones de seguridad, solo se descargará el código QR básico sin el diseño personalizado.'
        )
        return
      }

      if (canvasRef.current) {
        try {
          // Use a temporary canvas to produce higher quality image if needed
          const tempCanvas = document.createElement('canvas')
          tempCanvas.width = QR_CONFIG.CANVAS_WIDTH
          tempCanvas.height = QR_CONFIG.CANVAS_HEIGHT

          const tempCtx = tempCanvas.getContext('2d')
          if (tempCtx) {
            // Draw the original canvas content to the temp canvas
            tempCtx.drawImage(canvasRef.current, 0, 0)

            const link = document.createElement('a')
            link.download = `qr-${commerceSlug || 'mi-negocio'}.png`

            // Use higher quality for PNG export
            const dataUrl = tempCanvas.toDataURL('image/png', 1.0)
            link.href = dataUrl
            link.click()
          } else {
            throw new Error('Could not create temporary context')
          }
        } catch (error) {
          console.error('Error downloading custom QR:', error)
          if (qrCode.current) {
            await qrCode.current.download({
              extension: 'png',
              name: `qr-${commerceSlug || 'mi-negocio'}`
            })
          }
          alert(
            'Debido a restricciones de seguridad, solo se descargará el código QR básico sin el diseño personalizado.'
          )
        }
      } else if (qrCode.current) {
        await qrCode.current.download({
          extension: 'png',
          name: `qr-${commerceSlug || 'mi-negocio'}`
        })
      }
    } catch (error) {
      console.error('Download error:', error)
    } finally {
      setIsDownloading(false)
    }
  }, [canDownload, commerceSlug, isDownloading])

  return (
    <CardAdminContainer
      title='QR de Negocio (Catálogo)'
      description='Para impresión o publicación en redes sociales.'
      optionalChildren={
        <Tooltip content='Descargar QR'>
          <Button
            isIconOnly
            variant='bordered'
            onPress={downloadQRCode}
            isLoading={isDownloading}
            isDisabled={isGenerating || !renderComplete || !hasRequiredFields}
          >
            {!isDownloading && <Download size={18} />}
          </Button>
        </Tooltip>
      }
    >
      <div className='flex flex-col items-center gap-6'>
        {hasRequiredFields ? (
          <div className='rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden'>
            {/* QR Normal (oculto, se usa para generar el personalizado) */}
            <div ref={containerRef} className='hidden' />

            {/* Contenedor con altura fija para evitar saltos de diseño */}
            <div className='relative' style={{ minHeight: '300px' }}>
              {/* QR Personalizado con estado de carga */}
              {isGenerating && (
                <div className='absolute inset-0 flex flex-col justify-center items-center p-8 bg-white z-10'>
                  <Spinner size='lg' color='primary' />
                  <p className='mt-4 text-sm text-gray-500'>Generando código QR...</p>
                </div>
              )}

              {/* Canvas que se muestra pero inicialmente oculto por el spinner */}
              <canvas
                ref={canvasRef}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  opacity: renderComplete ? 1 : 0,
                  transition: 'opacity 0.3s ease-in-out'
                }}
              />
            </div>
          </div>
        ) : (
          <div className='w-full max-w-md mx-auto'>
            <div className='bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-8'>
              <div className='flex flex-col items-center text-center'>
                <div className='bg-amber-100 rounded-full p-4 mb-6'>
                  <AlertTriangle size={32} className='text-amber-600' />
                </div>

                <h3 className='text-xl font-semibold text-gray-800 mb-3'>Completa la información</h3>

                <p className='text-gray-600 mb-8 leading-relaxed'>
                  Para crear tu código QR personalizado necesitamos algunos datos importantes de tu negocio:
                </p>

                <div className='space-y-4 w-full mb-8'>
                  {missingRequirements.map((item, index) => (
                    <div
                      key={index}
                      className='flex items-center gap-3 p-3 bg-white/60 border border-amber-100 rounded-xl hover:bg-white/80 transition-colors duration-200'
                    >
                      {item.field.includes('Logo') && <Camera className='flex-shrink-0 w-5 h-5 text-amber-600' />}
                      {item.field.includes('URL') && <Globe className='flex-shrink-0 w-5 h-5 text-amber-600' />}
                      {item.field.includes('Nombre') && <FileText className='flex-shrink-0 w-5 h-5 text-amber-600' />}
                      <div className='flex-1 text-left'>
                        <p className='font-medium text-gray-800'>{item.field}</p>
                        <p className='text-sm text-gray-600'>{item.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <Link
                  href='/admin/local'
                  className='group inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-transparent border-medium bg-amber-50 border-black text-black'
                >
                  <span>Completar información</span>
                  <ArrowRight size={18} className='transition-transform duration-200 group-hover:translate-x-1' />
                </Link>
              </div>
            </div>
          </div>
        )}

        {!canDownload && renderComplete && hasRequiredFields && (
          <div className='w-full max-w-2xl mx-auto'>
            <div className='flex items-start gap-4 p-5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl'>
              <div className='bg-amber-100 rounded-full p-2'>
                <AlertTriangle className='w-5 h-5 text-amber-600' />
              </div>
              <div>
                <p className='font-medium text-gray-800 mb-1'>Descarga con limitaciones</p>
                <p className='text-gray-600 text-sm leading-relaxed'>
                  Por motivos de seguridad, solo se descargará la versión básica del código QR. La versión personalizada
                  estará disponible próximamente.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </CardAdminContainer>
  )
}

export default QRCodeCard
