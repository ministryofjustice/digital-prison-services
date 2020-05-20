module.exports = elite2Api => {
  const getPersonContactDetails = async (context, personId) => {
    const [addresses, emails, phones] = await Promise.all([
      elite2Api.getPersonAddresses(context, personId),
      elite2Api.getPersonEmails(context, personId),
      elite2Api.getPersonPhones(context, personId),
    ])

    return {
      addresses: addresses.filter(address => address.primary),
      emails,
      phones,
    }
  }

  return {
    getPersonContactDetails,
  }
}
