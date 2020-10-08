import { makeError } from './helpers'

const amendCaseNoteController = require('../controllers/amendmentCaseNote')

describe('Amendment case note', () => {
  const caseNotesApi = {}
  const elite2Api = {}

  let controller
  const req = {
    originalUrl: 'http://localhost:3002/prisoner/case-notes/amend-case-note/1',
  }
  const res = {
    locals: {},
  }

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
    elite2Api.getDetails = jest.fn().mockResolvedValue({
      firstName: 'BOB',
      lastName: 'SMITH',
    })

    controller = amendCaseNoteController({ caseNotesApi, elite2Api, logError: jest.fn() })

    res.render = jest.fn()
    res.redirect = jest.fn()
    req.flash = jest.fn()
    req.session = { userDetails: { staffId: 1 } }
    req.headers = {}

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
      elite2Api.getDetails.mockRejectedValue(new Error('error'))
      await controller.index(req, res)

      expect(res.render).toHaveBeenCalledWith('error.njk', { url: '/prisoner/A12345/case-notes' })
    })

    it('should make a request for an offenders case note', async () => {
      await controller.index(req, res)

      expect(caseNotesApi.getCaseNote).toHaveBeenCalledWith({}, 'A12345', 1)
    })

    it('should make a call to retrieve an prisoners name', async () => {
      await controller.index(req, res)

      expect(elite2Api.getDetails).toHaveBeenCalledWith({}, 'A12345')
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
        postAmendmentUrl: 'http://localhost:3002/prisoner/case-notes/amend-case-note/1',
        prisonerName: 'Bob Smith',
        amendments: [{ text: 'This is an amendment' }, { text: 'This is an amendment' }],
      })
    })
  })

  describe('Post', () => {
    beforeEach(() => {
      req.params = {
        offenderNo: 'A12345',
        caseNoteId: 1,
      }

      req.body = {
        moreDetail: 'Hello, world',
      }

      caseNotesApi.getCaseNote = jest.fn().mockResolvedValue({ text: '' })
    })

    it('should render error page on exception', async () => {
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

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })

    it('should validate the length of the amendment', async () => {
      req.body.moreDetail = [...Array(4001).keys()].map(_ => 'A').join('')

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details using 4,000 characters or less' },
      ])

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })

    it('should redirect back to case notes on save', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/prisoner/A12345/case-notes')
    })

    it('should show validation message when the api returns a 400', async () => {
      caseNotesApi.amendCaseNote.mockRejectedValue(makeError('response', { status: 400 }))

      await controller.post(req, res)

      expect(req.flash).toHaveBeenCalledWith('amendmentErrors', [
        { href: '#moreDetail', text: 'Enter more details using 4,000 characters or less' },
      ])

      expect(res.redirect).toHaveBeenCalledWith('http://localhost:3002/prisoner/case-notes/amend-case-note/1')
    })
  })
})
