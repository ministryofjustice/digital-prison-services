import { app } from '../../config'

import { formatName, putLastNameFirst } from '../../utils'

export default ({ prisonApi, esweService }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    type PrisonerDetails = {
      offenderNo: string
      firstName: string
      lastName: string
      bookingId: number
      bookingNo: string
      rootOffenderId: number
      dateOfBirth: string
      activeFlag: boolean
      agencyId: string
      assignedLivingUnitId: number
    }

    type coursesAndQuals = {
      enabled: boolean
      content: curious.LearnerEducationFullDetails[]
    }

    if (!app.esweEnabled) {
      return res.redirect(`/prisoner/${offenderNo}`)
    }

    try {
      const [prisonerDetails, coursesAndQualifications]: [PrisonerDetails, coursesAndQuals] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo),
        esweService.getLearnerEducationFullDetails(offenderNo),
      ])

      const { firstName, lastName } = prisonerDetails

      return res.render('prisonerProfile/prisonerWorkAndSkills/prisonerCoursesQualificationsDetails.njk', {
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        profileUrl: `/prisoner/${offenderNo}/work-and-skills#courses-summary`,
        coursesAndQualifications,
      })
    } catch (error) {
      res.locals.redirectUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
