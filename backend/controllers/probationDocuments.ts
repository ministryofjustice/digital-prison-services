import moment from 'moment'
import { properCaseName, formatTimestampToDate } from '../utils'
import { logError } from '../logError'

import telemetry from '../azure-appinsights'
import canAccessProbationDocuments from '../shared/probationDocumentsAccess'

const ensureAllowedPageAccess = (userRoles: [{ roleCode: string }], caseloads: [{ caseLoadId }], agencyId: string) => {
  if (!canAccessProbationDocuments(userRoles, caseloads, agencyId)) {
    throw new Error('You do not have the correct role or caseload to access this page')
  }
}
const serviceUnavailableMessage = 'Sorry, the service is unavailable'
const offenderNotFoundInProbationMessage =
  'We are unable to display documents for this prisoner because we cannot find the offender record in the probation system'
const getOffenderUrl = (offenderNo) => `/prisoner/${offenderNo}`

const trackEvent = (offenderNo, suffix, { username }) => {
  if (telemetry) {
    telemetry.trackEvent({
      name: `ViewProbationDocument${suffix}`,
      properties: { username, offenderNo },
    })
  }
}

export const probationDocumentsFactory = (oauthApi, prisonApi, communityApi, systemOauthClient) => {
  const renderTemplate = (req, res, pageData) => {
    const { pageErrors, offenderDetails, ...rest } = pageData

    res.render('probationDocuments.njk', {
      title: 'Probation documents - Digital Prison Services',
      errors: [...req.flash('errors'), ...pageErrors],
      offenderDetails,
      ...rest,
    })
  }

  const displayProbationDocumentsPage = async (req, res) => {
    const pageErrors = []

    const getCommunityDocuments = async (offenderNo) => {
      const sentenceLength = (sentence) => {
        if (!sentence.originalLength || !sentence.originalLengthUnits) {
          return ''
        }
        return ` (${sentence.originalLength} ${sentence.originalLengthUnits})`
      }

      const convictionDescription = (conviction) =>
        (conviction.sentence && `${conviction.sentence.description}${sentenceLength(conviction.sentence)}`) ||
        conviction.latestCourtAppearanceOutcome.description

      const mainOffenceDescription = (conviction) =>
        conviction.offences.find((offence) => offence.mainOffence).detail.subCategoryDescription

      const convictionSorter = (first, second) =>
        moment(second.referralDate, 'YYYY-MM-DD').diff(moment(first.referralDate, 'YYYY-MM-DD'))

      const documentSorter = (first, second) =>
        moment(second.createdAt, 'YYYY-MM-DD').diff(moment(first.createdAt, 'YYYY-MM-DD'))

      const documentMapper = (document) => ({
        id: document.id,
        documentName: document.documentName,
        author: document.author,
        type: document.type.description,
        description: document.extendedDescription || '',
        date: formatTimestampToDate(document.createdAt),
      })

      const convictionMapper = (conviction) => {
        const convictionSummary = {
          title: convictionDescription(conviction),
          offence: mainOffenceDescription(conviction),
          date: formatTimestampToDate(conviction.referralDate),
          active: conviction.active,
          documents: conviction.documents.sort(documentSorter).map(documentMapper),
          institutionName: undefined,
        }

        if (conviction.custody) {
          convictionSummary.institutionName =
            conviction.custody.institution && conviction.custody.institution.institutionName
        }
        return convictionSummary
      }

      try {
        const systemContext = await systemOauthClient.getClientCredentialsTokens()
        const [convictions, probationOffenderDetails, allDocuments] = await Promise.all([
          communityApi.getOffenderConvictions(systemContext, { offenderNo }),
          communityApi.getOffenderDetails(systemContext, { offenderNo }),
          communityApi.getOffenderDocuments(systemContext, { offenderNo }),
        ])

        const convictionsWithDocuments = convictions.map((conviction) => {
          const convictionDocuments = allDocuments.convictions || []
          const relatedConviction = convictionDocuments.find(
            // community api mixes types for convictionId so use string
            (documentConviction) => documentConviction.convictionId.toString() === conviction.convictionId.toString()
          )
          return {
            ...conviction,
            documents: (relatedConviction && relatedConviction.documents) || [],
          }
        })
        const convictionSummaries = convictionsWithDocuments.sort(convictionSorter).map(convictionMapper)
        const offenderDocuments =
          (allDocuments.documents && allDocuments.documents.sort(documentSorter).map(documentMapper)) || []

        return {
          documents: {
            offenderDocuments,
            convictions: convictionSummaries,
          },
          probationDetails: {
            name: `${probationOffenderDetails.firstName} ${probationOffenderDetails.surname}`,
            crn: probationOffenderDetails.otherIds.crn,
          },
        }
      } catch (error) {
        if (error.status && error.status === 404) {
          logError(req.originalUrl, error, offenderNotFoundInProbationMessage)
          pageErrors.push({ text: offenderNotFoundInProbationMessage })
          return {}
        }
        throw error
      }
    }

    const { offenderNo } = req.params

    try {
      const { bookingId, firstName, lastName, agencyId } = await prisonApi.getDetails(res.locals, offenderNo)

      const [caseloads, user, userRoles, communityDocuments] = await Promise.all([
        prisonApi.userCaseLoads(res.locals),
        oauthApi.currentUser(res.locals),
        oauthApi.userRoles(res.locals),
        getCommunityDocuments(offenderNo),
      ])

      ensureAllowedPageAccess(userRoles, caseloads, agencyId)

      const activeCaseLoad = caseloads.find((cl) => cl.currentlyActive)
      const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
      }

      trackEvent(offenderNo, 'Success', user)

      renderTemplate(req, res, {
        offenderDetails,
        pageErrors,
        user: {
          displayName: user.name,
          activeCaseLoad: {
            description: activeCaseLoad.description,
            id: activeCaseLoadId,
          },
        },
        userRoles,
        ...communityDocuments,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      pageErrors.push({ text: serviceUnavailableMessage })
      trackEvent(offenderNo, 'Failure', { username: 'unknown' })
      renderTemplate(req, res, { pageErrors })
    }
  }
  return { displayProbationDocumentsPage }
}

export default { probationDocumentsFactory }
