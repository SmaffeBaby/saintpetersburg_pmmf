export interface LocalizedImageSource {
  src: string
  srcEn?: string
}

export const localizedImageSource = (image: LocalizedImageSource, locale: 'ru' | 'en') =>
  locale === 'en' && image.srcEn ? image.srcEn : image.src
