import { makeNotFoundError } from './helpers'

const appointmentConfirmDeletion = require('../controllers/appointmentConfirmDeletion')

const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }
const whereaboutsApi = {}
const appointmentDetailsService = {}

const testAppointment = {
  appointment: {
    offenderNo: 'ABC123',
    id: 1,
    agencyId: 'MDI',
    locationId: 2,
    appointmentTypeCode: 'GYM',
    startTime: '2021-05-20T13:00:00',
  },
  recurring: null,
  videoLinkBooking: null,
}

const testAppointmentViewModel = {
  isRecurring: false,
  additionalDetails: {
    comments: 'Not entered',
  },
  basicDetails: {
    date: 'Thursday 20 May 2021',
    location: 'Gymnasium',
    type: 'Gym',
  },
  prepostData: {},
  recurringDetails: {
    recurring: 'No',
  },
  timeDetails: {
    startTime: '13:00',
    endTime: 'Not entered',
  },
}

let controller

beforeEach(() => {
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
  whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(testAppointment)
  // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentViewModel' does not exist ... Remove this comment to see the full error message
  appointmentDetailsService.getAppointmentViewModel = jest.fn().mockResolvedValue(testAppointmentViewModel)

  controller = appointmentConfirmDeletion({ whereaboutsApi, appointmentDetailsService })

  // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
  res.render = jest.fn()
})

describe('any appointment deletion', () => {
  it('should call the whereabouts api and the appointment details service', async () => {
    const req = {
      params: { id: 123 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointment' does not exist on type '... Remove this comment to see the full error message
    expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(res.locals, 123)
    // @ts-expect-error ts-migrate(2339) FIXME: Property 'getAppointmentViewModel' does not exist ... Remove this comment to see the full error message
    expect(appointmentDetailsService.getAppointmentViewModel).toHaveBeenCalledWith(res, testAppointment, 'MDI')
  })

  it('should show the correct data', async () => {
    const req = {
      params: { id: 1 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

    // @ts-expect-error ts-migrate(2339) FIXME: Property 'render' does not exist on type '{ locals... Remove this comment to see the full error message
    expect(res.render).toHaveBeenCalledWith('appointmentConfirmDeletion', {
      isRecurring: false,
      appointmentEventId: 1,
      additionalDetails: {
        comments: 'Not entered',
      },
      basicDetails: {
        date: 'Thursday 20 May 2021',
        location: 'Gymnasium',
        type: 'Gym',
      },
      prepostData: {},
      recurringDetails: {
        recurring: 'No',
      },
      timeDetails: {
        startTime: '13:00',
        endTime: 'Not entered',
      },
    })
  })

  it('should add the relevant error to the flash if no confirmation radio button is selected', async () => {
    const req = {
      params: { id: 123 },
      body: { confirmation: '', isRecurring: 'false' },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
      originalUrl: 'confirm-deletion',
    }

    await controller.post(req, res)

    expect(req.flash).toHaveBeenCalledWith('deletionErrors', [
      { href: '#confirmation', text: 'Select yes if you want to delete this appointment' },
    ])

    expect(res.redirect).toHaveBeenCalledWith('confirm-deletion')
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
    expect(res.render).toHaveBeenCalledWith('appointmentConfirmDeletion', {
      errors: [{ text: 'Error message', href: '#errorhref' }],
      appointmentEventId: 123,
      isRecurring: false,
      additionalDetails: {
        comments: 'Not entered',
      },
      basicDetails: {
        date: 'Thursday 20 May 2021',
        location: 'Gymnasium',
        type: 'Gym',
      },
      prepostData: {},
      recurringDetails: {
        recurring: 'No',
      },
      timeDetails: {
        startTime: '13:00',
        endTime: 'Not entered',
      },
    })
  })
})

describe('confirm single appointment deletion', () => {
  describe('when confirmed', () => {
    let req

    beforeEach(() => {
      req = {
        params: { id: 123 },
        body: { confirmation: 'yes', isRecurring: 'false' },
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

  describe('when not confirmed', () => {
    let req

    beforeEach(() => {
      req = {
        params: { id: 123 },
        body: { confirmation: 'no', isRecurring: 'false' },
        session: { userDetails: { activeCaseLoadId: 'MDI' } },
      }
    })

    it('should go back to the appointment details page', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/123')
    })
  })
})

describe('confirm recurring appointment deletion', () => {
  describe('when deletion confirmed', () => {
    let req

    beforeEach(() => {
      req = {
        params: { id: 123 },
        body: { confirmation: 'yes', isRecurring: 'true' },
        session: { userDetails: { activeCaseLoadId: 'MDI' } },
      }
    })

    it('should go to the recurring appointment confirmation page', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/123/delete-recurring-bookings')
    })
  })

  describe('when deletion not confirmed', () => {
    let req

    beforeEach(() => {
      req = {
        params: { id: 123 },
        body: { confirmation: 'no', isRecurring: 'true' },
        session: { userDetails: { activeCaseLoadId: 'MDI' } },
      }
    })

    it('should go back to the appointment details page', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/123')
    })
  })
})
