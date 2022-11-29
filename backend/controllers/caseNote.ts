import moment from 'moment'
import nunjucks from 'nunjucks'
import { properCaseName } from '../utils'
import getContext from './prisonerProfile/prisonerProfileContext'

const getOffenderUrl = (offenderNo) => `/prisoner/${offenderNo}`

const getContextWithRoles = async (offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi) => {
  const userRoles = oauthApi.userRoles(res.locals)
  res.locals = { ...res.locals, userRoles }
  const { context } = await getContext({
    offenderNo,
    res,
    req,
    oauthApi,
    systemOauthClient,
    restrictedPatientApi,
  })

  return context
}

export const caseNoteFactory = ({ prisonApi, caseNotesApi, oauthApi, systemOauthClient, restrictedPatientApi }) => {
  const getOffenderDetails = async (context, offenderNo) => {
    const { firstName, lastName } = await prisonApi.getDetails(context, offenderNo)

    return {
      offenderNo,
      profileUrl: getOffenderUrl(offenderNo),
      name: `${properCaseName(firstName)} ${properCaseName(lastName)}`,
    }
  }

  const getCaseNoteTypes = async (context, type) => {
    const caseNoteTypes = (await caseNotesApi.myCaseNoteTypes(context)).filter(
      (caseNoteType) => caseNoteType.activeFlag === 'Y'
    )

    const types = caseNoteTypes.map((caseNoteType) => ({
      value: caseNoteType.code,
      text: caseNoteType.description,
    }))

    const subTypes = caseNoteTypes
      .filter((caseNoteType) => caseNoteType.code === type)
      .map((caseNoteType) =>
        caseNoteType.subCodes
          .filter((sub) => sub.activeFlag === 'Y')
          .map((subCode) => ({
            type: caseNoteType.code,
            value: subCode.code,
            text: subCode.description,
          }))
      )
      .reduce((result, subCodes) => result.concat(subCodes), [])
    return { types, subTypes }
  }
  const stashStateAndRedirectToAddCaseNote = (req, res, caseNote, offenderNo, errors) => {
    if (errors.length > 0) req.flash('caseNoteErrors', errors)
    req.flash('caseNote', caseNote)
    return res.redirect(`${getOffenderUrl(offenderNo)}/add-case-note`)
  }

  const getOrConstructFormValues = (req) => {
    const caseNoteFlashed = req.flash('caseNote')
    if (caseNoteFlashed?.length) return caseNoteFlashed[0]

    const { type, subType } = req.query || {}
    const currentDateTime = moment()
    return {
      type,
      subType,
      date: currentDateTime.format('DD/MM/YYYY'),
      hours: currentDateTime.format('H'),
      minutes: currentDateTime.format('mm'),
      text: undefined,
    }
  }

  const chooseBehaviourPrompts = () => {
    return Object.fromEntries(
      Object.entries(behaviourPrompts).map(([type, prompts]) => {
        const index = Math.floor(Math.random() * prompts.length)
        return [type, prompts[index]]
      })
    )
  }

  const index = async (req, res) => {
    const { offenderNo } = req.params
    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)

    try {
      if (req.xhr) {
        const { typeCode } = req.query
        const { subTypes } = await getCaseNoteTypes(context, typeCode)
        return res.send(nunjucks.render('caseNotes/partials/subTypesOptions.njk', { subTypes }))
      }
      const formValues = getOrConstructFormValues(req)
      const { types, subTypes } = await getCaseNoteTypes(context, formValues.type)
      const offenderDetails = await getOffenderDetails(context, offenderNo)

      return res.render('caseNotes/addCaseNoteForm.njk', {
        errors: req.flash('caseNoteErrors'),
        offenderDetails,
        offenderNo,
        formValues,
        types,
        subTypes,
        behaviourPrompts: chooseBehaviourPrompts(),
        homeUrl: `${getOffenderUrl(offenderNo)}/case-notes`,
        caseNotesRootUrl: `/prisoner/${offenderNo}/add-case-note`,
      })
    } catch (error) {
      res.locals.redirectUrl = `${getOffenderUrl(offenderNo)}/case-notes`
      throw error
    }
  }

  const validate = (type, subType, text, date, hours, minutes) => {
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

    if (!text || !text.trim()) {
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
        moment(date, 'DD/MM/YYYY').hours(hours).minutes(minutes).seconds(0).format('YYYY-MM-DDTHH:mm:ss')

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
    return errors
  }

  const post = async (req, res) => {
    const { offenderNo } = req.params
    const { type, subType, text, date, hours, minutes } = req.body
    const errors = validate(type, subType, text, date, hours, minutes)

    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)

    const caseNote = {
      offenderNo,
      type,
      subType,
      text,
      date,
      hours,
      minutes,
    }
    if (errors.length === 0) {
      if (subType === 'OPEN_COMM') {
        req.session.draftCaseNote = caseNote
        return res.redirect(`${getOffenderUrl(offenderNo)}/add-case-note/confirm`)
      }

      try {
        await caseNotesApi.addCaseNote(context, offenderNo, {
          offenderNo,
          type,
          subType,
          text,
          occurrenceDateTime: moment(date, 'DD/MM/YYYY')
            .hours(hours)
            .minutes(minutes)
            .seconds(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
        })
      } catch (err) {
        if (err?.response?.status === 400) {
          errors.push({ text: err.response.body.userMessage, href: '#text' })
        } else throw err
      }
    }

    if (errors.length > 0) return stashStateAndRedirectToAddCaseNote(req, res, caseNote, offenderNo, errors)

    if (type === 'REPORTS' && subType === 'REP_IEP') {
      return res.redirect(`${getOffenderUrl(offenderNo)}/add-case-note/record-incentive-level`)
    }

    return res.redirect(`${getOffenderUrl(offenderNo)}/case-notes`)
  }

  const areYouSure = async (req, res) => {
    const { offenderNo } = req.params
    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)

    const offenderDetails = await getOffenderDetails(context, offenderNo)

    return res.render('caseNotes/addCaseNoteConfirm.njk', {
      errors: req.flash('confirmErrors'),
      offenderNo,
      offenderDetails,
      homeUrl: `${getOffenderUrl(offenderNo)}/case-notes`,
      breadcrumbText: 'Add a case note',
    })
  }

  const confirm = async (req, res) => {
    const { offenderNo } = req.params
    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)

    const { confirmed } = req.body
    if (!confirmed) {
      const errors = [{ href: '#confirmed', text: 'Select yes if this information is appropriate to share' }]
      req.flash('confirmErrors', errors)
      return res.redirect(`${getOffenderUrl(offenderNo)}/add-case-note/confirm`)
    }
    const errors = []
    const caseNote = req.session.draftCaseNote
    delete req.session.draftCaseNote

    if (confirmed === 'Yes') {
      try {
        await caseNotesApi.addCaseNote(context, offenderNo, {
          ...caseNote,
          occurrenceDateTime: moment(caseNote.date, 'DD/MM/YYYY')
            .hours(caseNote.hours)
            .minutes(caseNote.minutes)
            .seconds(0)
            .format('YYYY-MM-DDTHH:mm:ss'),
        })
      } catch (err) {
        if (err?.response?.status === 400) {
          errors.push({ text: err.response.body.userMessage, href: '#text' })
        } else throw err
      }
    }

    if (errors.length > 0 || confirmed !== 'Yes') {
      return stashStateAndRedirectToAddCaseNote(req, res, caseNote, offenderNo, errors)
    }
    return res.redirect(`${getOffenderUrl(offenderNo)}/case-notes`)
  }

  const recordIncentiveLevelInterruption = async (req, res) => {
    const { offenderNo } = req.params
    const context = await getContextWithRoles(offenderNo, res, req, oauthApi, systemOauthClient, restrictedPatientApi)
    const offenderDetails = await getOffenderDetails(context, offenderNo)

    return res.render('caseNotes/recordIncentiveLevelInterruption.njk', {
      title: 'Record incentive level',
      breadcrumbText: 'Record incentive level',
      offenderDetails,
      caseNotesUrl: `${offenderDetails.profileUrl}/case-notes`,
      recordIncentiveLevelUrl: `${offenderDetails.profileUrl}/incentive-level-details/change-incentive-level`,
    })
  }

  return { index, post, areYouSure, confirm, recordIncentiveLevelInterruption }
}

