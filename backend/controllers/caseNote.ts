import config from '../config'
import { properCaseName } from '../utils'
import getContext from './prisonerProfile/prisonerProfileContext'

const getOffenderUrl = (offenderNo) => `/prisoner/${offenderNo}`

const getContextWithRoles = async (offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi) => {
  const userRoles = oauthApi.userRoles(res.locals)
  res.locals = { ...res.locals, userRoles }
  const { context } = await getContext({
    offenderNo,
    res,
    req,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  })

  return context
}

export const caseNoteFactory = ({ prisonApi, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  const getOffenderDetails = async (context, offenderNo) => {
    const { firstName, lastName } = await prisonApi.getDetails(context, offenderNo)

    return {
      offenderNo,
      profileUrl: getOffenderUrl(offenderNo),
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
    }
  }

  const recordIncentiveLevelInterruption = async (req, res) => {
    const { offenderNo } = req.params
    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)
    const offenderDetails = await getOffenderDetails(context, offenderNo)

    return res.render('caseNotes/recordIncentiveLevelInterruption.njk', {
      title: 'Record incentive level',
      breadcrumbText: 'Record incentive level',
      offenderDetails,
      caseNotesUrl: `${offenderDetails.profileUrl}/case-notes`,
      recordIncentiveLevelUrl: `${config.apis.incentives.ui_url}/incentive-reviews/prisoner/${offenderNo}/change-incentive-level`,
    })
  }

  return { recordIncentiveLevelInterruption }
}

export default { caseNoteFactory }
