import { makeNotFoundError } from './helpers'

const appointmentDeleteRecurringBookings = require('../controllers/appointmentDeleteRecurringBookings')

const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }
const whereaboutsApi = {}

const testAppointment = {
  appointment: {
    offenderNo: 'ABC123',
    id: 1,
    agencyId: 'MDI',
    locationId: 2,
    appointmentTypeCode: 'GYM',
    startTime: '2021-05-20T13:00:00',
  },
  recurring: {
    id: 100,
    repeatPeriod: 'WEEKLY',
    count: 10,
    startTime: '2021-05-20T13:00:00',
  },
  videoLinkBooking: null,
}

let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
  whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(testAppointment)

  controller = appointmentDeleteRecurringBookings({ whereaboutsApi })

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
  res.render = jest.fn()
})

describe('any appointment deletion', () => {
  it('should call the whereabouts api to get the date', async () => {
    const req = {
      params: { id: 123 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
    expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(res.locals, 123)
  })

  it('should show the correct data', async () => {
    const req = {
      params: { id: 1 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('appointmentDeleteRecurringBookings', {
      recurringAppointmentId: 100,
      recurringFrequencyDescription: 'weekly',
      lastAppointment: '22 July 2021',
    })
  })

  it('should add the relevant error to the flash if no confirmation radio button is selected', async () => {
    const req = {
      params: { id: 123 },
      body: { deleteRecurringSequence: '', recurringAppointmentId: 100 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
      originalUrl: 'delete-recurring',
    }

    await controller.post(req, res)

    expect(req.flash).toHaveBeenCalledWith('deletionErrors', [
      { href: '#deleteRecurringSequence', text: 'Select yes if you want to delete all of these appointments' },
    ])

    expect(res.redirect).toHaveBeenCalledWith('delete-recurring')
  })

  it('should show any errors stored the flash', async () => {
    const req = {
      params: { id: 123 },
      body: { confirmation: '', isRecurring: 'false' },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn().mockReturnValue([{ text: 'Error message', href: '#errorhref' }]),
    }

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('appointmentDeleteRecurringBookings', {
      errors: [{ text: 'Error message', href: '#errorhref' }],
      recurringAppointmentId: 100,
      recurringFrequencyDescription: 'weekly',
      lastAppointment: '22 July 2021',
    })
  })
})

describe('when single appointment deletion selected', () => {
  let req

  beforeEach(() => {
    req = {
      params: { id: 123 },
      body: { deleteRecurringSequence: 'no', recurringAppointmentId: 100 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
    }
  })

  it('should go to report page if deletion succeeds', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteAppointment' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.deleteAppointment = jest.fn()

    await controller.post(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteAppointment' does not exist on typ... Remove this comment to see the full error message
    expect(whereaboutsApi.deleteAppointment).toHaveBeenCalledWith(res.locals, 123)

    expect(res.redirect).toHaveBeenCalledWith('/appointment-details/deleted?multipleDeleted=false')
  })

  it('should go to the error page if the deletion fails', async () => {
    const error = new Error('api error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteAppointment' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.deleteAppointment = jest.fn().mockRejectedValue(error)

    await expect(controller.post(req, res)).rejects.toThrowError(error)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
    expect(res.locals.redirectUrl).toBe('/appointment-details/123')
  })

  it('should go to the report page if the deletion fails due to a 404 error when deleting', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteAppointment' does not exist on typ... Remove this comment to see the full error message
    whereaboutsApi.deleteAppointment = jest.fn().mockRejectedValue(makeNotFoundError())

    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/appointment-details/deleted?multipleDeleted=false')
  })
})

describe('when deletion of recurring appointment sequence selected', () => {
  let req

  beforeEach(() => {
    req = {
      params: { id: 123 },
      body: { deleteRecurringSequence: 'yes', recurringAppointmentId: 100 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
    }
  })

  it('should go to report page if deletion succeeds', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteRecurringAppointmentSequence' does... Remove this comment to see the full error message
    whereaboutsApi.deleteRecurringAppointmentSequence = jest.fn()

    await controller.post(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteRecurringAppointmentSequence' does... Remove this comment to see the full error message
    expect(whereaboutsApi.deleteRecurringAppointmentSequence).toHaveBeenCalledWith(res.locals, 100)

    expect(res.redirect).toHaveBeenCalledWith('/appointment-details/deleted?multipleDeleted=true')
  })

  it('should go to the error page if the deletion fails', async () => {
    const error = new Error('api error')
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteRecurringAppointmentSequence' does... Remove this comment to see the full error message
    whereaboutsApi.deleteRecurringAppointmentSequence = jest.fn().mockRejectedValue(error)

    await expect(controller.post(req, res)).rejects.toThrowError(error)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'redirectUrl' does not exist on type '{}'... Remove this comment to see the full error message
    expect(res.locals.redirectUrl).toBe('/appointment-details/100')
  })

  it('should go to the report page if the deletion fails due to a 404 error when deleting', async () => {
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'deleteRecurringAppointmentSequence' does... Remove this comment to see the full error message
    whereaboutsApi.deleteRecurringAppointmentSequence = jest.fn().mockRejectedValue(makeNotFoundError())

    await controller.post(req, res)

    expect(res.redirect).toHaveBeenCalledWith('/appointment-details/deleted?multipleDeleted=true')
  })
})
