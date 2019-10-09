module.exports = (req, res) => {
  req.session.data = []

  return res.redirect('/bulk-appointments/add-appointment-details')
}
