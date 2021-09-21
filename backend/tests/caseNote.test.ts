import moment from 'moment'
import { makeError } from './helpers'
import caseNoteCtrl from '../controllers/caseNote'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = {}
const caseNotesApi = {}

const { index, post } = caseNoteCtrl.caseNoteFactory({ prisonApi, caseNotesApi })

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
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'myCaseNoteTypes' does not exist on type ... Remove this comment to see the full error message
    caseNotesApi.myCaseNoteTypes = jest.fn().mockReturnValue(caseNoteTypes)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.addCaseNote = jest.fn()
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockRestore()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'myCaseNoteTypes' does not exist on type ... Remove this comment to see the full error message
    caseNotesApi.myCaseNoteTypes.mockRestore()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.addCaseNote.mockRestore()
    mockReq.flash.mockRestore()
  })

  describe('index()', () => {
    const DATE_2020_10_29_16_15 = 1603988100000 // Friday, 29 Oct 2020 16:15 UTC (avoid BST)
    const DATE_2020_10_29_16_06 = 1603987560000 // Friday, 29 Oct 2020 16:06 UTC

    it('should remove the leading zeros from the prepopulated minutes', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_06)

      const req = { ...mockCreateReq, params: { offenderNo } }

      await index(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '29/10/2020',
            hours: '16',
            minutes: '06',
          },
        })
      )

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
      Date.now.mockRestore()
    })
    it('should return an error when there is a problem loading the form', async () => {
      const error = new Error('There has been an error')
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'myCaseNoteTypes' does not exist on type ... Remove this comment to see the full error message
      caseNotesApi.myCaseNoteTypes.mockRejectedValue(error)

      const req = { ...mockCreateReq, params: { offenderNo } }
      res.status = jest.fn()

      await expect(index(req, res)).rejects.toThrowError(error)

      expect(res.locals.redirectUrl).toBe('/prisoner/ABC123/case-notes')
    })

    it('should render the add case note with the correctly formatted information', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_15)

      const req = { ...mockCreateReq, params: { offenderNo } }

      await index(req, res)

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
          date: '29/10/2020',
          hours: '16',
          minutes: '15',
        },
        types: [
          { value: 'OBSERVE', text: 'Observations' },
          { value: 'ACHIEVEMENTS', text: 'Achievements' },
        ],
        subTypes: [
          { value: 'OBS1', text: 'Observation 1', type: 'OBSERVE' },
          { value: 'ACH1', text: 'Achievement 1', type: 'ACHIEVEMENTS' },
        ],
      })

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
      Date.now.mockRestore()
    })

    it('should default type and subType to the values supplied via query parameters', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_15)

      const req = { ...mockCreateReq, params: { offenderNo }, query: { type: 'KS', subType: 'KS' } }
      await index(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '29/10/2020',
            hours: '16',
            minutes: '15',
            subType: 'KS',
            type: 'KS',
          },
        })
      )
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
      Date.now.mockRestore()
    })
  })

  describe('post()', () => {
    describe('when there are errors', () => {
      const error = new Error('There has been an error')
      const error400 = makeError('response', {
        status: 400,
        body: {
          userMessage: 'createCaseNote.caseNote.text: Value is too long: max length is 4000',
          developerMessage: 'createCaseNote.caseNote.text: Value too long: max length is 4000',
        },
      })

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

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
        caseNotesApi.addCaseNote = jest.fn().mockRejectedValue(error)
        res.status = jest.fn()

        await expect(post(req, res)).rejects.toThrowError(error)
      })

      it('should return the specific error in case of a 400 response', async () => {
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
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'addCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
        caseNotesApi.addCaseNote = jest.fn().mockRejectedValue(error400)

        await post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [{ href: '#text', text: (error400 as any).response.body.userMessage }],
          })
        )
      })

      it('should return an error if missing data', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, text: 'test', date: '2020-07-20' },
        }

        await post(req, res)

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
        .map((_) => 'A')
        .join('')

      it('should validate maximum length does not exceed 1000', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, text },
        }

        await post(req, res)
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
            hours: moment().add(1, 'hours').format('H'),
            minutes: moment().format('mm'),
          },
        }

        await post(req, res)
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

        await post(req, res)
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

      it('should validate the case note is not blank', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: {
            type: 'OBSERVE',
            subType: 'OBS1',
            date: moment().format('DD/MM/YYYY'),
            hours: moment().format('H'),
            minutes: moment().format('mm'),
            text: '   ',
          },
        }

        await post(req, res)
        expect(res.render).toHaveBeenCalledWith(
          'caseNotes/addCaseNoteForm.njk',
          expect.objectContaining({
            errors: [{ href: '#text', text: 'Enter what happened' }],
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

        await post(req, res)

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/case-notes')
      })
    })
  })
})
