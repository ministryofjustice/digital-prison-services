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

export const probationDocumentsFactory = (
  oauthApi,
  hmppsManageUsersApi,
  prisonApi,
  deliusIntegrationApi,
  systemOauthClient
) => {
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
      try {
        const systemContext = await systemOauthClient.getClientCredentialsTokens()
        const { name, crn, documents, convictions } = await deliusIntegrationApi.getProbationDocuments(systemContext, {
          offenderNo,
        })

        return {
          documents: { offenderDocuments: documents ?? [], convictions },
          probationDetails: { name: `${name?.forename} ${name?.surname}`, crn },
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
      const userRoles = oauthApi.userRoles(res.locals)

      const [caseloads, user, communityDocuments] = await Promise.all([
        prisonApi.userCaseLoads(res.locals),
        hmppsManageUsersApi.currentUser(res.locals),
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
