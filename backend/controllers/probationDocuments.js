const moment = require('moment')
const { properCaseName } = require('../utils')
const config = require('../config')
const { logError } = require('../logError')
const { formatTimestampToDate } = require('../utils')

const serviceUnavailableMessage = 'Sorry, the service is unavailable'
const getOffenderUrl = offenderNo => `${config.app.notmEndpointUrl}offenders/${offenderNo}`

const probationDocumentsFactory = (oauthApi, elite2Api, communityApi, systemOauthClient) => {
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

    const ensureAllowedPageAccess = userRoles => {
      // need the real role maybe something like VIEW_PROBATION_DOCUMENTS
      if (!userRoles.find(role => role.roleCode === 'OMIC_ADMIN')) {
        throw new Error('You do not have the correct role to access this page')
      }
    }

    const sentenceLength = sentence => {
      if (typeof sentence.originalLength === 'undefined' || typeof sentence.originalLengthUnits === 'undefined') {
        return ''
      }
      return ` (${sentence.originalLength} ${sentence.originalLengthUnits})`
    }

    const convictionDescription = conviction =>
      (conviction.sentence && `${conviction.sentence.description}${sentenceLength(conviction.sentence)}`) ||
      conviction.latestCourtAppearanceOutcome.description

    const mainOffenceDescription = conviction =>
      conviction.offences.find(offence => offence.mainOffence).detail.subCategoryDescription

    const convictionSorter = (first, second) =>
      moment(second.referralDate, 'YYYY-MM-DD').diff(moment(first.referralDate, 'YYYY-MM-DD'))

    const convictionMapper = conviction => {
      const convictionSummary = {
        title: convictionDescription(conviction),
        offence: mainOffenceDescription(conviction),
        date: formatTimestampToDate(conviction.referralDate),
        active: conviction.active,
      }

      if (conviction.custody) {
        convictionSummary.institutionName =
          conviction.custody.institution && conviction.custody.institution.institutionName
      }
      return convictionSummary
    }

    try {
      const { offenderNo } = req.params
      const { bookingId, firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

      const systemContext = await systemOauthClient.getClientCredentialsTokens()
      const probationOffenderDetails = await communityApi.getOffenderDetails(systemContext, { offenderNo })

      const [caseloads, user, userRoles, convictions] = await Promise.all([
        elite2Api.userCaseLoads(res.locals),
        oauthApi.currentUser(res.locals),
        oauthApi.userRoles(res.locals),
        communityApi.getOffenderConvictions(systemContext, { offenderNo }),
      ])

      // maybe move this to middleware? Just not sure about the need for "authApi.userRoles(res.locals)"
      ensureAllowedPageAccess(userRoles)

      const convictionSummaries = convictions.sort(convictionSorter).map(convictionMapper)
      const activeCaseLoad = caseloads.find(cl => cl.currentlyActive)
      const activeCaseLoadId = activeCaseLoad ? activeCaseLoad.caseLoadId : null

      const offenderDetails = {
        bookingId,
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(lastName)}, ${properCaseName(firstName)}`,
      }

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
        documents: { convictions: convictionSummaries },
        probationDetails: {
          name: `${probationOffenderDetails.firstName} ${probationOffenderDetails.surname}`,
          crn: probationOffenderDetails.otherIds.crn,
        },
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      pageErrors.push({ text: serviceUnavailableMessage })
      renderTemplate(req, res, { pageErrors })
    }
  }
  return { displayProbationDocumentsPage }
}

module.exports = { probationDocumentsFactory }
