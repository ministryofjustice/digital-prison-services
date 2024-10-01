import { makeError } from './helpers'

import amendCaseNoteController from '../controllers/amendmentCaseNote'

describe('Amendment case note', () => {
  const caseNotesApi = { amendCaseNote: {}, getCaseNote: {} }
  const prisonApi = { getDetails: {} }
  const oauthApi = {
    userRoles: jest.fn(),
  }

  let controller
  const req = {
    flash: {},
    headers: {},
    session: {},
    body: {},
    originalUrl: '/prisoner/A12345/case-notes/amend-case-note/1',
  }
  const res = { render: {}, redirect: {}, locals: {} }

  beforeEach(() => {
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
    caseNotesApi.amendCaseNote = jest.fn()
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BOB',
      lastName: 'SMITH',
    })

    controller = amendCaseNoteController({ caseNotesApi, prisonApi, oauthApi, logError: jest.fn() })

    res.render = jest.fn()
    res.redirect = jest.fn()
    res.locals = {}
    req.flash = jest.fn()
    req.session = { userDetails: { staffId: 1 } }
    req.headers = {}

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
    req.params = {
      offenderNo: 'A12345',
      caseNoteId: 1,
    }
  })

  describe('index', () => {
    it('should redirect user to the page not found page when accessing a case note that they did not author', async () => {
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
      req.session = {
        userDetails: {
          staffId: 1,
        },
      }

      await controller.index(req, res)

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

      expect(caseNotesApi.getCaseNote).toHaveBeenCalledWith({}, 'A12345', 1)
    })

    it('should make a call to retrieve an prisoners name', async () => {
      await controller.index(req, res)

      expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
    })

    it('should return case note details', async () => {
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

      expect(res.render).toHaveBeenCalledWith('amendCaseNote.njk', {
        errors: undefined,
        formValues: undefined,
        prisonerNameForBreadcrumb: 'Smith, Bob',
        backToCaseNotes: '/prisoner/A12345/case-notes',
        caseNoteId: 1,
        prisonNumber: 'A12345',
        typeSubType: 'Key worker: Key worker session',
        caseNoteText: 'This is some text',
        postAmendmentUrl: '/prisoner/A12345/case-notes/amend-case-note/1',
        prisonerName: 'Bob Smith',
        amendments: [{ text: 'This is an amendment' }, { text: 'This is an amendment' }],
        isOmicOpenCaseNote: false,
      })
    })

    it('should return case note details for omic open case note', async () => {
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

      expect(res.render).toHaveBeenCalledWith('amendCaseNote.njk', {
        errors: undefined,
        formValues: undefined,
        prisonerNameForBreadcrumb: 'Smith, Bob',
        backToCaseNotes: '/prisoner/A12345/case-notes',
        caseNoteId: 1,
        prisonNumber: 'A12345',
        typeSubType: 'Omic: Open case note',
        caseNoteText: 'This is some text',
        postAmendmentUrl: '/prisoner/A12345/case-notes/amend-case-note/1',
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

      req.body = { moreDetail: 'Hello, world', isOmicOpenCaseNote: undefined }

      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({ text: '' })
    })

    it('should render error page on exception', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'amendCaseNote' does not exist on type '{... Remove this comment to see the full error message
      caseNotesApi.amendCaseNote.mockRejectedValue(new Error('error'))
      await controller.post(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/A12345/case-notes' })
    })

    it('should make an amendment', async () => {
      await controller.post(req, res)

      expect(caseNotesApi.amendCaseNote).toHaveBeenCalledWith({}, 'A12345', 1, { text: 'Hello, world' })
    })

    it('should validate the presence of an amendment', async () => {
      req.body = {}

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details to case note' },
      ])

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes/amend-case-note/1')
    })

    it('should validate the length of the amendment', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ original... Remove this comment to see the full error message
      req.body.moreDetail = [...Array(4001).keys()].map((_) => 'A').join('')

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details using 4,000 characters or less' },
      ])

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes/amend-case-note/1')
    })

    it('should redirect back to case notes on save', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes')
    })

    it('should take user to confirm page if omic open case note', async () => {
      req.body = { moreDetail: 'some comment', isOmicOpenCaseNote: 'true' }
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes/amend-case-note/1/confirm')
      expect(req.session).toEqual({
        draftCaseNoteDetail: { moreDetail: 'some comment' },
        userDetails: { staffId: 1 },
      })
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

      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        {
          href: '#moreDetail',
          text: 'Amendments can no longer be made due to the maximum character limit being reached',
        },
      ])

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes/amend-case-note/1')
    })
  })

  describe('areYouSure()', () => {
    it('should render the confirm page', async () => {
      await controller.areYouSure(req, res)

      expect(res.render).toBeCalledWith('caseNotes/addCaseNoteConfirm.njk', {
        offenderDetails: {
          name: 'Smith, Bob',
          profileUrl: '/prisoner/A12345',
        },
        offenderNo: 'A12345',
        homeUrl: '/prisoner/A12345/case-notes',
        breadcrumbText: 'Add more details to case note',
      })
    })
  })

  describe('confirm()', () => {
    it('should save the case note if confirmed', async () => {
      req.session = { draftCaseNoteDetail: { moreDetail: 'hello' } }
      req.body = { confirmed: 'Yes' }

      await controller.confirm(req, res)

      expect(caseNotesApi.amendCaseNote).toBeCalledWith(res.locals, 'A12345', 1, {
        text: 'hello',
      })
      expect(res.redirect).toBeCalledWith('/prisoner/A12345/case-notes')
    })

    it('should redirect if case note save fails', async () => {
      req.session = { draftCaseNoteDetail: { moreDetail: 'hello' } }
      req.body = { confirmed: 'Yes' }
      const error400 = makeError('response', {
        status: 400,
        body: {
          userMessage: 'createCaseNote.caseNote.text: Value is too long: max length is 4000',
          developerMessage: 'createCaseNote.caseNote.text: Value too long: max length is 4000',
        },
      })
      caseNotesApi.amendCaseNote = jest.fn().mockRejectedValue(error400)

      await controller.confirm(req, res)

      expect(caseNotesApi.amendCaseNote).toBeCalledWith(res.locals, 'A12345', 1, {
        text: 'hello',
      })
      expect(req.flash).toHaveBeenNthCalledWith(1, 'amendmentErrors', [
        { href: '#moreDetail', text: (error400 as any).response.body.userMessage },
      ])
      expect(req.flash).toHaveBeenNthCalledWith(2, 'formValues', {
        moreDetail: 'hello',
      })
    })

    it('should redirect if user does not confirm', async () => {
      req.body = { confirmed: 'No' }

      req.session = { draftCaseNoteDetail: { moreDetail: 'hello' }, body: { confirmed: 'No' } }

      await controller.confirm(req, res)

      expect(caseNotesApi.amendCaseNote).not.toHaveBeenCalled()
      expect(req.flash).toHaveBeenNthCalledWith(1, 'formValues', {
        moreDetail: 'hello',
      })
      expect(res.redirect).toBeCalledWith('/prisoner/A12345/case-notes/amend-case-note/1')
    })

    it('should show error if user does not enter a choice', async () => {
      req.body = {}
      req.session = { draftCaseNoteDetail: { moreDetail: 'hello' } }

      await controller.confirm(req, res)

      expect(caseNotesApi.amendCaseNote).not.toHaveBeenCalled()
      expect(req.flash).toBeCalledWith('confirmErrors', [
        { href: '#confirmed', text: 'Select yes if this information is appropriate to share' },
      ])
      expect(res.redirect).toBeCalledWith('/prisoner/A12345/case-notes/amend-case-note/1/confirm')
    })
  })
})
