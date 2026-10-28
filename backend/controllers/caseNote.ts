import config from '../config'
import { properCaseName } from '../utils'

const getOffenderUrl = offenderNo => `/prisoner/${offenderNo}`

const getContextWithRoles = (res, oauthApi) => {
  const userRoles = oauthApi.userRoles(res.locals)
  res.locals = { ...res.locals, userRoles }
  return res.locals
}

export const caseNoteFactory = ({ prisonApi, oauthApi }) => {
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
    const context = getContextWithRoles(res, oauthApi)
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
