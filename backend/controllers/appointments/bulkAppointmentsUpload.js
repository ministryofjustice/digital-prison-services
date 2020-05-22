const moment = require('moment')
const { DAY_MONTH_YEAR, DATE_TIME_FORMAT_SPEC } = require('../../../src/dateHelpers')

const bulkAppointmentsUploadFactory = (csvParserService, offenderLoader, elite2api, logError) => {
  const renderError = (req, res, error) => {
    if (error) logError(req.originalUrl, error, 'Sorry, the service is unavailable')

    return res.render('error.njk', { url: '/bulk-appointments/need-to-upload-file' })
  }

  const index = async (req, res) => {
    const { data } = req.session

    if (!req.session.data) {
      return res.redirect('/bulk-appointments/add-appointment-details')
    }

    const appointmentDetails = {
      ...data,
      date: moment(data.date, DAY_MONTH_YEAR).format(DATE_TIME_FORMAT_SPEC),
    }

    return res.render('uploadOffenders.njk', {
      errors: req.flash('errors'),
      appointmentDetails,
    })
  }

  const getNonExistingOffenderNumbers = (uploadedList, prisonersList) => {
    const matchingPrisonerNumbers = []
    uploadedList.forEach(uploadedOffenderNo =>
      prisonersList.forEach(prisoner => {
        if (uploadedOffenderNo === prisoner.offenderNo) {
          matchingPrisonerNumbers.push(uploadedOffenderNo)
        }
      })
    )

    return uploadedList.filter(x => matchingPrisonerNumbers.indexOf(x) < 0)
  }

  const post = async (req, res) => {
    const { file } = req.files
    const { activeCaseLoadId } = req.session.userDetails

    try {
      return csvParserService
        .loadAndParseCsvFile(file)
        .then(async fileContent => {
          const fileContentWithNoHeader = fileContent[0][0] === 'Prison number' ? fileContent.slice(1) : fileContent
          const prisonersDetails = await offenderLoader.loadFromCsvContent(
            res.locals,
            fileContentWithNoHeader,
            activeCaseLoadId
          )

          const [duplicatedPrisoners, nonDuplicatedPrisoners] = fileContentWithNoHeader.reduce(
            (separatedList, offender) => {
              const [offenderNumber] = offender
              separatedList[separatedList[1].includes(offenderNumber) ? 0 : 1].push(offenderNumber)
              return separatedList
            },
            [[], []]
          )

          const prisonerList = await Promise.all(
            prisonersDetails.map(async prisoner => {
              const location = await elite2api.getLocation(res.locals, prisoner.assignedLivingUnitId)
              return {
                bookingId: prisoner.bookingId,
                offenderNo: prisoner.offenderNo,
                firstName: prisoner.firstName,
                lastName: prisoner.lastName,
                cellNo: location.description,
              }
            })
          )

          const offenderNosNotFound = getNonExistingOffenderNumbers(nonDuplicatedPrisoners, prisonerList)

          if (offenderNosNotFound.length === fileContentWithNoHeader.length) {
            return res.redirect('/bulk-appointments/no-appointments-added?reason=offendersNotFound')
          }

          req.session.data = {
            ...req.session.data,
            prisonersListed: prisonerList,
            prisonersNotFound: offenderNosNotFound,
            prisonersDuplicated: [...new Set(duplicatedPrisoners)],
          }

          if (offenderNosNotFound.length > 0 || duplicatedPrisoners.length > 0) {
            return res.redirect('/bulk-appointments/invalid-numbers')
          }

          return res.redirect('/bulk-appointments/confirm-appointments')
        })
        .catch(error => {
          req.flash('errors', { text: error.message, href: '#file' })
          return res.redirect('back')
        })
    } catch (error) {
      return renderError(req, res, error)
    }
  }

  return {
    index,
    post,
  }
}

module.exports = { bulkAppointmentsUploadFactory }
