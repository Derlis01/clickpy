import { PixelCrop } from 'react-image-crop'

export interface Dimensions {
  width: number
  height: number
}

export const createImage = (url: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', error => reject(error))
    image.src = url
  })

export const getCroppedImg = async (
  imageSrc: string,
  crop: PixelCrop,
  naturalDimensions: Dimensions | null,
  renderedDimensions: Dimensions | null
) => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx || !naturalDimensions || !renderedDimensions) {
    return null
  }

  const { width: naturalWidth, height: naturalHeight } = naturalDimensions
  const { width: renderedWidth, height: renderedHeight } = renderedDimensions
  const scaleX = naturalWidth / renderedWidth
  const scaleY = naturalHeight / renderedHeight

  canvas.width = crop.width * scaleX
  canvas.height = crop.height * scaleY

  ctx.drawImage(
    image,
    crop.x * scaleX,
    crop.y * scaleY,
    crop.width * scaleX,
    crop.height * scaleY,
    0,
    0,
    crop.width * scaleX,
    crop.height * scaleY
  )

  const base64Image = canvas.toDataURL('image/jpeg')
  return base64Image
}
