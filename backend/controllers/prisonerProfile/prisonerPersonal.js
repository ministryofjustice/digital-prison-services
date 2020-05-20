const { serviceUnavailableMessage } = require('../../common-messages')
const logErrorAndContinue = require('../../shared/logErrorAndContinue')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../../config')

const {
  aliasesViewModel,
  distinguishingMarksViewModel,
  identifiersViewModel,
  personalDetailsViewModel,
  physicalCharacteristicsViewModel,
  activeContactsViewModel,
} = require('./personalViewModels')

module.exports = ({ prisonerProfileService, personService, elite2Api, logError }) => async (req, res) => {
  const { offenderNo } = req.params
  const basicPrisonerDetails = await elite2Api
    .getDetails(res.locals, offenderNo)
    .then(data => data)
    .catch(error => {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: dpsUrl })
    })
  const { bookingId } = basicPrisonerDetails || {}

  const [prisonerProfileData, fullPrisonerDetails, identifiers, aliases, property, contacts] = await Promise.all(
    [
      prisonerProfileService.getPrisonerProfileData(res.locals, offenderNo),
      elite2Api.getPrisonerDetail(res.locals, bookingId),
      elite2Api.getIdentifiers(res.locals, bookingId),
      elite2Api.getOffenderAliases(res.locals, bookingId),
      elite2Api.getPrisonerProperty(res.locals, bookingId),
      elite2Api.getPrisonerContacts(res.locals, bookingId),
    ].map(apiCall => logErrorAndContinue(apiCall))
  )

  const { nextOfKin } = contacts || {}

  const activeNextOfKins =
    nextOfKin && nextOfKin.filter(kin => kin.activeFlag && kin.nextOfKin && kin.canBeContactedFlag)

  const nextOfKinsWithContact = activeNextOfKins.map(async kin => {
    const { addresses, emails, phones } = await personService.getPersonContactDetails(res.locals, kin.personId)

    return {
      ...kin,
      addresses,
      emails,
      phones,
    }
  })

  const { physicalAttributes, physicalCharacteristics, physicalMarks } = fullPrisonerDetails

  return res.render('prisonerProfile/prisonerPersonal/prisonerPersonal.njk', {
    prisonerProfileData,
    aliases: aliasesViewModel({ aliases }),
    distinguishingMarks: distinguishingMarksViewModel({ physicalMarks }),
    identifiers: identifiersViewModel({ identifiers }),
    personalDetails: personalDetailsViewModel({ prisonerDetails: fullPrisonerDetails, property }),
    physicalCharacteristics: physicalCharacteristicsViewModel({ physicalAttributes, physicalCharacteristics }),
    activeContacts: activeContactsViewModel({ personal: nextOfKinsWithContact }),
  })
}

// nextOfKinsWithContact
// [
//   {
//     lastName: 'VICTETRIS',
//     firstName: 'ALVRULEMEKA',
//     contactType: 'S',
//     contactTypeDescription: 'Social/ Family',
//     relationship: 'OTHER',
//     relationshipDescription: 'Other - Social',
//     emergencyContact: true,
//     nextOfKin: true,
//     relationshipId: 6694648,
//     personId: 1674445,
//     activeFlag: true,
//     approvedVisitorFlag: false,
//     canBeContactedFlag: false,
//     awareOfChargesFlag: false,
//     contactRootOffenderId: 0,
//     bookingId: 1102484,
//     addresses: [],
//     emails: [],
//     phones: [{ number: '1', type: 'MOB' }]
//   }
// ]
