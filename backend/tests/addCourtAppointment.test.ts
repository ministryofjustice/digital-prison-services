import { addCourtAppointmentsFactory } from '../controllers/appointments/addCourtAppointment'

const prisonApi = {}

const req = {
  session: {
    userDetails: {},
  },
  params: {
    offenderNo: 'A12345',
    agencyId: 'MDI',
  },
}
const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }

describe('Add court appointment', () => {
  let controller
  let logError

  beforeEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails = jest.fn()
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockReturnValue({ firstName: 'firstName', lastName: 'lastName', bookingId: 1 })
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    prisonApi.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    res.render = jest.fn()
    res.send = jest.fn()
    res.redirect = jest.fn()

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'flash' does not exist on type '{ session... Remove this comment to see the full error message
    req.flash = jest.fn()
    logError = jest.fn()
    controller = addCourtAppointmentsFactory(prisonApi, logError)
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'mockRestore' does not exist on type '() ... Remove this comment to see the full error message
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  it('should request user and agency details', async () => {
    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    expect(prisonApi.getDetails).toHaveBeenCalledWith({}, 'A12345')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAgencyDetails' does not exist on type... Remove this comment to see the full error message
    expect(prisonApi.getAgencyDetails).toHaveBeenCalledWith({}, 'MDI')
  })

  it('should pack agencyId into user details', async () => {
    await controller.index(req, res)

    expect(req.session.userDetails).toEqual({ activeCaseLoadId: 'MDI' })
  })

  it('should render template with default data', async () => {
    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith(
      'addAppointment/addCourtAppointment.njk',
      expect.objectContaining({
        formValues: {
          appointmentType: 'VLB',
        },
        offenderNo: 'A12345',
        offenderNameWithNumber: 'Firstname Lastname (A12345)',
        agencyDescription: 'Moorland',
        bookingId: 1,
      })
    )
  })

  it('should render index error template', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getDetails' does not exist on type '{}'.
    prisonApi.getDetails.mockImplementation(() => Promise.reject(new Error('Network error')))

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('courtServiceError.njk', expect.objectContaining({}))
    expect(logError).toHaveBeenCalledWith(undefined, new Error('Network error'), 'Sorry, the service is unavailable')
  })

  describe('validation errors', () => {
    it('should return errors for each missing input', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
      req.body = {}
      await controller.validateInput(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/addCourtAppointment.njk',
        expect.objectContaining({
          bookingId: 1,
          errors: [
            { href: '#date', text: 'Select the date of the video link' },
            { href: '#start-time-hours', text: 'Select the start time of the court hearing video link' },
            { href: '#end-time-hours', text: 'Select the end time of the court hearing video link' },
            { href: '#pre-appointment-required', text: 'Select yes if you want to add a pre-court hearing briefing' },
            { href: '#post-appointment-required', text: 'Select yes if you want to add a post-court hearing briefing' },
          ],
          offenderNameWithNumber: 'Firstname Lastname (A12345)',
          agencyDescription: 'Moorland',
          offenderNo: 'A12345',
        })
      )
    })

    describe('when only partial start and end times are entered', () => {
      it('should return validation errors when only hours are entered', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
        req.body = { startTimeHours: '01', endTimeHours: '02' }
        await controller.validateInput(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addCourtAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#start-time-hours', text: 'Select a full start time of the court hearing video link' },
              { href: '#end-time-hours', text: 'Select a full end time of the court hearing video link' },
            ]),
          })
        )
      })

      it('should return validation errors when only minutes are entered', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
        req.body = { startTimeMinutes: '00', endTimeMinutes: '00' }
        await controller.validateInput(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addCourtAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#start-time-hours', text: 'Select a full start time of the court hearing video link' },
              { href: '#end-time-hours', text: 'Select a full end time of the court hearing video link' },
            ]),
          })
        )
      })
    })

    describe('when historic date and times are selected', () => {
      beforeEach(() => {
        jest.spyOn(Date, 'now').mockImplementation(() => 1553860800000) // Friday 2019-03-29T12:00:00.000Z
      })

      it('should return an error when selected date is in the past', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
        req.body = { date: '28/03/2019' }
        await controller.validateInput(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addCourtAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([{ href: '#date', text: 'Select a date that is not in the past' }]),
          })
        )
      })

      it('should return an error when selected start time is in the past', async () => {
        // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
        req.body = { date: '29/03/2019', startTimeHours: '10', startTimeMinutes: '0' }
        await controller.validateInput(req, res)

        // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/addCourtAppointment.njk',
          expect.objectContaining({
            errors: expect.arrayContaining([
              { href: '#start-time-hours', text: 'Select a start time that is not in the past' },
            ]),
          })
        )
      })
    })

    it('should return an error when the end time is before the start time', async () => {
      // @ts-expect-error ts-migrate(2339) FIXME: Property 'body' does not exist on type '{ session:... Remove this comment to see the full error message
      req.body = {
        date: '29/03/2019',
        startTimeHours: '10',
        startTimeMinutes: '15',
        endTimeHours: '09',
        endTimeMinutes: '15',
      }
      await controller.validateInput(req, res)

      // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/addCourtAppointment.njk',
        expect.objectContaining({
          errors: expect.arrayContaining([
            { href: '#end-time-hours', text: 'Select an end time that is not in the past' },
          ]),
        })
      )
    })
  })

  it('should go to the court selection page', () => {
    controller.goToCourtSelection(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-court')
  })
})
