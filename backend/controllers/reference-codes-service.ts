const referenceCodesServiceFactory = (prisonerAlertsApi) => {
  const getAlertTypes = async (context) => {
    const types = await prisonerAlertsApi.getAlertTypes(context)
    const alertTypes = types.map((type) => ({
      value: type.code,
      description: type.description,
      activeFlag: type.isActive ? 'Y' : 'N',
    }))

    const alertSubTypes = types
      .map((type) => type.alertCodes)
      .reduce((acc, current) => acc.concat(current))
      .map((type) => ({
        value: type.code,
        parentValue: type.alertTypeCode,
        description: type.description,
        activeFlag: type.isActive ? 'Y' : 'N',
      }))

    const alphaSortOnDescription = (a, b) => a.description.localeCompare(b.description)

    alertTypes.sort(alphaSortOnDescription)
    alertSubTypes.sort(alphaSortOnDescription)

    return {
      alertTypes,
      alertSubTypes,
    }
  }

  return {
    getAlertTypes,
  }
}

export default referenceCodesServiceFactory
