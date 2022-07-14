import qs from 'qs'
import { formatTimestampToDate, formatTimestampToDateTime } from '../utils'

export const retentionReasonsFactory = (prisonApi, dataComplianceApi) => {
  const sortReasonsByDisplayOrder = (reasons) => reasons.sort((r1, r2) => (r1.displayOrder > r2.displayOrder ? 1 : -1))

  const getOffenderUrl = (offenderNo) => `/prisoner/${offenderNo}`
  const getRetentionReasonsUrl = (offenderNo) => `/offenders/${offenderNo}/retention-reasons`

  const getLastUpdate = (existingRecord) =>
    existingRecord
      ? {
          version: existingRecord.etag,
          timestamp: formatTimestampToDateTime(existingRecord.modifiedDateTime),
          user: existingRecord.userId,
        }
      : {}

  const flagReasonsAlreadySelected = (retentionReasons, existingReasons) => {
    const matchingReason = (reason1) => (reason2) => reason1.reasonCode === reason2.reasonCode

    return retentionReasons.map((reasonToDisplay) => {
      const matchedReason = existingReasons.find(matchingReason(reasonToDisplay))

      return {
        ...reasonToDisplay,
        alreadySelected: matchedReason != null,
        details: matchedReason && matchedReason.reasonDetails,
      }
    })
  }

  const validateOptionsSelected = (optionsSelected) =>
    optionsSelected
      .filter((option) => {
        const details = option.reasonDetails && option.reasonDetails.trim()
        return details === '' || (details && details.length < 2)
      })
      .map((option) => ({ text: 'Enter more detail', href: `#more-detail-${option.reasonCode}` }))

  const renderTemplate = async ({
    req,
    res,
    selectedReasons,
    pageErrors,
  }: {
    req: any
    res: any
    selectedReasons?: unknown
    pageErrors?: unknown
  }) => {
    const { offenderNo } = req.params
    const [offenderDetails, allRetentionReasons, existingRecord] = await Promise.all([
      prisonApi.getDetails(res.locals, offenderNo),
      dataComplianceApi.getOffenderRetentionReasons(res.locals).then(sortReasonsByDisplayOrder),
      dataComplianceApi.getOffenderRetentionRecord(res.locals, offenderNo),
    ])
    const agencyDetails = await prisonApi.getAgencyDetails(res.locals, offenderDetails.agencyId)
    const reasonsToFlag = selectedReasons || (existingRecord && existingRecord.retentionReasons) || []

    return res.render('retentionReasons.njk', {
      errors: pageErrors,
      lastUpdate: getLastUpdate(existingRecord),
      formAction: getRetentionReasonsUrl(offenderNo),
      agency: agencyDetails.description,
      offenderUrl: getOffenderUrl(offenderNo),
      retentionReasons: flagReasonsAlreadySelected(allRetentionReasons, reasonsToFlag),
      offenderBasics: {
        offenderNo: offenderDetails.offenderNo,
        firstName: offenderDetails.firstName,
        lastName: offenderDetails.lastName,
        dateOfBirth: formatTimestampToDate(offenderDetails.dateOfBirth),
      },
    })
  }

  const index = async (req, res) => renderTemplate({ req, res })

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { reasons, version } = qs.parse(req.body)
    const selectedReasons = (reasons as any).filter((reason) => reason.reasonCode)

    const pageErrors = validateOptionsSelected(selectedReasons)
    if (pageErrors.length > 0) return renderTemplate({ req, res, selectedReasons, pageErrors })

    await dataComplianceApi.putOffenderRetentionRecord(
      res.locals,
      offenderNo,
      { retentionReasons: selectedReasons },
      version
    )

    return res.redirect(getOffenderUrl(offenderNo))
  }

  return { index, post }
}

export default {
  retentionReasonsFactory,
}
