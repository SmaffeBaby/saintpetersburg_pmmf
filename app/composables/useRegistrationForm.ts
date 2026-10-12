import type { AppLocale } from '~/stores/language'
import type { LocalizedText } from '~/composables/useHeader'

export interface RegistrationFormField {
  id: string
  name: string
  type: string
  label: LocalizedText
  placeholder: LocalizedText
  autocomplete?: string
  layout: 'third' | 'half'
}

export interface RegistrationFormContent {
  title: LocalizedText
  fields: RegistrationFormField[]
  agreement: LocalizedText
  submitLabel: LocalizedText
}

export interface RegistrationFormViewField {
  id: string
  name: string
  type: string
  label: string
  placeholder: string
  autocomplete?: string
  layout: 'third' | 'half'
}

const getLocalizedText = (value: LocalizedText, locale: AppLocale) => value[locale] || value.ru

const fallbackContent: RegistrationFormContent = {
  title: {
    ru: 'Регистрация',
    en: 'Registration'
  },
  fields: [
    {
      id: 'lastName',
      name: 'lastName',
      type: 'text',
      label: { ru: 'Фамилия', en: 'Last name' },
      placeholder: { ru: 'Фамилия', en: 'Last name' },
      autocomplete: 'family-name',
      layout: 'third'
    },
    {
      id: 'firstName',
      name: 'firstName',
      type: 'text',
      label: { ru: 'Имя', en: 'First name' },
      placeholder: { ru: 'Имя', en: 'First name' },
      autocomplete: 'given-name',
      layout: 'third'
    },
    {
      id: 'middleName',
      name: 'middleName',
      type: 'text',
      label: { ru: 'Отчество', en: 'Middle name' },
      placeholder: { ru: 'Отчество', en: 'Middle name' },
      autocomplete: 'additional-name',
      layout: 'third'
    },
    {
      id: 'birthDate',
      name: 'birthDate',
      type: 'text',
      label: { ru: 'Ваша дата рождения', en: 'Your date of birth' },
      placeholder: { ru: '12.10.2026', en: '10.12.2026' },
      autocomplete: 'bday',
      layout: 'half'
    },
    {
      id: 'region',
      name: 'region',
      type: 'text',
      label: { ru: 'Ваш регион', en: 'Your region' },
      placeholder: { ru: 'Ваш регион', en: 'Your region' },
      autocomplete: 'address-level1',
      layout: 'half'
    },
    {
      id: 'email',
      name: 'email',
      type: 'email',
      label: { ru: 'Email', en: 'Email' },
      placeholder: { ru: 'your@mail.com', en: 'your@mail.com' },
      autocomplete: 'email',
      layout: 'half'
    },
    {
      id: 'phone',
      name: 'phone',
      type: 'tel',
      label: { ru: 'Номер телефона', en: 'Phone number' },
      placeholder: { ru: '+7', en: '+7' },
      autocomplete: 'tel',
      layout: 'half'
    }
  ],
  agreement: {
    ru: 'Я даю согласие на обработку персональных данных',
    en: 'I consent to the processing of personal data'
  },
  submitLabel: {
    ru: 'Зарегистрироваться',
    en: 'Register'
  }
}

export const useRegistrationForm = async () => {
  const languageStore = useLanguageStore()
  const { data } = await useAsyncData('registration-form-content', () => queryContent<RegistrationFormContent>('/settings/registration-form').findOne())

  const formContent = computed<RegistrationFormContent>(() => data.value || fallbackContent)

  const title = computed(() => getLocalizedText(formContent.value.title, languageStore.locale))
  const fields = computed<RegistrationFormViewField[]>(() => formContent.value.fields.map((field) => ({
    ...field,
    label: getLocalizedText(field.label, languageStore.locale),
    placeholder: getLocalizedText(field.placeholder, languageStore.locale)
  })))
  const agreement = computed(() => getLocalizedText(formContent.value.agreement, languageStore.locale))
  const submitLabel = computed(() => getLocalizedText(formContent.value.submitLabel, languageStore.locale))

  return {
    agreement,
    fields,
    submitLabel,
    title
  }
}
