import moment from 'moment'
import { makeError } from './helpers'
import caseNoteCtrl, { behaviourPrompts } from '../controllers/caseNote'

Reflect.deleteProperty(process.env, 'APPINSIGHTS_INSTRUMENTATIONKEY')

const prisonApi = { getDetails: {} }
const caseNotesApi = { addCaseNote: {}, myCaseNoteTypes: {} }
const restrictedPatientApi = {}
const systemOauthClient = {}
const oauthApi = {}

const { index, post, areYouSure, confirm, recordIncentiveLevelInterruption } = caseNoteCtrl.caseNoteFactory({
  prisonApi,
  caseNotesApi,
  oauthApi,
  systemOauthClient,
  restrictedPatientApi,
})

jest.mock('../logError', () => ({
  logError: jest.fn(),
}))

describe('case note management', () => {
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
    prisonApi.getDetails = jest.fn().mockReturnValue(getDetailsResponse)
    caseNotesApi.myCaseNoteTypes = jest.fn().mockReturnValue(caseNoteTypes)
    caseNotesApi.addCaseNote = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getNeurodiversities' does not exist on type '{}'... Remove this comment to see the full error message
    oauthApi.userRoles = jest.fn().mockReturnValue([])
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockRestore()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'myCaseNoteTypes' does not exist on type ... Remove this comment to see the full error message
    caseNotesApi.myCaseNoteTypes.mockRestore()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'addCaseNote' does not exist on type '{}'... Remove this comment to see the full error message
    caseNotesApi.addCaseNote.mockRestore()
    mockCreateReq.flash.mockReset()
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

      const spy = jest.spyOn(Date, 'now')
      spy.mockRestore()
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

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
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
          subTypes: [],
        })
      )

      const spy = jest.spyOn(Date, 'now')
      spy.mockRestore()
    })

    it('should filter the sub types if a type is selected', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_15)
      await index({ ...mockCreateReq, params: { offenderNo }, query: { type: 'OBSERVE' } }, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
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
            type: 'OBSERVE',
          },
          types: [
            { value: 'OBSERVE', text: 'Observations' },
            { value: 'ACHIEVEMENTS', text: 'Achievements' },
          ],
          subTypes: [{ value: 'OBS1', text: 'Observation 1', type: 'OBSERVE' }],
        })
      )

      const spy = jest.spyOn(Date, 'now')
      spy.mockRestore()
    })

    it('should default type and subType to the values supplied via query parameters', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_15)

      const req = { ...mockCreateReq, params: { offenderNo }, query: { type: 'KA', subType: 'KS' } }
      await index(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '29/10/2020',
            hours: '16',
            minutes: '15',
            subType: 'KS',
            type: 'KA',
          },
        })
      )
      const spy = jest.spyOn(Date, 'now')
      spy.mockRestore()
    })

    it('should copy information from flash scope', async () => {
      jest.spyOn(Date, 'now').mockImplementation(() => DATE_2020_10_29_16_15)

      const req = { ...mockCreateReq, params: { offenderNo }, query: { type: 'KA', subType: 'KS' } }
      req.flash
        .mockReturnValueOnce([
          { type: 'OMIC', subType: 'OMIC_COMM', text: 'Test comment', date: '03/02/2020', minutes: '02', hours: '1' },
        ])
        .mockReturnValue([])
      await index(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          formValues: {
            date: '03/02/2020',
            hours: '1',
            minutes: '02',
            subType: 'OMIC_COMM',
            type: 'OMIC',
            text: 'Test comment',
          },
        })
      )
      const spy = jest.spyOn(Date, 'now')
      spy.mockRestore()
    })

    it('should chose some positive/negative behaviour entry prompts', async () => {
      const req = { ...mockCreateReq, params: { offenderNo } }
      await index(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/addCaseNoteForm.njk',
        expect.objectContaining({
          behaviourPrompts: {
            pos: {
              summary: expect.any(String),
              text: expect.any(String),
              gaId: expect.any(String),
            },
            neg: {
              summary: expect.any(String),
              text: expect.any(String),
              gaId: expect.any(String),
            },
          },
        })
      )
    })

    it('should should use unique GA ids for positive/negative behaviour entry prompts', async () => {
      // take GA ids along with pos/neg key
      const keyIdPairs = Object.entries(behaviourPrompts)
        .map(([key, prompts]) => {
          return prompts.map((prompt) => [key, prompt.gaId])
        })
        .flat()
      // GA ids should indicate behvaiour type
      expect(
        keyIdPairs.every(([key, gaId]) =>
          key === 'pos'
            ? gaId.startsWith('Positive behaviour prompt: ')
            : gaId.startsWith('Negative behaviour prompt: ')
        )
      ).toBeTruthy()
      // GA ids should be unique
      expect(
        keyIdPairs.reduce((set, [_, gaID]) => {
          set.add(gaID)
          return set
        }, new Set()).size
      ).toEqual(keyIdPairs.length)
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
        caseNotesApi.addCaseNote = jest.fn().mockRejectedValue(error400)

        await post(req, res)

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/add-case-note')
        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
          { href: '#text', text: (error400 as any).response.body.userMessage },
        ])
        expect(req.flash).toHaveBeenNthCalledWith(2, 'caseNote', {
          date: '20/07/2020',
          hours: '10',
          minutes: '10',
          offenderNo: 'ABC123',
          subType: 'PI',
          text: 'test',
          type: 'P',
        })
      })

      it('should return an error if missing data', async () => {
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: { offenderNo, text: 'test', date: '2020-07-20' },
        }

        await post(req, res)

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/add-case-note')
        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
          { href: '#type', text: 'Select the case note type' },
          { href: '#sub-type', text: 'Select the case note sub-type' },
          { href: '#date', text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2020' },
          { href: '#hours', text: 'Enter an hour which is 23 or less' },
          { href: '#minutes', text: 'Enter the minutes using 59 or less' },
        ])
        expect(req.flash).toHaveBeenNthCalledWith(2, 'caseNote', {
          date: '2020-07-20',
          offenderNo: 'ABC123',
          text: 'test',
        })
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
        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
          { href: '#type', text: 'Select the case note type' },
          { href: '#sub-type', text: 'Select the case note sub-type' },
          { href: '#text', text: 'Enter what happened using 4,000 characters or less' },
          { href: '#date', text: 'Select the date when this happened' },
          { href: '#hours', text: 'Enter an hour which is 23 or less' },
          { href: '#minutes', text: 'Enter the minutes using 59 or less' },
        ])
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
        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
          { href: '#type', text: 'Select the case note type' },
          { href: '#sub-type', text: 'Select the case note sub-type' },
          { href: '#hours', text: 'Enter a time which is not in the future' },
        ])
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
        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
          { href: '#type', text: 'Select the case note type' },
          { href: '#sub-type', text: 'Select the case note sub-type' },
          { href: '#hours', text: 'Enter a time using numbers only' },
          { href: '#minutes', text: 'Enter a time using numbers only' },
        ])
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

        expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [{ href: '#text', text: 'Enter what happened' }])
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
      it('should take the user to confirm page if omic open case note', async () => {
        const caseNote = {
          type: 'OMIC',
          subType: 'OPEN_COMM',
          date: moment().format('DD/MM/YYYY'),
          hours: moment().format('H'),
          minutes: moment().format('mm'),
          text: 'test',
        }
        const req = {
          ...mockCreateReq,
          params: { offenderNo },
          body: caseNote,
          session: {},
        }

        await post(req, res)

        expect(res.redirect).toBeCalledWith('/prisoner/ABC123/add-case-note/confirm')
        expect(req.session).toEqual({ draftCaseNote: { ...caseNote, offenderNo } })
      })
    })
  })

  describe('areYouSure()', () => {
    it('should render the confirm page', async () => {
      const req = { ...mockCreateReq, params: { offenderNo } }

      await areYouSure(req, res)

      expect(res.render).toBeCalledWith('caseNotes/addCaseNoteConfirm.njk', {
        offenderDetails: {
          name: 'Test User',
          offenderNo: 'ABC123',
          profileUrl: '/prisoner/ABC123',
        },
        offenderNo,
        homeUrl: '/prisoner/ABC123/case-notes',
        breadcrumbText: 'Add a case note',
      })
    })
  })

  describe('confirm()', () => {
    it('should save the case note if confirmed', async () => {
      const req = {
        ...mockCreateReq,
        params: { offenderNo },
        session: { draftCaseNote: { text: 'hello', date: '20/01/2020', hours: '23', minutes: '10' } },
        body: { confirmed: 'Yes' },
      }

      await confirm(req, res)

      expect(caseNotesApi.addCaseNote).toBeCalledWith(res.locals, offenderNo, {
        text: 'hello',
        date: '20/01/2020',
        hours: '23',
        minutes: '10',
        occurrenceDateTime: '2020-01-20T23:10:00',
      })
      expect(res.redirect).toBeCalledWith('/prisoner/ABC123/case-notes')
    })

    it('should redirect if case note save fails', async () => {
      const req = {
        ...mockCreateReq,
        params: { offenderNo },
        session: { draftCaseNote: { text: 'hello', date: '20/01/2020', hours: '23', minutes: '10' } },
        body: { confirmed: 'Yes' },
      }
      const error400 = makeError('response', {
        status: 400,
        body: {
          userMessage: 'createCaseNote.caseNote.text: Value is too long: max length is 4000',
          developerMessage: 'createCaseNote.caseNote.text: Value too long: max length is 4000',
        },
      })
      caseNotesApi.addCaseNote = jest.fn().mockRejectedValue(error400)

      await confirm(req, res)

      expect(caseNotesApi.addCaseNote).toBeCalledWith(res.locals, offenderNo, {
        text: 'hello',
        date: '20/01/2020',
        hours: '23',
        minutes: '10',
        occurrenceDateTime: '2020-01-20T23:10:00',
      })
      expect(req.flash).toHaveBeenNthCalledWith(1, 'caseNoteErrors', [
        { href: '#text', text: (error400 as any).response.body.userMessage },
      ])
      expect(req.flash).toHaveBeenNthCalledWith(2, 'caseNote', {
        text: 'hello',
        date: '20/01/2020',
        hours: '23',
        minutes: '10',
      })
    })

    it('should redirect if user does not confirm', async () => {
      const req = {
        ...mockCreateReq,
        params: { offenderNo },
        session: { draftCaseNote: { text: 'hello' } },
        body: { confirmed: 'No' },
      }

      await confirm(req, res)

      expect(caseNotesApi.addCaseNote).not.toHaveBeenCalled()
      expect(req.flash).toBeCalledWith('caseNote', {
        text: 'hello',
      })
      expect(res.redirect).toBeCalledWith('/prisoner/ABC123/add-case-note')
    })

    it('should show error if user does not enter a choice', async () => {
      const req = {
        ...mockCreateReq,
        params: { offenderNo },
        session: { draftCaseNote: { text: 'hello' } },
      }

      await confirm(req, res)

      expect(caseNotesApi.addCaseNote).not.toHaveBeenCalled()
      expect(req.flash).toBeCalledWith('confirmErrors', [
        { href: '#confirmed', text: 'Select yes if this information is appropriate to share' },
      ])
      expect(res.redirect).toBeCalledWith('/prisoner/ABC123/add-case-note/confirm')
    })
  })

  describe('recordIncentiveLevelInterruption()', () => {
    it('should render the interruption page', async () => {
      const req = { ...mockCreateReq, params: { offenderNo } }

      await recordIncentiveLevelInterruption(req, res)

      expect(res.render).toBeCalledWith(
        'caseNotes/recordIncentiveLevelInterruption.njk',
        expect.objectContaining({
          offenderDetails: {
            name: 'Test User',
            offenderNo: 'ABC123',
            profileUrl: '/prisoner/ABC123',
          },
          caseNotesUrl: '/prisoner/ABC123/case-notes',
          recordIncentiveLevelUrl: '/prisoner/ABC123/incentive-level-details/change-incentive-level',
        })
      )
    })
  })
})
