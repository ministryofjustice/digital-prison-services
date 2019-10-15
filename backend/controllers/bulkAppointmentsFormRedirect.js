module.exports = (req, res) => {
  req.session.data = null

  return res.redirect('/bulk-appointments/add-appointment-details')
}
