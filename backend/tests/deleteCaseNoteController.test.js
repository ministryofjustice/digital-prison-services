const deleteCaseNoteController = require('../controllers/deleteCaseNote')

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

  beforeEach(() => {
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
    caseNotesApi.deleteCaseNote = jest.fn()
    caseNotesApi.deleteCaseNoteAmendment = jest.fn()
    prisonApi.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BOB',
      lastName: 'SMITH',
    })
    oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'DELETE_SENSITIVE_CASE_NOTES' }])

    controller = deleteCaseNoteController({ caseNotesApi, prisonApi, logError: jest.fn(), oauthApi })

    res.render = jest.fn()
    res.redirect = jest.fn()
    req.flash = jest.fn()
    req.headers = {}
    res.status = jest.fn()
    res.locals = {}

    req.params = {
      offenderNo: 'A12345',
      caseNoteId: 1,
    }
  })

  describe('index', () => {
    it('should redirect user to the page not found page if the user does not have the delete casenotes role', async () => {
      oauthApi.userRoles = jest.fn().mockResolvedValue([{ roleCode: 'ANOTHER_ROLE' }])

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

      expect(res.render).toHaveBeenCalledWith('notFound.njk', { url: '/prisoner/A12345/case-notes' })
    })
    it('should render error page on exception', async () => {
      const error = new Error('error')
      prisonApi.getDetails.mockRejectedValue(error)

      await expect(controller.index(req, res)).rejects.toThrowError(error)
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
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
          caseNoteAmendmentId: 234,
        }
      })

      it('should return case note amendment details', async () => {
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
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
        }
      })

      it('should render error page on exception', async () => {
        const error = new Error('error')
        caseNotesApi.deleteCaseNote.mockRejectedValue(error)

        await expect(controller.post(req, res)).rejects.toThrowError(error)
        expect(res.locals.redirectUrl).toBe('/prisoner/A12345/case-notes')
      })

      it('should delete the case note', async () => {
        await controller.post(req, res)

        expect(caseNotesApi.deleteCaseNote).toHaveBeenCalledWith({}, 'A12345', 1)
      })

      it('should redirect back to case notes on deletion', async () => {
        await controller.post(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes')
      })
    })

    describe('deleting casenote amendment', () => {
      beforeEach(() => {
        req.params = {
          offenderNo: 'A12345',
          caseNoteId: 1,
          caseNoteAmendmentId: 2345,
        }
      })

      it('should delete the case note amendment', async () => {
        await controller.post(req, res)

        expect(caseNotesApi.deleteCaseNoteAmendment).toHaveBeenCalledWith({}, 'A12345', 2345)
      })
    })
  })
})
