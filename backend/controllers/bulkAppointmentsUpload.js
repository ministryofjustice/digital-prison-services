const bulkAppointmentsUploadFactory = (csvParserService, offenderLoader, logError) => {
  const csvBulkOffenderUpload = async (req, res) => {
    try {
      if (!req.session.data) {
        res.render('error.njk', {
          url: '/bulk-appointments/add-appointment-details',
        })
        return
      }

      res.render('uploadOffenders.njk', {
        title: 'Upload a CSV File',
        errors: req.flash('errors'),
        appointmentDetails: req.session.data,
      })
    } catch (error) {
      logError(req.originalUrl, error, 'Sorry, the service is unavailable')
      res.render('error.njk', {
        url: '/bulk-appointments/add-appointment-details',
      })
    }
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

  const postAndParseCsvOffenderList = async (req, res) => {
    const { file } = req.files
    const { activeCaseLoadId } = req.session.userDetails

    csvParserService
      .loadAndParseCsvFile(file)
      .then(async fileContent => {
        const prisonersDetails = await offenderLoader.loadFromCsvContent(res.locals, fileContent, activeCaseLoadId)

        const removeDuplicates = array => [...new Set(array)]
        const offendersFromCsv = removeDuplicates(fileContent.map(row => row[0]))

        const prisonerList = prisonersDetails.map(prisoner => ({
          bookingId: prisoner.bookingNo,
          offenderNo: prisoner.offenderNo,
          firstName: prisoner.firstName,
          lastName: prisoner.lastName,
        }))

        const offenderNosNotFound = getNonExistingOffenderNumbers(offendersFromCsv, prisonerList)

        if (offenderNosNotFound.length === fileContent.length) {
          throw new Error('Select a file with prison numbers in the correct format - for example, A1234BC')
        }

        if (prisonerList && prisonerList.length) {
          // eslint-disable-next-line no-param-reassign
          req.session.data.prisonersListed = prisonerList
        }

        if (offenderNosNotFound && offenderNosNotFound.length) {
          // eslint-disable-next-line no-param-reassign
          req.session.data.prisonersNotFound = offenderNosNotFound
        }

        return res.redirect('/bulk-appointments/confirm-appointments')
      })
      .catch(error => {
        req.flash('errors', { text: error.message, href: '#file' })
        return res.redirect('back')
      })
  }

  return {
    csvBulkOffenderUpload,
    postAndParseCsvOffenderList,
  }
}

module.exports = { bulkAppointmentsUploadFactory }
