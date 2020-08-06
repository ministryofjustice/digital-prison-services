const moment = require('moment')
const nunjucks = require('nunjucks')
const { properCaseName } = require('../utils')
const { logError } = require('../logError')
const { serviceUnavailableMessage } = require('../common-messages')

const getOffenderUrl = offenderNo => `/prisoner/${offenderNo}`

const caseNoteFactory = (elite2Api, caseNotesApi) => {
  const displayCreateCaseNotePage = async (req, res) => {
    const { offenderNo } = req.params
    const { type, subType } = req.query || {}
    try {
      const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

      const caseNoteTypes = await caseNotesApi.myCaseNoteTypes(res.locals)

      const types = caseNoteTypes.filter(caseNoteType => caseNoteType.activeFlag === 'Y').map(caseNoteType => ({
        value: caseNoteType.code,
        text: caseNoteType.description,
      }))

      const subTypes = caseNoteTypes
        .filter(caseNoteType => caseNoteType.activeFlag === 'Y')
        .map(caseNoteType =>
          caseNoteType.subCodes.filter(sub => sub.activeFlag === 'Y').map(subCode => ({
            type: caseNoteType.code,
            value: subCode.code,
            text: subCode.description,
          }))
        )
        .reduce((result, subCodes) => result.concat(subCodes), [])

      if (req.xhr) {
        const { typeCode } = req.query
        const filteredSubTypes = subTypes.filter(st => st.type === typeCode)
        return res.send(nunjucks.render('caseNotes/partials/subTypesSelect.njk', { subTypes: filteredSubTypes }))
      }

      const offenderDetails = {
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      }

      const currentDateTime = moment()

      return res.render('caseNotes/addCaseNoteForm.njk', {
        offenderDetails,
        offenderNo,
        formValues: {
          type,
          subType,
          ...req.body,
          date: currentDateTime.format('DD/MM/YYYY'),
          hours: currentDateTime.format('H'),
          minutes: currentDateTime.format('mm'),
        },
        types,
        subTypes,
        homeUrl: `${getOffenderUrl(offenderNo)}/case-notes`,
        caseNotesRootUrl: `/prisoner/${offenderNo}/add-case-note`,
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${getOffenderUrl(offenderNo)}/case-notes` })
    }
  }

  const handleCreateCaseNoteForm = async (req, res) => {
    const { offenderNo } = req.params
    const { type, subType, text, date, hours, minutes } = req.body
    const errors = []

    if (!type) {
      errors.push({
        text: 'Select the case note type',
        href: '#type',
      })
    }

    if (!subType) {
      errors.push({
        text: 'Select the case note sub-type',
        href: '#sub-type',
      })
    }

    if (text && text.length > 4000) {
      errors.push({
        text: 'Enter what happened using 4,000 characters or less',
        href: '#text',
      })
    }

    if (!text) {
      errors.push({
        text: 'Enter what happened',
        href: '#text',
      })
    }

    if (!date) {
      errors.push({
        text: 'Select the date when this happened',
        href: '#date',
      })
    }

    if (date && !moment(date, 'DD/MM/YYYY').isValid()) {
      errors.push({
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#date',
      })
    }

    if (date && moment(date, 'DD/MM/YYYY') > moment()) {
      errors.push({
        text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
        href: '#date',
      })
    }

    // eslint-disable-next-line no-restricted-globals
    if (hours && isNaN(parseInt(hours, 10))) {
      errors.push({
        text: 'Enter a time using numbers only',
        href: '#hours',
      })
    }

    // eslint-disable-next-line no-restricted-globals
    if (minutes && isNaN(parseInt(minutes, 10))) {
      errors.push({
        text: 'Enter a time using numbers only',
        href: '#minutes',
      })
    }

    if ((hours && parseInt(hours, 10) > 23) || !hours) {
      errors.push({
        text: 'Enter an hour which is 23 or less',
        href: '#hours',
      })
    }

    if ((minutes && parseInt(minutes, 10) > 59) || !minutes) {
      errors.push({
        text: 'Enter the minutes using 59 or less',
        href: '#minutes',
      })
    }

    if (minutes && minutes.length !== 2) {
      errors.push({
        text: 'Enter the minutes using 2 numbers',
        href: '#minutes',
      })
    }

    try {
      const dateTime =
        date &&
        hours &&
        minutes &&
        moment(date, 'DD/MM/YYYY')
          .hours(hours)
          .minutes(minutes)
          .seconds(0)
          .format('YYYY-MM-DDTHH:mm:ss')

      if (dateTime && dateTime > moment().format('YYYY-MM-DDTHH:mm:ss')) {
        errors.push({
          text: 'Enter a time which is not in the future',
          href: '#hours',
        })
      }
    } catch {
      // Do nothing, will only fail if the date inputs are invalid, which
      // has been handled by the above validations
    }

    if (errors.length > 0) {
      const { firstName, lastName } = await elite2Api.getDetails(res.locals, offenderNo)

      const caseNoteTypes = await caseNotesApi.myCaseNoteTypes(res.locals)

      const types = caseNoteTypes.map(caseNoteType => ({
        value: caseNoteType.code,
        text: caseNoteType.description,
      }))

      const subTypes = caseNoteTypes
        .map(caseNoteType =>
          caseNoteType.subCodes.map(subCode => ({
            type: caseNoteType.code,
            value: subCode.code,
            text: subCode.description,
          }))
        )
        .reduce((result, subCodes) => result.concat(subCodes), [])
        .filter(sub => (type === undefined ? true : sub.type === type))

      if (req.xhr) {
        const { typeCode } = req.query
        const filteredSubTypes = subTypes.filter(st => st.type === typeCode)
        return res.send(nunjucks.render('caseNotes/partials/subTypesSelect.njk', { subTypes: filteredSubTypes }))
      }

      const offenderDetails = {
        offenderNo,
        profileUrl: getOffenderUrl(offenderNo),
        name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
      }
      return res.render('caseNotes/addCaseNoteForm.njk', {
        errors,
        offenderNo,
        formValues: { ...req.body },
        offenderDetails,
        types,
        subTypes,
        homeUrl: `${getOffenderUrl(offenderNo)}/case-notes`,
        alertsRootUrl: `/prisoner/${offenderNo}/add-case-note`,
      })
    }

    try {
      await caseNotesApi.addCaseNote(res.locals, offenderNo, {
        type,
        subType,
        text,
        occurrenceDateTime: moment(date, 'DD/MM/YYYY')
          .hours(hours)
          .minutes(minutes)
          .seconds(0)
          .format('YYYY-MM-DDTHH:mm:ss'),
      })
    } catch (error) {
      logError(req.originalUrl, error, serviceUnavailableMessage)
      return res.render('error.njk', { url: `${getOffenderUrl(offenderNo)}/add-case-note` })
    }

    return res.redirect(`${getOffenderUrl(offenderNo)}/case-notes`)
  }

  return { displayCreateCaseNotePage, handleCreateCaseNoteForm }
}

module.exports = { caseNoteFactory }
