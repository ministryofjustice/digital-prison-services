export const deliusIntegrationApiFactory = (client) => {
  const processResponse = () => (response) => response.body

  const get = (context, url) => client.get(context, url).then(processResponse())
  const pipe = (context, url, res) => client.pipe(context, url, res, { retry: 0 })

  const getProbationDocuments = (context, { offenderNo }): ProbationDocumentsResponse =>
    get(context, `/case/${offenderNo}/documents`)

  const downloadDocument = (context, { documentId, res }) => pipe(context, `/document/${documentId}`, res)

  return {
    getProbationDocuments,
    downloadDocument,
  }
}

export interface ProbationDocument {
  id: string
  name: string
  description?: string
  type: string
  author?: string
  createdAt?: Date
}

export interface Conviction {
  title?: string
  offence: string
  date: Date
  active: boolean
  documents: ProbationDocument[]
  institutionName?: string
}

export interface ProbationDocumentsResponse {
  crn: string
  name: {
    forename: string
    middleName?: string
    surname: string
  }
  documents: ProbationDocument[]
  convictions: Conviction[]
}

export default {
  deliusIntegrationApiFactory,
}
