const { putLastNameFirst, formatName, formatTimestampToDate, sortByDateTime } = require('../../utils')

const csraOptions = [{ value: 'STANDARD', text: 'Standard' }, { value: 'HI', text: 'High' }]

module.exports = ({ prisonApi }) => async (req, res) => {
  const { offenderNo } = req.params
  const { csra, location } = req.query

  try {
    const [prisonerDetails, csraAssessments] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      prisonApi.getCsraAssessmentsForPrisoner(res.locals, offenderNo),
    ])

    const { firstName, lastName } = prisonerDetails

    const agencyIds = [...new Set(csraAssessments.map(assessment => assessment.assessmentAgencyId))]

    const agenciesWithDescriptions = await Promise.all(
      agencyIds.filter(agencyId => agencyId).map(agencyId => prisonApi.getAgencyDetails(res.locals, agencyId))
    )

    const sortedRelavantResults = csraAssessments
      .filter(assessment => {
        const { assessmentAgencyId, classificationCode } = assessment
        if (csra && location) return classificationCode === csra && assessmentAgencyId === location
        if (csra) return classificationCode === csra
        if (location) return assessmentAgencyId === location

        return true
      })
      .sort((left, right) => sortByDateTime(right.assessmentDate, left.assessmentDate))

    return res.render('prisonerProfile/prisonerCsraHistory.njk', {
      breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
      csraOptions,
      formValues: req.query,
      locationOptions: agenciesWithDescriptions.map(agency => ({ text: agency.description, value: agency.agencyId })),
      prisonerName: formatName(firstName, lastName),
      profileUrl: `/prisoner/${offenderNo}`,
      rows: sortedRelavantResults.map(assessment => [
        { text: assessment.assessmentDate && formatTimestampToDate(assessment.assessmentDate) },
        { text: csraOptions.find(csraCode => csraCode.value === assessment.classificationCode)?.text },
        {
          text: agenciesWithDescriptions.find(agency => agency.agencyId === assessment.assessmentAgencyId)?.description || 'Not entered',
        },
        { text: assessment.assessmentComment || 'Not entered' },
        {
          html: `<a class="govuk-link" href="/prisoner/${offenderNo}/csra-review?assessmentSeq=${
            assessment.assessmentSeq
          }&bookingId=${assessment.bookingId}">View details</a>`,
        },
      ]),
    })
  } catch (error) {
    res.locals.redirectUrl = `/prisoner/${offenderNo}`
    throw error
  }
}
