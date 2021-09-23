import moment from 'moment'

export default ({ prisonApi }) => {
  const sortTextAlphabetically = (left, right) => left.text.localeCompare(right.text)
  const index = async (req, res) => {
    const { userDetails } = req.session
    const { activeCaseLoadId } = userDetails

    const movementReasons = await prisonApi.getMovementReasons(res.locals)
    const agencyDetails = await prisonApi.getAgencyDetails(res.locals, activeCaseLoadId)

    const date = moment().format('DD/MM/YYYY')
    const dateForTitle = moment(date, 'DD/MM/YYYY').format('D MMMM YYYY')

    return res.render('whereabouts/scheduledMoves.njk', {
      title: `People due to leave ${agencyDetails.description} on ${dateForTitle}`,
      dateForTitle,
      agencyDescription: agencyDetails.description,
      formValues: {
        date,
      },
      movementReasons: movementReasons
        .map((values) => ({
          value: values.code,
          text: values.description,
        }))
        .sort(sortTextAlphabetically),
    })
  }

  return {
    index,
  }
}
