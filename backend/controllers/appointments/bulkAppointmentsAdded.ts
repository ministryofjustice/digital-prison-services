// @ts-expect-error ts-migrate(2451) FIXME: Cannot redeclare block-scoped variable 'bulkAppoin... Remove this comment to see the full error message
const bulkAppointmentsAddedFactory = () => {
  const index = async (req, res) => {
    const prisonersRemoved = req.flash('prisonersRemoved')
    res.render('bulkAppointmentsAdded.njk', { prisonersRemoved })
  }
  return { index }
}

module.exports = {
  bulkAppointmentsAddedFactory,
}
