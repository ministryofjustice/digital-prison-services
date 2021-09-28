import { properCaseName, putLastNameFirst } from '../../utils'

export default ({ prisonApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

      return res.render('cellMove/spaceCreated.njk', {
        title: `${properCaseName(firstName)} ${properCaseName(lastName)} has been moved`,
        name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        offenderNo,
        prisonerProfileLink: `/prisoner/${offenderNo}`,
        prisonerSearchLink: '/prisoner-search',
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}/cell-move/search-for-cell`
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