export const behaviourPrompts = {
  pos: [
    {
      summary: 'Why recognise positive behaviour?',
      text: 'Verbal praise delivered promptly is the most effective way of reinforcing good behaviour which can lead to long-term changes.',
      gaId: 'Positive behaviour prompt: Why recognise positive behaviour?',
    },
    {
      summary: 'Noticing improved behaviour',
      text: 'Noticing and praising improved behaviour is the most effective tool we have to influence long-term behaviour changes.',
      gaId: 'Positive behaviour prompt: Noticing improved behaviour',
    },
    {
      summary: 'What is ‘good’ behaviour?',
      text: 'Think about a person’s individual background and needs. For some, getting through the day without incident is an improvement and should be noted.',
      gaId: 'Positive behaviour prompt: What is good behaviour?',
    },
    {
      summary: 'Noticing differences in behaviour',
      text: 'Progress means different things for different people. A positive entry could be for an improvement to usual patterns of behaviour.',
      gaId: 'Positive behaviour prompt: Noticing differences in behaviour',
    },
    {
      summary: 'Positive case entries and young adults',
      text: 'Evidence suggests noticing and praising something a prisoner does well is much more likely to lead to long-term changes than only noticing poor behaviour, particularly in younger or less mature prisoners.',
      gaId: 'Positive behaviour prompt: Positive case entries and young adults',
    },
  ],
  neg: [
    {
      summary: 'Creating long-term change',
      text: 'Evidence suggests noticing and praising something a prisoner does well is much more likely to lead to long-term changes than only noticing poor behaviour.',
      gaId: 'Negative behaviour prompt: Creating long-term change',
    },
    {
      summary: 'Cooling down a situation',
      text: 'Is there opportunity to let the situation cool down? Maybe it’s having a private chat, asking another officer for support, or allowing for some cool-down time.',
      gaId: 'Negative behaviour prompt: Cooling down a situation',
    },
    {
      summary: 'Reasons for negative behaviour',
      text: 'What’s causing this negative behaviour? It’s not always possible, but finding out any background could help decide if a behaviour entry is the best action.',
      gaId: 'Negative behaviour prompt: Reasons for negative behaviour',
    },
    {
      summary: 'What happens next?',
      text: 'Things that might help after making an entry include: asking about circumstances around the behaviour, listening, and then agreeing what could improve next time.',
      gaId: 'Negative behaviour prompt: What happens next?',
    },
    {
      summary: 'Talking about what happened',
      text: 'Is there a chance for you or the person’s key worker to talk about what happened? You might be able to agree how to handle things better next time.',
      gaId: 'Negative behaviour prompt: Talking about what happened',
    },
  ],
}

export default { caseNoteFactory }
