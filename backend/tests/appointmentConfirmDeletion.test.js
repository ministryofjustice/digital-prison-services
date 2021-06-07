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
  whereaboutsApi.getAppointment = jest.fn().mockResolvedValue(testAppointment)
  appointmentDetailsService.getAppointmentViewModel = jest.fn().mockResolvedValue(testAppointmentViewModel)

  controller = appointmentConfirmDeletion({ whereaboutsApi, appointmentDetailsService })

  res.render = jest.fn()
})

describe('any appointment deletion', () => {
  it('should call the whereabouts api and the deletion service', async () => {
    const req = {
      params: { id: 123 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

    expect(whereaboutsApi.getAppointment).toHaveBeenCalledWith(res.locals, 123)
    expect(appointmentDetailsService.getAppointmentViewModel).toHaveBeenCalledWith(res, testAppointment, 'MDI')
  })

  it('should show the correct data', async () => {
    const req = {
      params: { id: 1 },
      session: { userDetails: { activeCaseLoadId: 'MDI' } },
      flash: jest.fn(),
    }

    await controller.index(req, res)

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
      whereaboutsApi.deleteAppointment = jest.fn()

      await controller.post(req, res)

      expect(whereaboutsApi.deleteAppointment).toHaveBeenCalledWith(res.locals, 123)

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/deleted?multipleDeleted=false')
    })

    it('should go to the error page if the deletion fails', async () => {
      const error = new Error('api error')
      whereaboutsApi.deleteAppointment = jest.fn().mockRejectedValue(error)

      await expect(controller.post(req, res)).rejects.toThrowError(error)
      expect(res.locals.redirectUrl).toBe('/appointment-details/123')
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

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/recurring-appointments-booked')
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
