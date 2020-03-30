const qs = require('qs')
const {
  app: { notmEndpointUrl: dpsUrl },
} = require('../config')
const { serviceUnavailableMessage } = require('../common-messages')

const retentionReasonsFactory = (elite2Api, dataComplianceApi, logError) => {
  const sortReasonsByDisplayOrder = reasons => reasons.sort((r1, r2) => (r1.displayOrder > r2.displayOrder ? 1 : -1))

  const getAgencyDescription = (agencies, agencyId) => {
    const agency = agencies.find(a => a.agencyId === agencyId)
    return agency ? agency.description : 'Unknown'
  }

  const getOffenderUrl = offenderNo => `${dpsUrl}offenders/${offenderNo}`

  const getFormAction = offenderNo => `/offenders/${offenderNo}/retention-reasons`

  const getLastUpdate = existingRecord =>
    existingRecord && {
      version: existingRecord.etag,
    }

  const flagReasonsAlreadySelected = (retentionReasons, existingRecord) => {
    const existingReasons = existingRecord && existingRecord.retentionReasons
    const matchingReason = reason1 => reason2 => reason1.reasonCode === reason2.reasonCode

    return retentionReasons.map(reasonToDisplay => {
      const matchedReason = existingReasons && existingReasons.find(matchingReason(reasonToDisplay))

      return {
        ...reasonToDisplay,
        alreadySelected: matchedReason != null,
        details: matchedReason && matchedReason.reasonDetails,
      }
    })
  }

  const renderError = (req, res, error) => {
    const { offenderNo } = req.params
    if (error) logError(req.originalUrl, error, serviceUnavailableMessage)
    return res.render('error.njk', { url: getOffenderUrl(offenderNo) })
  }

  const renderTemplate = async (req, res) => {
    try {
      const { offenderNo } = req.params
      const [offenderDetails, agencies, retentionReasons, existingRecord] = await Promise.all([
        elite2Api.getDetails(res.locals, offenderNo),
        elite2Api.getAgencies(res.locals),
        dataComplianceApi.getOffenderRetentionReasons(res.locals).then(sortReasonsByDisplayOrder),
        dataComplianceApi.getOffenderRetentionRecord(res.locals, offenderNo),
      ])

      return res.render('retentionReasons.njk', {
        lastUpdate: getLastUpdate(existingRecord),
        formAction: getFormAction(offenderNo),
        agency: getAgencyDescription(agencies, offenderDetails.agencyId),
        offenderUrl: getOffenderUrl(offenderNo),
        retentionReasons: flagReasonsAlreadySelected(retentionReasons, existingRecord),
        offenderBasics: {
          offenderNo: offenderDetails.offenderNo,
          firstName: offenderDetails.firstName,
          lastName: offenderDetails.lastName,
          dateOfBirth: offenderDetails.dateOfBirth,
        },
      })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  const index = async (req, res) => renderTemplate(req, res)

  const post = async (req, res) => {
    try {
      const { offenderNo } = req.params
      const { reasons, version } = qs.parse(req.body)
      const optionsSelected = {
        retentionReasons: reasons.filter(reason => reason.reasonCode),
      }

      await dataComplianceApi.putOffenderRetentionRecord(res.locals, offenderNo, optionsSelected, version)

      return res.redirect(getOffenderUrl(offenderNo))
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return { index, post }
}

module.exports = {
  retentionReasonsFactory,
}
