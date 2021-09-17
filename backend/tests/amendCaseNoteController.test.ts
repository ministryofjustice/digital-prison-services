import { makeError } from './helpers'

import amendCaseNoteController from '../controllers/amendmentCaseNote'

describe('Amendment case note', () => {
  const caseNotesApi = {}
  const prisonApi = {}

  let controller
  const req = {
    originalUrl: 'http://localhost:3002/prisoner/case-notes/amend-case-note/1',
  }
  const res = {}

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
      authorUserId: '1',
      caseNoteId: 1,
      offenderIdentifier: 'A12345',
      type: 'KA',
      typeDescription: 'Key Worker',
      subType: 'KS',
      subTypeDescription: 'Key Worker Session',
      source: 'INST',
      text: 'This is some text',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'amendCaseNote' does not exist on type '{... Remove this comment to see the full error message
    caseNotesApi.amendCaseNote = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BOB',
      lastName: 'SMITH',
    })

    controller = amendCaseNoteController({ caseNotesApi, prisonApi, logError: jest.fn() })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
    res.redirect = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
    res.locals = {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
    req.flash = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type '{ origi... Remove this comment to see the full error message
    req.session = { userDetails: { staffId: 1 } }
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'headers' does not exist on type '{ origi... Remove this comment to see the full error message
    req.headers = {}

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
    req.params = {
      offenderNo: 'A12345',
      caseNoteId: 1,
    }
  })

  describe('index', () => {
    it('should redirect user to the page not found page when accessing a case note that they did not author', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
        authorUserId: '12345',
        caseNoteId: 1,
        offenderIdentifier: 'A12345',
        type: 'KA',
        typeDescription: 'Key Worker',
        subType: 'KS',
        subTypeDescription: 'Key Worker Session',
        source: 'INST',
        text: 'This is some text',
      })
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'session' does not exist on type '{ origi... Remove this comment to see the full error message
      req.session = {
        userDetails: {
          staffId: 1,
        },
      }

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner/A12345/case-notes' })
    })
    it('should render error page on exception', async () => {
      const error = new Error('error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockRejectedValue(error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{}'.
      res.status = jest.fn()

      await expect(controller.index(req, res)).rejects.toThrowError(error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'locals' does not exist on type '{}'.
      expect(res.locals.redirectUrl).toBe('/prisoner/A12345/case-notes')
    })

    it('should make a request for an offenders case note', async () => {
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      expect(caseNotesApi.getCaseNote).toHaveBeenCalledWith({}, 'A12345', 1)
    })

    it('should make a call to retrieve an prisoners name', async () => {
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
    })

    it('should return case note details', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
        caseNoteId: 1,
        authorUserId: '1',
        offenderIdentifier: 'A12345',
        type: 'KA',
        typeDescription: 'Key Worker',
        subType: 'KS',
        subTypeDescription: 'Key Worker Session',
        source: 'INST',
        text: 'This is some text',
        amendments: [
          {
            additionalNoteText: 'This is an amendment',
          },
          {
            additionalNoteText: 'This is an amendment',
          },
        ],
      })

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
      expect(res.render).toHaveBeenCalledWith('amendCaseNote.njk', {
        errors: undefined,
        formValues: undefined,
        prisonerNameForBreadcrumb: 'Smith, Bob',
        backToCaseNotes: '/prisoner/A12345/case-notes',
        caseNoteId: 1,
        prisonNumber: 'A12345',
        typeSubType: 'Key worker: Key worker session',
        caseNoteText: 'This is some text',
        postAmendmentUrl: 'http://localhost:3002/prisoner/case-notes/amend-case-note/1',
        prisonerName: 'Bob Smith',
        amendments: [{ text: 'This is an amendment' }, { text: 'This is an amendment' }],
        isOmicOpenCaseNote: false,
      })
    })

    it('should return case note details for omic open case note', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
        caseNoteId: 1,
        authorUserId: '1',
        offenderIdentifier: 'A12345',
        type: 'OMIC',
        typeDescription: 'OMiC',
        subType: 'OPEN_COMM',
        subTypeDescription: 'Open Case Note',
        source: 'INST',
        text: 'This is some text',
        amendments: [
          {
            additionalNoteText: 'This is an amendment',
          },
          {
            additionalNoteText: 'This is an amendment',
          },
        ],
      })

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
      expect(res.render).toHaveBeenCalledWith('amendCaseNote.njk', {
        errors: undefined,
        formValues: undefined,
        prisonerNameForBreadcrumb: 'Smith, Bob',
        backToCaseNotes: '/prisoner/A12345/case-notes',
        caseNoteId: 1,
        prisonNumber: 'A12345',
        typeSubType: 'Omic: Open case note',
        caseNoteText: 'This is some text',
        postAmendmentUrl: 'http://localhost:3002/prisoner/case-notes/amend-case-note/1',
        prisonerName: 'Bob Smith',
        amendments: [{ text: 'This is an amendment' }, { text: 'This is an amendment' }],
        isOmicOpenCaseNote: true,
      })
    })
  })

  describe('Post', () => {
    beforeEach(() => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
      req.params = {
        offenderNo: 'A12345',
        caseNoteId: 1,
      }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {
        moreDetail: 'Hello, world',
      }

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({ text: '' })
    })

    it('should render error page on exception', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'amendCaseNote' does not exist on type '{... Remove this comment to see the full error message
      caseNotesApi.amendCaseNote.mockRejectedValue(new Error('error'))
      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{}'.
      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/A12345/case-notes' })
    })

    it('should make an amendment', async () => {
      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'amendCaseNote' does not exist on type '{... Remove this comment to see the full error message
      expect(caseNotesApi.amendCaseNote).toHaveBeenCalledWith({}, 'A12345', 1, { text: 'Hello, world' })
    })

    it('should validate the presence of an amendment', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body = {}

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details to case note' },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })

    it('should validate the length of the amendment', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body.moreDetail = [...Array(4001).keys()].map((_) => 'A').join('')

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details using 4,000 characters or less' },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })

    it('should redirect back to case notes on save', async () => {
      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes')
    })

    it('should show validation message when the api returns a 400', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'amendCaseNote' does not exist on type '{... Remove this comment to see the full error message
      caseNotesApi.amendCaseNote.mockRejectedValue(
        makeError('response', {
          status: 400,
          body: {
            userMessage: 'Amendments can no longer be made due to the maximum character limit being reached',
            developerMessage: 'createCaseNote.caseNote.text: Value too long: max length is 4000',
          },
        })
      )

      await controller.post(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        {
          href: '#moreDetail',
          text: 'Amendments can no longer be made due to the maximum character limit being reached',
        },
      ])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{}'.
      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })
  })
})
