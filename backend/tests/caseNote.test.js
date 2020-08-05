Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')
const moment = require('moment')

const elite2api = {}
const caseNotesApi = {}
const { logError } = require('../logError')
const { displayCreateCaseNotePage, handleCreateCaseNoteForm } = require('../controllers/caseNote').caseNoteFactory(
  elite2api,
  caseNotesApi
)

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('case note management', () => {
  let mockReq
  let res

  const mockCreateReq = {
    flash: jest.fn().mockReturnValue([]),
    originalUrl: '/add-case-note/',
    get: jest.fn(),
    body: {},
  }
  const getDetailsResponse = {
    bookingId: 1234,
    firstName: 'Test',
    lastName: 'User',
  }

  const caseNoteTypes = [
    {
      code: 'OBSERVE',
      description: 'Observations',
      activeFlag: 'Y',
      source: 'OCNS',
      subCodes: [
        {
          type: 'OBSERVE',
          code: 'OBS1',
          description: 'Observation 1',
          activeFlag: 'Y',
        },
      ],
    },
    {
      code: 'ACHIEVEMENTS',
      description: 'Achievements',
      activeFlag: 'Y',
      subCodes: [
        {
          type: 'ACHIEVEMENTS',
          code: 'ACH1',
          description: 'Achievement 1',
          activeFlag: 'Y',
        },
      ],
    },
  ]
  const offenderNo = 'ABC123'

  beforeEach(() => {
    res = { render: jest.fn(), redirect: jest.fn(), locals: {} }
    mockReq = { flash: jest.fn().mockReturnValue([]), originalUrl: '/add-case-note/', get: jest.fn(), body: {} }
    elite2api.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
    caseNotesApi.myCaseNoteTypes = jest.fn().mockReturnValue(caseNoteTypes)
    caseNotesApi.addCaseNote = jest.fn()
  })

  afterEach(() => {
    elite2api.getDetails.mockRestore()
    caseNotesApi.myCaseNoteTypes.mockRestore()
    caseNotesApi.addCaseNote.mockRestore()
    mockReq.flash.mockRestore()
  })

  describe('displayCreateCaseNotePage()', () => {
    it('should remove the leading zeros from the prepopulated minutes', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1595606800000) // Friday, 24 July 2020 16:06:00

      const req = { ...mockCreateReq, params: { offenderNo } }

      await displayCreateCaseNotePage(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '24/07/2020',
            hours: '16',
            minutes: '06',
          },
        })
      )

      Date.now.mockRestore()
    })
    it('should return an error when there is a problem loading the form', async () => {
      caseNotesApi.myCaseNoteTypes = jest.fn().mockImplementationOnce(() => {
        throw new Error('There has been an error')
      })

      const req = { ...mockCreateReq, params: { offenderNo } }

      await displayCreateCaseNotePage(req, res)

      expect(res.render).toBeCalledWith('error.njk', { url: '/prisoner/ABC123/case-notes' })
      expect(logError).toBeCalledWith(
        '/add-case-note/',
        new Error('There has been an error'),
        'Sorry, the service is unavailable'
      )
    })

    it('should render the add case note with the correctly formatted information', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1595607300000) // Friday, 24 July 2020 17:15:00

      const req = { ...mockCreateReq, params: { offenderNo } }

      await displayCreateCaseNotePage(req, res)

      expect(res.render).toBeCalledWith('caseNotes/addCaseNoteForm.njk', {
        offenderDetails: {
          name: 'Test User',
          offenderNo: 'ABC123',
          profileUrl: '/prisoner/ABC123',
        },
        offenderNo,
        homeUrl: '/prisoner/ABC123/case-notes',
        caseNotesRootUrl: '/prisoner/ABC123/add-case-note',
        formValues: {
          date: '24/07/2020',
          hours: '16',
          minutes: '15',
        },
        types: [{ value: 'OBSERVE', text: 'Observations' }, { value: 'ACHIEVEMENTS', text: 'Achievements' }],
        subTypes: [
          { value: 'OBS1', text: 'Observation 1', type: 'OBSERVE' },
          { value: 'ACH1', text: 'Achievement 1', type: 'ACHIEVEMENTS' },
        ],
      })

      Date.now.mockRestore()
    })

    it('should default type and subType to the values supplied via query parameters', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => 1595607300000) // Friday, 24 July 2020 17:15:00

      const req = { ...mockCreateReq, params: { offenderNo }, query: { type: 'KS', subType: 'KS' } }
      await displayCreateCaseNotePage(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '24/07/2020',
            hours: '16',
            minutes: '15',
            subType: 'KS',
            type: 'KS',
          },
        })
      )
      Date.now.mockRestore()
    })
  })

  describe('handleCreateCaseNoteForm()', () => {
    describe('when there are errors', () => {
      it('should return an error when there is a problem creating the alert', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            type: 'P',
            subType: 'PI',
            date: '20/07/2020',
            hours: '10',
            minutes: '10',
            text: 'test',
          },
        }

        caseNotesApi.addCaseNote = jest.fn().mockImplementationOnce(() => {
          throw new Error('There has been an error')
        })

        await handleCreateCaseNoteForm(req, res)

        expect(res.render).toBeCalledWith('error.njk', {
          url: '/prisoner/ABC123/add-case-note',
        })
      })

      it('should return an error if missing data', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, text: 'test', date: '2020-07-20' },
        }

        await handleCreateCaseNoteForm(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#type', text: 'Select the case note type' },
              { href: '#sub-type', text: 'Select the case note sub-type' },
              { href: '#date', text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2020' },
              { href: '#hours', text: 'Enter an hour which is 23 or less' },
              { href: '#minutes', text: 'Enter the minutes using 59 or less' },
            ],
          })
        )
      })
    })

    describe('when comment triggers validation errors', () => {
      const text = Array.from(Array(4001).keys())
        .map(_ => 'A')
        .join('')

      it('should validate maximum length does not exceed 1000', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, text },
        }

        await handleCreateCaseNoteForm(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#type', text: 'Select the case note type' },
              { href: '#sub-type', text: 'Select the case note sub-type' },
              { href: '#text', text: 'Enter what happened using 4,000 characters or less' },
              { href: '#date', text: 'Select the date when this happened' },
              { href: '#hours', text: 'Enter an hour which is 23 or less' },
              { href: '#minutes', text: 'Enter the minutes using 59 or less' },
            ],
          })
        )
      })

      it('should validate time is not in the future', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            offenderNo,
            text: 'test',
            date: moment().format('DD/MM/YYYY'),
            hours: moment()
              .add(1, 'hours')
              .format('H'),
            minutes: moment().format('mm'),
          },
        }

        await handleCreateCaseNoteForm(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#type', text: 'Select the case note type' },
              { href: '#sub-type', text: 'Select the case note sub-type' },
              { href: '#hours', text: 'Enter a time which is not in the future' },
            ],
          })
        )
      })

      it('should validate time is a number', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            offenderNo,
            text: 'test',
            date: moment().format('DD/MM/YYYY'),
            hours: 'ff',
            minutes: 'gg',
          },
        }

        await handleCreateCaseNoteForm(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [
              { href: '#type', text: 'Select the case note type' },
              { href: '#sub-type', text: 'Select the case note sub-type' },
              { href: '#hours', text: 'Enter a time using numbers only' },
              { href: '#minutes', text: 'Enter a time using numbers only' },
            ],
          })
        )
      })
    })

    describe('when the form is filled correctly', () => {
      it('should submit and redirect', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            type: 'OBSERVE',
            subType: 'OBS1',
            date: moment().format('DD/MM/YYYY'),
            hours: moment().format('H'),
            minutes: moment().format('mm'),
            text: 'test',
          },
        }

        await handleCreateCaseNoteForm(req, res)

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/case-notes')
      })
    })
  })
})
