const { formatName, putLastNameFirst, getTime, stripAgencyPrefix } = require('../../utils')

module.exports = ({ prisonApi }) => async (req, res) => {
  const {
    user: { activeCaseLoad },
  } = res.locals

  try {
    const offenders = await prisonApi.getInmatesAtLocationPrefix(res.locals, activeCaseLoad.caseLoadId)
    const offendersInCellSwap = offenders.filter(offender => offender.assignedLivingUnitDesc === 'CSWAP')

    const offenderNumbers = offendersInCellSwap.map(offender => offender.offenderNo)

    const offendersWithNoCell = await Promise.all(
      offenderNumbers.map(async offenderNo => {
        const { bookingId, ...prisonerDetails } = await prisonApi.getDetails(res.locals, offenderNo)

        const { content: cells } = await prisonApi.getOffenderCellHistory(res.locals, bookingId, {
          page: 0,
          size: 10000,
        })

        const cellHistoryDescendingSequence = cells.sort(
          (left, right) => right.bedAssignmentHistorySequence - left.bedAssignmentHistorySequence
        )

        const currentLocation = cellHistoryDescendingSequence[0]
        const previousLocation = cellHistoryDescendingSequence[1]

        const staffDetails = await prisonApi.getStaffDetails(res.locals, currentLocation.movementMadeBy)

        return {
          movedBy: formatName(staffDetails.firstName, staffDetails.lastName),
          offenderNo,
          previousCell: stripAgencyPrefix(previousLocation.description, activeCaseLoad.caseLoadId),
          name: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName),
          timeOut: getTime(previousLocation.assignmentEndDateTime),
        }
      })
    )

    return res.render('establishmentRoll/noCellAllocated.njk', {
      results: offendersWithNoCell,
    })
  } catch (error) {
    res.locals.redirectUrl = `/establishment-roll`
    throw error
  }
}
