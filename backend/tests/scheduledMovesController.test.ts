import moment from 'moment'
import scheduledMoves from '../controllers/whereabouts/scheduledMoves'

const MOCK_DATE_TO_01_01_2027 = () => jest.spyOn(Date, 'now').mockImplementation(() => 1483228800000)

const agencyDetails = { agencyId: 'LEI', description: 'Leeds (HMP)' }
const movementReasons = [
  { code: '1', description: 'Visit Dying Relative' },
  { code: '2', description: 'Adventure And Social Welfare' },
]

describe('Scheduled moves controller', () => {
  const prisonApi = {
    getMovementReasons: () => {},
    getAgencyDetails: () => {},
  }
  let controller
  let req
  let res
  let today

  beforeEach(() => {
    res = {
      render: jest.fn(),
      locals: {},
    }
    req = {
      session: {
        userDetails: {
          activeCaseLoadId: 'LEI',
        },
      },
    }
    MOCK_DATE_TO_01_01_2027()

    today = moment().format('DD/MM/YYYY')
    prisonApi.getMovementReasons = jest.fn().mockResolvedValue(movementReasons)
    prisonApi.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetails)

    controller = scheduledMoves({ prisonApi })
  })

  afterEach(() => {
    // @ts-expect-error ts-migrate(2339)
    if (Date.now.mockRestore) Date.now.mockRestore()
  })

  it('renders the correct template', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith('whereabouts/scheduledMoves.njk', expect.anything())
  })

  it('should render template with the default date', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        formValues: {
          date: today,
        },
      })
    )
  })

  it('should make a call to retrieve current agency details', async () => {
    await controller.index(req, res)

    expect(prisonApi.getAgencyDetails).toHaveBeenLastCalledWith(res.locals, 'LEI')
  })
  it('should render template with the agency description and formatted date ', async () => {
    await controller.index(req, res)

    expect(res.render).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        dateForTitle: '1 January 2017',
        agencyDescription: 'Leeds (HMP)',
      })
    )
  })

  describe('Movement reason select values', () => {
    it('should make a call for to retrieve the movement reasons', async () => {
      await controller.index(req, res)

      expect(prisonApi.getMovementReasons).toHaveBeenLastCalledWith(res.locals)
    })

    it('should map the movement reason values into the right shape for the select box, sorted alphabetically ', async () => {
      await controller.index(req, res)

      expect(res.render).toHaveBeenLastCalledWith(
        expect.anything(),
        expect.objectContaining({
          movementReasons: [
            { value: '2', text: 'Adventure And Social Welfare' },
            { value: '1', text: 'Visit Dying Relative' },
          ],
        })
      )
    })
  })
})
