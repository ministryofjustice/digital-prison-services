export default (title) => async (req, res) => {
  return res.render('maintenancePage.njk', { title })
}
