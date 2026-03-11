import { useState, useEffect } from 'react'
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure, Spinner } from '@heroui/react'
import { Dimensions, getCroppedImg } from '@/utils/images/image-utils'
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import imageCompression from 'browser-image-compression'
import useCommerceStore from '@/store/commerceStore'
import { Camera } from 'react-feather'
import { toast } from 'sonner'

export default function LocalLogoAdmin() {
  const setCommerceLogo = useCommerceStore(state => state.setCommerceLogo)
  const commerceLogo = useCommerceStore(state => state.commerceLogo)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [crop, setCrop] = useState<Crop>({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null)
  const [naturalDimensions, setNaturalDimensions] = useState<Dimensions | null>(null)
  const [renderedDimensions, setRenderedDimensions] = useState<Dimensions | null>(null)
  const [isCropping, setIsCropping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [objectUrl, setObjectUrl] = useState<string | null>(null)

  const { isOpen, onOpen, onOpenChange } = useDisclosure()

  // Clean up object URL when component unmounts
  useEffect(() => {
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [objectUrl])

  // Display logo from store if available
  useEffect(() => {
    if (commerceLogo && !previewImage) {
      // Check if it's a URL or base64 string
      if (isValidUrl(commerceLogo)) {
        setPreviewImage(commerceLogo)
      } else {
        setPreviewImage(`data:image/png;base64,${commerceLogo}`)
      }
    }
  }, [commerceLogo])

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
        initialQuality: 0.8
      }

      try {
        // Quick preview before compression
        const quickPreviewUrl = URL.createObjectURL(file)
        setPreviewImage(quickPreviewUrl)

        const compressedFile = await imageCompression(file, options)

        // Clean up previous object URL
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl)
        }

        // Use object URL instead of base64
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
    event.target.value = '' // clear the selected file
  }

  // Center crop function
  const centerCrop = (mediaWidth: number, mediaHeight: number) => {
    // For logos, we want a square or near-square crop
    const aspect = 120 / 86

    // Calculate the largest possible crop area
    let cropWidth = mediaWidth
    let cropHeight = cropWidth / aspect

    if (cropHeight > mediaHeight) {
      cropHeight = mediaHeight
      cropWidth = cropHeight * aspect
    }

    // Center the crop
    const x = (mediaWidth - cropWidth) / 2
    const y = (mediaHeight - cropHeight) / 2

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
    if (naturalWidth > 3000 || naturalHeight > 3000) {
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

  useEffect(() => {
    if (!isOpen && isCropping) {
      setPreviewImage(null)
      setCrop({ unit: '%', width: 80, height: 80, x: 10, y: 10 })
      setCompletedCrop(null)
      setError(null)
    }
  }, [isOpen])

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
        const logo = croppedImageBase64 ? croppedImageBase64.replace(/^data:image\/[a-z]+;base64,/, '') : ''
        setCommerceLogo(logo)
        setIsLoading(false)
        onClose()
      } catch (error) {
        console.error('Error cropping image:', error)
        toast.error('Error al recortar la imagen')
        setIsLoading(false)
      }
    }
  }

  // Helper function to validate URLs
  const isValidUrl = (string: string) => {
    try {
      new URL(string)
      return true
    } catch (_) {
      return false
    }
  }

  return (
    <>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement='center'>
        <ModalContent className='max-w-xl'>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>Recortar logo</ModalHeader>
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
                      maxHeight={1000}
                      maxWidth={1000}
                      aspect={120 / 86}
                      onChange={newCrop => setCrop(newCrop)}
                      onComplete={handleComplete}
                      className='mx-auto'
                      style={{ maxWidth: '100%', maxHeight: '400px' }}
                      ruleOfThirds={true}
                    >
                      <img
                        src={previewImage}
                        alt='Preview'
                        onLoad={handleImageLoad}
                        style={{ maxWidth: '100%', maxHeight: '400px' }}
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
        id='localLogo'
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept='image/png, image/jpeg, image/jpg, image/webp, image/gif, image/svg+xml, image/avif'
      />

      <div
        className='flex flex-col justify-center items-center w-[121px] h-[88px] bg-gray-100 border border-[#C8C8C8] absolute top-[100px] rounded-lg left-[30px]'
        onClick={() => !isLoading && document.getElementById('localLogo')?.click()}
      >
        {isLoading ? (
          <div className='flex flex-col items-center justify-center'>
            <Spinner size='sm' />
            <p className='text-xs mt-1'>Cargando...</p>
          </div>
        ) : commerceLogo !== '' ? (
          <img
            src={isValidUrl(commerceLogo) ? commerceLogo : `data:image/png;base64,${commerceLogo}`}
            alt='Logo'
            className='object-cover w-full h-full rounded-lg'
          />
        ) : (
          <>
            <Camera color='#656565' />
            <p className='text-xs mt-1'>Logo</p>
          </>
        )}
      </div>
    </>
  )
}
