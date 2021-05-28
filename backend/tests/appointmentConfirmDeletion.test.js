const appointmentConfirmDeletion = require('../controllers/appointmentConfirmDeletion')

const res = { locals: {}, send: jest.fn(), redirect: jest.fn() }
const prisonApi = {}
const whereaboutsApi = {}

const appointmentDetails = {
  id: 1,
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

const flashImpl = jest.fn()

let controller

beforeEach(() => {
  controller = appointmentConfirmDeletion({ prisonApi, whereaboutsApi })

  res.render = jest.fn()

  flashImpl.mockImplementation(() => [appointmentDetails])
})

describe('any appointment deletion', () => {
  it('should show the correct data from the flash', async () => {
    const req = {
      flash: flashImpl,
    }

    await controller.index(req, res)

    expect(res.render).toHaveBeenCalledWith('appointmentConfirmDeletion', {
      errors: [],
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

  it('should show the relevant error if no confirmation radio button is selected', async () => {
    const req = {
      body: { isRecurring: 'false', appointmentEventId: 123 },
      flash: flashImpl,
    }

    await controller.post(req, res)

    expect(res.render).toHaveBeenCalledWith('appointmentConfirmDeletion', {
      errors: [{ text: 'Select yes if you want to delete this appointment', href: '#confirmation' }],
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

  it('should throw an error when appointment details are missing from flash', async () => {
    const req = {
      flash: jest.fn(),
    }

    await expect(controller.index(req, res)).rejects.toThrowError(new Error('Appointment details are missing'))
    expect(res.locals.redirectUrl).toBe('/view-all-appointments')
  })
})

describe('confirm single appointment deletion', () => {
  describe('when confirmed', () => {
    let req

    beforeEach(() => {
      req = {
        body: { confirmation: 'yes', isRecurring: 'false', appointmentEventId: 123 },
        flash: flashImpl,
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
        body: { confirmation: 'no', isRecurring: 'false', appointmentEventId: 123 },
        flash: flashImpl,
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
        body: { confirmation: 'yes', isRecurring: 'true', appointmentEventId: 123 },
        flash: flashImpl,
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
        body: { confirmation: 'no', isRecurring: 'true', appointmentEventId: 123 },
        flash: flashImpl,
      }
    })

    it('should go back to the appointment details page', async () => {
      await controller.post(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/appointment-details/123')
    })
  })
})
