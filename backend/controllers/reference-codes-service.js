const referenceCodesServiceFactory = elite2Api => {
  const getAlertTypes = async context => {
    const types = await elite2Api.getAlertTypes(context)
    const alertTypes = types.map(type => ({
      value: type.code,
      description: type.description,
      activeFlag: type.activeFlag,
    }))

    const alertSubTypes = types
      .map(type => type.subCodes)
      .reduce((acc, current) => acc.concat(current))
      .map(type => ({
        value: type.code,
        parentValue: type.parentCode,
        description: type.description,
        activeFlag: type.activeFlag,
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

module.exports = referenceCodesServiceFactory
