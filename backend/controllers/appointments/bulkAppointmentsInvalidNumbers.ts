// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const bulkAppointmentsInvalidNumbersFactory = () => {
  const index = async (req, res) => {
    const { prisonersNotFound, prisonersDuplicated } = req.session.data

    res.render('bulkAppointmentsInvalidNumbers.njk', { prisonersNotFound, prisonersDuplicated })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsInvalidNumbersFactory,
}
