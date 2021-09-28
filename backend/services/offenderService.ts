import { properCaseName } from '../utils'

const OffenderServiceFactory = (prisonApi) => {
  const getOffender = async (context, offenderNo) => {
    const bookingDetails = await prisonApi.getDetails(context, offenderNo)

    return {
      bookingId: bookingDetails.bookingId,
      firstName: properCaseName(bookingDetails.firstName),
      lastName: properCaseName(bookingDetails.lastName),
    }
  }

  return {
    getOffender,
  }
}

export default OffenderServiceFactory
