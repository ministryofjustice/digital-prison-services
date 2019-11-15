const caseloadSwitchFactory = (elite2Api, logError) => {
  const index = async (req, res) => {
    try {
      const caseloads = await elite2Api.userCaseLoads(res.locals)
      const options = caseloads.map(caseload => ({ value: caseload.caseLoadId, text: caseload.description }))
      res.render('caseloadSwitch.njk', { options })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        url: '/switch-caseload',
      })
    }
  }

  return index
}

module.exports = {
  caseloadSwitchFactory,
}
