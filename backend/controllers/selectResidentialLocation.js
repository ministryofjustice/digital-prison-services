module.exports = whereaboutsApi => async (req, res) => {
  try {
    const {
      user: { activeCaseLoad },
    } = res.locals
    const residentialLocations = await whereaboutsApi.searchGroups(res.locals, activeCaseLoad.caseLoadId)

    return res.render('selectResidentialLocation.njk', {
      residentialLocations: residentialLocations.map(location => ({ text: location.name, value: location.key })),
    })
  } catch (error) {
    console.log({ error })
    res.locals.redirectUrl = `/manage-prisoner-whereabouts`
    throw error
  }
}
