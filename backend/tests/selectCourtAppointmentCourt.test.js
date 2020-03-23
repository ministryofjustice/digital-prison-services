const { selectCourtAppointmentCourtFactory } = require('../controllers/appointments/selectCourtAppointmentCourt')

describe('Select court appoinment court', () => {
  const elite2Api = {}
  const whereaboutsApi = {}
  const req = {
    originalUrl: 'http://localhost',
    params: { agencyId: 'MDI', offenderNo: 'A12345' },
    session: { userDetails: { activeCaseLoadId: 'LEI' } },
    body: {},
  }
  const res = { locals: {} }
  const logError = jest.fn()
  const bookingId = 1
  const appointmentDetails = {
    bookingId,
    offenderNo: 'A12345',
    firstName: 'john',
    lastName: 'doe',
    appointmentType: 'VLB',
    locationId: 1,
    startTime: '2017-10-10T11:00',
    endTime: '2017-10-10T14:00',
    recurring: 'No',
    comment: 'Test',
    locationDescription: 'Room 3',
    appointmentTypeDescription: 'Videolink',
    locationTypes: [{ value: 1, text: 'Room 3' }, { value: 2, text: 'Room 2' }, { value: 3, text: 'Room 3' }],
    date: '10/10/2019',
    preAppointmentRequired: 'yes',
    postAppointmentRequired: 'yes',
  }

  beforeEach(() => {
    elite2Api.getDetails = jest.fn()
    elite2Api.getAgencyDetails = jest.fn()

    whereaboutsApi.getCourtLocations = jest.fn()

    req.flash = jest.fn()
    res.render = jest.fn()
    res.redirect = jest.fn()

    elite2Api.getDetails.mockReturnValue({
      bookingId,
      offenderNo: 'A12345',
      firstName: 'John',
      lastName: 'Doe',
      assignedLivingUnitDesc: 'Cell 1',
    })
    elite2Api.getAgencyDetails.mockReturnValue({ description: 'Moorland' })

    whereaboutsApi.getCourtLocations.mockReturnValue({
      courtLocations: ['Kingston-upon-Thames', 'Westminster', 'Wimbledon', 'City of London', 'Southwark'],
    })

    req.flash.mockImplementation(() => [appointmentDetails])
  })

  describe('index', () => {
    it('should render the template correctly with the court values sorted alphabetically', async () => {
      const { index } = selectCourtAppointmentCourtFactory(elite2Api, whereaboutsApi, logError)

      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentCourt.njk',
        expect.objectContaining({
          courts: [
            { text: 'City of London', value: 'city-of-london' },
            { text: 'Kingston-upon-Thames', value: 'kingston-upon-thames' },
            { text: 'Southwark', value: 'southwark' },
            { text: 'Westminster', value: 'westminster' },
            { text: 'Wimbledon', value: 'wimbledon' },
          ],
          prePostData: {
            'post-court hearing briefing': '14:00 to 14:20',
            'pre-court hearing briefing': '10:40 to 11:00',
          },
        })
      )
    })

    it('should not include pre post data if not required', async () => {
      const { index } = selectCourtAppointmentCourtFactory(elite2Api, whereaboutsApi, logError)

      req.flash.mockImplementation(() => [
        {
          ...appointmentDetails,
          preAppointmentRequired: 'no',
          postAppointmentRequired: 'no',
        },
      ])
      await index(req, res)

      expect(res.render).toHaveBeenCalledWith(
        'addAppointment/selectCourtAppointmentCourt.njk',
        expect.objectContaining({
          prePostData: {},
        })
      )
    })
  })

  describe('post', () => {
    describe('when no court has been selected', () => {
      it('should return an error', async () => {
        const { post } = selectCourtAppointmentCourtFactory(elite2Api, whereaboutsApi, logError)

        await post(req, res)

        expect(res.render).toHaveBeenCalledWith(
          'addAppointment/selectCourtAppointmentCourt.njk',
          expect.objectContaining({
            errors: [{ text: 'Select which court you are in', href: '#court' }],
          })
        )
      })
    })

    describe('when a court has been selected', () => {
      it('should populate the details with the selected court and redirect to room selection page ', async () => {
        const { post } = selectCourtAppointmentCourtFactory(elite2Api, whereaboutsApi, logError)

        req.body = { court: 'city-of-london' }
        await post(req, res)

        expect(req.flash).toHaveBeenCalledWith(
          'appointmentDetails',
          expect.objectContaining({ court: 'City of London' })
        )
        expect(res.redirect).toHaveBeenCalledWith('/MDI/offenders/A12345/add-court-appointment/select-rooms')
      })
    })
  })
})
