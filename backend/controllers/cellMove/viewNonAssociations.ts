import moment from 'moment'
import { putLastNameFirst, formatName } from '../../utils'
import { getBackLinkData, getNonAssocationsInEstablishment } from './cellMoveUtils'

export default ({ prisonApi, nonAssociationsApi }) =>
  async (req, res) => {
    const { offenderNo } = req.params

    try {
      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)
      const nonAssociations = await nonAssociationsApi.getNonAssociations(res.locals, offenderNo)

      // Only show active non-associations in the same establishment
      // Active means the effective date is not in the future and the expiry date is not in the past
      const sortedNonAssociationsInEstablishment = getNonAssocationsInEstablishment(nonAssociations).sort(
        (left, right) => {
          if (left.effectiveDate < right.effectiveDate) return 1
          if (right.effectiveDate < left.effectiveDate) return -1
          if (left.offenderNonAssociation.lastName > right.offenderNonAssociation.lastName) return 1
          if (right.offenderNonAssociation.lastName > left.offenderNonAssociation.lastName) return -1
          return 0
        }
      )

      const nonAssociationsRows = sortedNonAssociationsInEstablishment?.map((nonAssociation) => ({
        name: putLastNameFirst(
          nonAssociation.offenderNonAssociation.firstName,
          nonAssociation.offenderNonAssociation.lastName
        ),
        prisonNumber: nonAssociation.offenderNonAssociation.offenderNo,
        location: nonAssociation.offenderNonAssociation.assignedLivingUnitDescription,
        type: nonAssociation.typeDescription,
        selectedOffenderKey: `${formatName(firstName, lastName)} is`,
        selectedOffenderRole: nonAssociation.reasonDescription,
        otherOffenderKey: `${formatName(
          nonAssociation.offenderNonAssociation.firstName,
          nonAssociation.offenderNonAssociation.lastName
        )} is`,
        otherOffenderRole: nonAssociation.offenderNonAssociation.reasonDescription,
        comment: nonAssociation.comments || 'None entered',
        effectiveDate: moment(nonAssociation.effectiveDate).format('D MMMM YYYY'),
      }))

      return res.render('cellMove/nonAssociations.njk', {
        nonAssociationsRows,
        breadcrumbPrisonerName: putLastNameFirst(firstName, lastName),
        prisonerName: formatName(firstName, lastName),
        searchForCellLink: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        offenderNo,
        ...getBackLinkData(req.headers.referer, offenderNo),
      })
    } catch (error) {
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }
