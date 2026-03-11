import { useState, useEffect } from 'react'
import { Camera, Edit2 } from 'react-feather'
import useCommerceStore from '@/store/commerceStore'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Spinner } from '@heroui/react'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from 'browser-image-compression'
import { Dimensions, getCroppedImg } from '@/utils/images/image-utils'
import { toast } from 'sonner'

export default function LocalBannerAdmin() {
  const setCommerceBanner = useCommerceStore(state => state.setCommerceBanner)
  const commerceBanner = useCommerceStore(state => state.commerceBanner)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 60,
    x: 5,
    y: 20
  })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [naturalDimensions, setNaturalDimensions] = useState<Dimensions | null>(null)
  const [renderedDimensions, setRenderedDimensions] = useState<Dimensions | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Clean up object URL when component unmounts or when no longer needed
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  useEffect(() => {
    if (commerceBanner && !previewImage) {
      if (isValidUrl(commerceBanner)) {
        setPreviewImage(commerceBanner)
      } else {
        setPreviewImage(`data:image/png;base64,${commerceBanner}`)
      }
    }
  }, [commerceBanner])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoading(true)
      setError(null)

      // Increased to 10MB for smartphone photos
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Imagen demasiado grande. Por favor seleccione una imagen menor a 10MB.')
        setIsLoading(false)
        event.target.value = ''
        return
      }

      const options = {
        maxSizeMB: 0.2,
        useWebWorker: true,
        maxIteration: 10,
        initialQuality: 0.8 // Reduced initial quality for faster processing
      }

      try {
        const compressedFile = await imageCompression(file, options)

        // Use object URL instead of base64 for better memory management
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }

        const newObjectUrl = URL.createObjectURL(compressedFile)
        setObjectUrl(newObjectUrl)
        setPreviewImage(newObjectUrl)
        setIsLoading(false)
        onOpen()
        setIsCropping(true)
      } catch (error) {
        console.log(error)
        setError('Error al procesar la imagen. Intente con una imagen más pequeña.')
        setIsLoading(false)
      }
    }
    event.target.value = ''
  }

  const centerCrop = (mediaWidth: number, mediaHeight: number) => {
    const aspect = 16 / 9

    // Calculate the largest possible crop area with 16:9 aspect ratio
    let cropWidth = mediaWidth
    let cropHeight = cropWidth / aspect

    if (cropHeight > mediaHeight) {
      // If height is constrained
      cropHeight = mediaHeight
      cropWidth = cropHeight * aspect
    }

    // Center the crop
    const x = (mediaWidth - cropWidth) / 2
    const y = (mediaHeight - cropHeight) / 2

    // Set the new crop values as percentages
    setCrop({
      unit: '%',
      width: (cropWidth / mediaWidth) * 100,
      height: (cropHeight / mediaHeight) * 100,
      x: (x / mediaWidth) * 100,
      y: (y / mediaHeight) * 100
    })
  }

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight, width, height } = e.currentTarget

    // Validate image dimensions
    if (naturalWidth > 4000 || naturalHeight > 4000) {
      toast.error('La imagen tiene dimensiones muy grandes. Por favor use una imagen más pequeña.')
      setPreviewImage(null)
      return
    }

    setNaturalDimensions({ width: naturalWidth, height: naturalHeight })
    setRenderedDimensions({ width, height })

    // Center the crop after setting dimensions
    centerCrop(width, height)

    // Set initial completedCrop with pixel values
    const cropWidth = (width * crop.width) / 100
    const cropHeight = (height * crop.height) / 100
    const cropX = (width * crop.x) / 100
    const cropY = (height * crop.y) / 100

    setCompletedCrop({
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: cropX,
      y: cropY
    })
  }

  const handleComplete = (crop: PixelCrop) => {
    setCompletedCrop(crop)
  }

  const handleAction = async (onClose: Function) => {
    if (previewImage && completedCrop) {
      try {
        setIsLoading(true)
        const croppedImageBase64 = await getCroppedImg(
          previewImage,
          completedCrop,
          naturalDimensions,
          renderedDimensions
        )
        setPreviewImage(croppedImageBase64)
        setIsCropping(false)
        const imageUrl = croppedImageBase64 ? croppedImageBase64.replace(/^data:image\/[a-z]+;base64,/, '') : ''
        setCommerceBanner(imageUrl)
        setIsLoading(false)
        onClose()
      } catch (error) {
        console.error('Error cropping image:', error)
        toast.error('Error al recortar la imagen')
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!isOpen && isCropping) {
      setPreviewImage(null)
      setCrop({ unit: 'px', x: 0, y: 0, width: 70, height: 35 })
      setCompletedCrop(null)
      setError(null)
    }
  }, [isOpen])

  const isValidUrl = (string: string) => {
    try {
      new URL(string)
    } catch (_) {
      return false
    }
    return true
  }

  // Detect if device is low-end
  const isLowEndDevice = () => {
    // Check for limited memory or slow processor indicators
    const memory = (navigator as any).deviceMemory
    const cores = navigator.hardwareConcurrency
    return (memory && memory <= 2) || (cores && cores <= 2)
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement='center'>
        <ModalContent className='max-w-3xl'>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Recortar imagen</ModalHeader>
              <ModalBody>
                {isLoading ? (
                  <div className='flex justify-center items-center py-8'>
                    <Spinner size='lg' />
                    <p className='ml-2'>Procesando imagen...</p>
                  </div>
                ) : error ? (
                  <div className='text-danger py-4 text-center'>
                    {error}
                    <Button className='mt-2 mx-auto block' color='primary' size='sm' onPress={onClose}>
                      Cerrar
                    </Button>
                  </div>
                ) : (
                  previewImage && (
                    <ReactCrop
                      crop={crop}
                      minWidth={100}
                      minHeight={100}
                      aspect={16 / 9}
                      onChange={newCrop => setCrop(newCrop)}
                      onComplete={handleComplete}
                      style={{ maxWidth: '100%', maxHeight: '500px' }}
                      ruleOfThirds={true}
                      className='mx-auto'
                    >
                      <img
                        src={previewImage}
                        alt='Preview'
                        onLoad={handleImageLoad}
                        style={{ maxWidth: '100%', maxHeight: '500px' }}
                        crossOrigin='anonymous'
                      />
                    </ReactCrop>
                  )
                )}
              </ModalBody>
              <ModalFooter>
                <Button color='danger' variant='light' onPress={onClose} disabled={isLoading}>
                  Cancelar
                </Button>
                <Button color='primary' onPress={() => handleAction(onClose)} disabled={isLoading || !completedCrop}>
                  {isLoading ? <Spinner size='sm' /> : 'Recortar'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <input
        type='file'
        id='localBanner'
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept='image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, image/avif'
      />

      <div
        className='flex flex-col w-full bg-gray-100 h-[130px] items-center justify-center relative border border-[#C8C8C8]'
        onClick={() => !isLoading && document.getElementById('localBanner')?.click()}
      >
        {isLoading ? (
          <div className='flex flex-col items-center justify-center'>
            <Spinner />
            <p className='text-xs mt-1'>Cargando...</p>
          </div>
        ) : previewImage || commerceBanner ? (
          <img
            src={
              previewImage || (isValidUrl(commerceBanner) ? commerceBanner : `data:image/png;base64,${commerceBanner}`)
            }
            alt='Banner'
            className='object-cover w-full h-full'
          />
        ) : (
          <>
            <Camera color='#656565' />
            <p className='text-xs mt-1'>Portada</p>
            <div className='absolute p-2 bg-gray-200 bottom-[-20px] right-[25px] rounded-full shadow-sm'>
              <Edit2 color='#262626' />
            </div>
          </>
        )}
      </div>
    </>
  )
}
