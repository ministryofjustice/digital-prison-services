const confirmAppointments = require('../controllers/confirmAppointment')

describe('Confirm appointments', () => {
  it('should extract appointment details from flash and return a populated view model', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({})
    const req = { flash: jest.fn() }
    const res = { render: jest.fn() }

    req.flash.mockImplementation(() => ({
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      appointmentType: 'Videolink',
      location: 'Room 4',
      date: '2019-10-10',
      startTime: '15:00',
      duration: '1 hour',
      recurring: 'No',
      comments: 'Test',
    }))

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        prisonerName: `John Doe (A12345)`,
        appointmentType: 'Videolink',
        location: 'Room 4',
        date: '2019-10-10',
        startTime: '15:00',
        duration: '1 hour',
        recurring: 'No',
        comments: 'Test',
      })
    )
  })

  it('should provide a link back to the offenders profile in DPS', async () => {
    const { index } = confirmAppointments.confirmAppointmentFactory({})
    const req = { flash: jest.fn() }
    const res = { render: jest.fn() }

    req.flash.mockImplementation(() => ({
      offenderNo: 'A12345',
      firstName: 'john',
      lastName: 'doe',
      appointmentType: 'Videolink',
      location: 'Room 4',
      date: '2019-10-10',
      startTime: '15:00',
      duration: '1 hour',
      recurring: 'No',
      comments: 'Test',
    }))

    await index(req, res)

    expect(res.render).toHaveBeenCalledWith(
      'confirmAppointments.njk',
      expect.objectContaining({
        offenderProfileLink: `http://localhost:3000/offenders/A12345?appointmentAdded=true`,
      })
    )
  })
})
