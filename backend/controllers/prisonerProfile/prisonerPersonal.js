module.exports = ({ prisonerProfileService }) => async (req, res) => {
  const { offenderNo } = req.params

  const prisonerProfileData = await prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo)

  return res.render('prisonerProfile/prisonerPersonal.njk', {
    prisonerProfileData,
  })
}
