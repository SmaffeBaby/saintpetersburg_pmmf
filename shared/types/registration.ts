export interface RegistrationSubmissionInput {
  lastName: string
  firstName: string
  middleName: string
  birthDate: string
  region: string
  email: string
  phone: string
}
export interface RegistrationSubmission extends RegistrationSubmissionInput {
  id: string
  createdAt: string
}
