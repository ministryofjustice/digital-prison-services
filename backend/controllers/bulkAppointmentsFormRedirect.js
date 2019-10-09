module.exports = (req, res) => {
  // eslint-disable-next-line no-param-reassign
  req.session.data = []

  return res.redirect('/bulk-appointments/add-appointment-details')
}
