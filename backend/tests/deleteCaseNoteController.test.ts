import deleteCaseNoteController from '../controllers/deleteCaseNote'

describe('Delete case note', () => {
  const caseNotesApi = {}
  const prisonApi = {}
  const oauthApi = {}

  let controller
  const req = {
    originalUrl: 'http://localhost:3002/prisoner/case-notes/delete-case-note/1',
  }
  const res = {
    locals: {},
  }
  const systemOauthClient = { getClientCredentialsTokens: () => ({ access_token: 'CLIENT_TOKEN' }) }

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
      authorName: 'Tim Sphere',
      caseNoteId: 1,
      offenderIdentifier: 'A12345',
      type: 'KA',
      typeDescription: 'Key Worker',
      subType: 'KS',
      subTypeDescription: 'Key Worker Session',
      source: 'OCNS',
      text: 'This is some text',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteCaseNote' does not exist on type '... Remove this comment to see the full error message
    caseNotesApi.deleteCaseNote = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteCaseNoteAmendment' does not exist ... Remove this comment to see the full error message
    caseNotesApi.deleteCaseNoteAmendment = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BOB',
      lastName: 'SMITH',
    })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
    oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }])

    // @ts-expect-error ts-migrate(2345) FIXME: Argument of type '{ caseNotesApi: {}; prisonApi: {... Remove this comment to see the full error message
    controller = deleteCaseNoteController({ caseNotesApi, prisonApi, logError: jest.fn(), oauthApi, systemOauthClient })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
    res.redirect = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ origina... Remove this comment to see the full error message
    req.flash = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'headers' does not exist on type '{ origi... Remove this comment to see the full error message
    req.headers = {}
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'status' does not exist on type '{ locals... Remove this comment to see the full error message
    res.status = jest.fn()
    res.locals = {}

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
    req.params = {
      offenderNo: 'A12345',
      caseNoteId: 1,
    }
  })

  describe('index', () => {
    it('should redirect user to the page not found page if the user does not have the delete casenotes role', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'userRoles' does not exist on type '{}'.
      oauthApi.userRoles = jest.fn().mockReturnValue([{ roleCode: 'ANOTHER_ROLE' }])

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
        authorUserId: '12345',
        caseNoteId: 1,
        offenderIdentifier: 'A12345',
        type: 'KA',
        typeDescription: 'Key Worker',
        subType: 'KS',
        subTypeDescription: 'Key Worker Session',
        source: 'OCNS',
        text: 'This is some text',
      })

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner/A12345/case-notes' })
    })
    it('should render error page on exception', async () => {
      const error = new Error('error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      prisonApi.getDetails.mockRejectedValue(error)

      await expect(controller.index(req, res)).rejects.toThrowError(error)
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
      expect(res.locals.redirectUrl).toBe('/prisoner/A12345/case-notes')
    })

    it('should make a request for an offenders case note', async () => {
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      expect(caseNotesApi.getCaseNote).toHaveBeenCalledWith(
        { access_token: 'CLIENT_TOKEN', userRoles: [{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }] },
        'A12345',
        1
      )
    })

    it('should make a call to retrieve an prisoners name', async () => {
      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
      expect(prisonApi.getDetails).toHaveBeenCalledWith(
        { userRoles: [{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }] },
        'A12345'
      )
    })

    it('should return case note details', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
        caseNoteId: 1,
        authorName: 'Tim Sphere',
        creationDateTime: Date.UTC(2020, 11, 2),
        offenderIdentifier: 'A12345',
        type: 'KA',
        typeDescription: 'Key Worker',
        subType: 'KS',
        subTypeDescription: 'Key Worker Session',
        source: 'OCNS',
        text: 'This is some text',
        amendments: [
          {
            additionalNoteText: 'This is an amendment',
            authorName: 'Tim Sphere',
            creationDateTime: Date.UTC(2020, 11, 2),
          },
          {
            additionalNoteText: 'This is an amendment',
            authorName: 'Jane Cube',
            creationDateTime: Date.UTC(2020, 11, 2),
          },
        ],
      })

      await controller.index(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith('caseNoteDeleteConfirm.njk', {
        authorName: 'Tim Sphere',
        date: Date.UTC(2020, 11, 2),
        prisonerNameForBreadcrumb: 'Smith, Bob',
        backToCaseNotes: '/prisoner/A12345/case-notes',
        caseNoteId: 1,
        prisonNumber: 'A12345',
        typeSubType: 'Key worker: Key worker session',
        text: 'This is some text',
        prisonerName: 'Bob Smith',
        amendments: [
          {
            text: 'This is an amendment',
            authorName: 'Tim Sphere',
            date: Date.UTC(2020, 11, 2),
          },
          {
            text: 'This is an amendment',
            authorName: 'Jane Cube',
            date: Date.UTC(2020, 11, 2),
          },
        ],
      })
    })

    describe('deleting casenote amendment', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
          caseNoteAmendmentId: 234,
        }
      })

      it('should return case note amendment details', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'getCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
        caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({
          caseNoteId: 1,
          authorName: 'Tim Sphere',
          creationDateTime: Date.UTC(2020, 11, 2),
          offenderIdentifier: 'A12345',
          type: 'KA',
          typeDescription: 'Key Worker',
          subType: 'KS',
          subTypeDescription: 'Key Worker Session',
          source: 'OCNS',
          text: 'This is some text',
          amendments: [
            {
              caseNoteAmendmentId: 234,
              additionalNoteText: 'This is an incorrect amendment',
              authorName: 'Graham Cone',
              creationDateTime: Date.UTC(2020, 11, 5),
            },
            {
              caseNoteAmendmentId: 567,
              additionalNoteText: 'This is an amendment',
              authorName: 'Jane Cube',
              creationDateTime: Date.UTC(2020, 11, 2),
            },
          ],
        })

        await controller.index(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith('caseNoteDeleteConfirm.njk', {
          authorName: 'Graham Cone',
          date: Date.UTC(2020, 11, 5),
          prisonerNameForBreadcrumb: 'Smith, Bob',
          backToCaseNotes: '/prisoner/A12345/case-notes',
          caseNoteId: 1,
          caseNoteAmendmentId: 234,
          prisonNumber: 'A12345',
          typeSubType: 'Key worker: Key worker session',
          text: 'This is an incorrect amendment',
          prisonerName: 'Bob Smith',
        })
      })
    })
  })

  describe('Post', () => {
    describe('deleting casenote', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
        }
      })

      it('should render error page on exception', async () => {
        const error = new Error('error')
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteCaseNote' does not exist on type '... Remove this comment to see the full error message
        caseNotesApi.deleteCaseNote.mockRejectedValue(error)

        await expect(controller.post(req, res)).rejects.toThrowError(error)
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
        expect(res.locals.redirectUrl).toBe('/prisoner/A12345/case-notes')
      })

      it('should delete the case note', async () => {
        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteCaseNote' does not exist on type '... Remove this comment to see the full error message
        expect(caseNotesApi.deleteCaseNote).toHaveBeenCalledWith(
          { access_token: 'CLIENT_TOKEN', userRoles: [{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }] },
          'A12345',
          1
        )
      })

      it('should redirect back to case notes on deletion', async () => {
        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirect' does not exist on type '{ loca... Remove this comment to see the full error message
        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes')
      })
    })

    describe('deleting casenote amendment', () => {
      beforeEach(() => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'params' does not exist on type '{ origin... Remove this comment to see the full error message
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
          caseNoteAmendmentId: 2345,
        }
      })

      it('should delete the case note amendment', async () => {
        await controller.post(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteCaseNoteAmendment' does not exist ... Remove this comment to see the full error message
        expect(caseNotesApi.deleteCaseNoteAmendment).toHaveBeenCalledWith(
          { access_token: 'CLIENT_TOKEN', userRoles: [{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }] },
          'A12345',
          2345
        )
      })
    })
  })
})
