const { putLastNameFirst, formatName, formatTimestampToDate } = require('../../utils')

const csraOptions = [
  { value: 'STANDARD', text: 'Standard' },
  { value: 'HI', text: 'High' },
  { value: 'PEND', text: 'Pending' },
]

module.exports = ({ prisonApi }) => async (req, res) => {
  const { offenderNo } = req.params
  const { csra, location } = req.query

  try {
    const [prisonerDetails, csraAssessments] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      prisonApi.getCsraAssessmentsForPrisoner(res.locals, { offenderNo, latestOnly: 'false', activeOnly: 'false' }),
    ])

    const { firstName, lastName } = prisonerDetails

    const agencyIds = [...new Set(csraAssessments.map(assessment => assessment.assessmentAgencyId))]

    const agenciesWithDescriptions = await Promise.all(
      agencyIds.filter(agencyId => agencyId).map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId))
    )

    const relavantResults = csraAssessments.filter(assessment => {
      const { assessmentAgencyId, classificationCode } = assessment
      if (csra && location) return classificationCode === csra && assessmentAgencyId === location
      if (csra) return classificationCode === csra
      if (location) return assessmentAgencyId === location

      return true
    })

    return res.render('prisonerProfile/prisonerCsraHistory.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      csraOptions,
      formValues: req.query,
      locationOptions: agenciesWithDescriptions.map(agency => ({ text: agency.description, value: agency.agencyId })),
      prisonerName: formatName(firstName, lastName),
      rows: relavantResults.map(assessment => [
        { text: assessment.assessmentDate && formatTimestampToDate(assessment.assessmentDate) },
        { text: csraOptions.find(csraCode => csraCode.value === assessment.classificationCode)?.text },
        {
          text: agenciesWithDescriptions.find(agency => agency.agencyId === assessment.assessmentAgencyId)?.description,
        },
        { text: assessment.assessmentComment || 'Not entered' },
      ]),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
