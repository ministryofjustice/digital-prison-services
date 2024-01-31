import { alertFlagLabels, cellMoveAlertCodes } from '../../shared/alertFlagValues'
import { putLastNameFirst, formatName, formatLocation, hasLength, isRedirectCaseLoad } from '../../utils'
import { getNonAssociationsInEstablishment, translateCsra, userHasAccess } from '../cellMove/cellMoveUtils'
import logger from '../../log'
import config from '../../config'

export default ({ oauthApi, prisonApi, movementsService, nonAssociationsApi, logError }) => {
  const view = async (req, res) => {
    const { offenderNo } = req.params

    try {
      const userRoles = oauthApi.userRoles(res.locals)
      const userCaseLoads = await prisonApi.userCaseLoads(res.locals)

      const { activeCaseLoadId } = req.session.userDetails

      const [prisonerDetails, assessments] = await Promise.all([
        prisonApi.getDetails(res.locals, offenderNo, true),
        prisonApi.getCsraAssessments(res.locals, [offenderNo]),
      ])

      const receptionOccupancy = await prisonApi.getReceptionsWithCapacity(res.locals, prisonerDetails.agencyId)

      if (!receptionOccupancy.length) {
        logger.info('Can not move to reception as already full to capacity')
        return res.redirect(`/prisoner/${offenderNo}/reception-move/reception-full`)
      }

      if (!userHasAccess({ userRoles, userCaseLoads, offenderCaseload: prisonerDetails.agencyId })) {
        logger.info('User does not have correct roles')
        return res.render('notFound.njk', { url: '/prisoner-search' })
      }

      const displayLinkToPrisonersMostRecentCsra =
        hasLength(assessments) &&
        assessments.sort((a, b) => b.assessmentDate.localeCompare(a.assessmentDate))[0].assessmentComment

      const nonAssociations = await nonAssociationsApi.getNonAssociationsLegacy(res.locals, offenderNo)

      const prisonersActiveAlertCodes = prisonerDetails.alerts
        .filter((alert) => !alert.expired)
        .map((alert) => alert.alertCode)

      const prisonerAlerts = alertFlagLabels.filter((alertFlag) =>
        alertFlag.alertCodes.some(
          (alert) => prisonersActiveAlertCodes.includes(alert) && cellMoveAlertCodes.includes(alert)
        )
      )

      const prisonerDetailsWithFormattedLocation = {
        ...prisonerDetails,
        assignedLivingUnit: {
          ...prisonerDetails.assignedLivingUnit,
          description: formatLocation(prisonerDetails.assignedLivingUnit.description),
        },
      }

      const offenderNumbersOfAllNonAssociations = nonAssociations.nonAssociations.map(
        (offender) => offender.offenderNonAssociation.offenderNo
      )
      const offendersInReception = await movementsService.getOffendersInReception(res.locals, activeCaseLoadId)
      const offenderNumbersOfAllInReception = offendersInReception.map((offender) => offender.offenderNo)
      let offenderCsraStatus = []

      if (offenderNumbersOfAllInReception.length > 0) {
        offenderCsraStatus = await movementsService.getCsraForMultipleOffenders(
          res.locals,
          offenderNumbersOfAllInReception
        )
      }

      const otherOffenders = offendersInReception
        .sort((left, right) => left.lastName.localeCompare(right.lastName, 'en', { ignorePunctuation: true }))
        .map((offender) => ({
          offenderNo: offender.offenderNo,
          name: putLastNameFirst(offender.firstName, offender.lastName),
          nonAssociation: offenderNumbersOfAllNonAssociations.includes(offender.offenderNo),
          csraClassification:
            offenderCsraStatus.find((statuses) => statuses.offenderNo === offender.offenderNo)?.classification ||
            'Not entered',
          displayCsraLink: offenderCsraStatus.find((statuses) => statuses.offenderNo === offender.offenderNo)
            ?.assessmentComment,
          alerts: offender.alerts
            .map((alertCode) => alertFlagLabels.find((alertLabel) => alertLabel.alertCodes.includes(alertCode)))
            .filter(Boolean)
            .map((alertLabel) => ({ classes: alertLabel.classes, label: alertLabel.label }))
            .sort((left, right) => left.label.localeCompare(right.label, 'en', { ignorePunctuation: true })),
        }))

      const nonAssociationsInEstablishment = await getNonAssociationsInEstablishment(
        nonAssociations,
        res.locals,
        prisonApi
      )
      const sortedNonAssociationsInReceptionWithinCurrentEstablishment = nonAssociationsInEstablishment
        .sort((left, right) => {
          if (left.effectiveDate < right.effectiveDate) return 1
          if (right.effectiveDate < left.effectiveDate) return -1
          if (left.offenderNonAssociation.lastName > right.offenderNonAssociation.lastName) return 1
          if (right.offenderNonAssociation.lastName > left.offenderNonAssociation.lastName) return -1
          return 0
        })
        .filter((nonAssociationPrisoner) =>
          offenderNumbersOfAllInReception.includes(nonAssociationPrisoner.offenderNonAssociation.offenderNo)
        )

      const { firstName, lastName } = await prisonApi.getDetails(res.locals, offenderNo)

      const nonAssociationsRows = sortedNonAssociationsInReceptionWithinCurrentEstablishment?.map((nonAssociation) => ({
        name: putLastNameFirst(
          nonAssociation.offenderNonAssociation.firstName,
          nonAssociation.offenderNonAssociation.lastName
        ),
        prisonNumber: nonAssociation.offenderNonAssociation.offenderNo,
        type: nonAssociation.typeDescription,
        selectedOffenderKey: `${formatName(firstName, lastName)} is`,
        selectedOffenderRole: nonAssociation.reasonDescription,
        otherOffenderKey: `${formatName(
          nonAssociation.offenderNonAssociation.firstName,
          nonAssociation.offenderNonAssociation.lastName
        )} is`,
        otherOffenderRole: nonAssociation.offenderNonAssociation.reasonDescription,
        comment: nonAssociation.comments || 'Not entered',
      }))

      return res.render('receptionMoves/considerRisksReception.njk', {
        reverseOrderPrisonerName: putLastNameFirst(prisonerDetails.firstName, prisonerDetails.lastName).trim(),
        prisonerName: formatName(prisonerDetails.firstName, prisonerDetails.lastName),
        prisonerAlerts,
        prisonerDetails: prisonerDetailsWithFormattedLocation,
        nonAssociationLink: `/prisoner/${offenderNo}/cell-move/non-associations`,
        searchForCellRootUrl: `/prisoner/${offenderNo}/cell-move/search-for-cell`,
        offenderDetailsUrl: `/prisoner/${offenderNo}/cell-move/prisoner-details`,
        csraDetailsUrl: `/prisoner/${offenderNo}/cell-move/cell-sharing-risk-assessment-details`,
        displayLinkToPrisonersMostRecentCsra,
        convertedCsra: translateCsra(prisonerDetails.csraClassificationCode),
        backUrl: backUrl(activeCaseLoadId, offenderNo),
        hasNonAssociations: nonAssociationsInEstablishment?.length > 0,
        nonAssociationsRows,
        offendersInReception: otherOffenders,
        inReceptionCount: `${otherOffenders.length} people in reception`,
        errors: req.flash('errors'),
      })
    } catch (error) {
      logError(req.originalUrl, error, 'error getting consider-risks-reception')
      res.locals.homeUrl = `/prisoner/${offenderNo}`
      throw error
    }
  }

  const submit = async (req, res) => {
    const { offenderNo } = req.params
    const { considerRisksReception } = req.body
    const { activeCaseLoadId } = req.session.userDetails

    if (!considerRisksReception) {
      const errors = []
      errors.push({ href: '#considerRisksReception', text: 'Select yes or no' })
      req.flash('errors', errors)
      return res.redirect(`/prisoner/${offenderNo}/reception-move/consider-risks-reception`)
    }

    if (considerRisksReception === 'yes') {
      return res.redirect(`/prisoner/${offenderNo}/reception-move/confirm-reception-move`)
    }

    return res.redirect(backUrl(activeCaseLoadId, offenderNo))
  }

  const backUrl = (activeCaseLoadId: string, offenderNo: string) =>
    isRedirectCaseLoad(activeCaseLoadId)
      ? `${config.app.prisonerProfileRedirect.url}/prisoner/${offenderNo}/location-details`
      : `/prisoners/${offenderNo}/cell-history`

  return { view, submit }
}
