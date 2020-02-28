import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { ResultsActivity, PrintLink } from './ResultsActivity'
import OtherActivitiesView from '../OtherActivityListView'
import AttendanceNotRequiredForm from '../Attendance/AttendanceNotRequiredForm'

const PRISON = 'SYI'
const OFFENDER_NAME_COLUMN = 0
const NOMS_ID_COLUMN = 3
const REDACTED_NOMS_ID_COLUMN = 4
const FLAGS_COLUMN = 5
const ACTIVITY_COLUMN = 6
const OTHER_COLUMN = 7
const ATTEND_COLUMN = 8
const DONT_ATTEND_COLUMN = 9

const waitForAsync = () => new Promise(resolve => setImmediate(resolve))

const response = [
  {
    bookingId: 1,
    eventId: 123,
    offenderNo: 'A1234AA',
    firstName: 'ARTHUR',
    lastName: 'ANDERSON',
    cellLocation: `${PRISON}-A-1-1`,
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Chapel',
    startTime: '2017-10-15T18:00:00',
    endTime: '2017-10-15T18:30:00',
    releaseScheduled: true,
    scheduledTransfers: [],
    courtEvents: [],
    category: 'A',
    alertFlags: ['XEL'],
    eventsElsewhere: [
      {
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: `${PRISON}-A-1-1`,
        event: 'VISIT',
        eventDescription: 'Visits',
        comment: 'Official Visit',
        startTime: '2017-10-15T11:00:00',
        endTime: '2017-10-15T11:30:00',
      },
      {
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: `${PRISON}-A-1-1`,
        comment: 'Appt details',
        event: 'MEDE',
        eventDescription: 'Medical - Dentist',
        startTime: '2018-06-18T11:40:00',
      },
    ],
  },
  {
    bookingId: 2,
    eventId: 456,
    offenderNo: 'A1234AB',
    firstName: 'MICHAEL',
    lastName: 'SMITH',
    cellLocation: `XXX-A-1-2`,
    event: 'VISIT',
    eventStatus: 'CANC',
    eventDescription: 'Visits',
    comment: 'Family Visit',
    startTime: '2017-10-15T18:00:00',
    endTime: '2017-10-15T18:30:00',
  },
  {
    bookingId: 3,
    eventId: 789,
    offenderNo: 'A1234AC',
    firstName: 'FRED',
    lastName: 'QUIMBY',
    cellLocation: `${PRISON}-A-1-3`,
    event: 'PA',
    eventDescription: 'Prison Activities',
    comment: 'Chapel',
    startTime: '2017-10-15T18:00:00',
    endTime: '2017-10-15T18:30:00',
    eventsElsewhere: [
      {
        offenderNo: 'A1234AC',
        firstName: 'FRED',
        lastName: 'QUIMBY',
        cellLocation: `${PRISON}-A-1-3`,
        event: 'VISIT',
        eventStatus: 'CANC',
        eventDescription: 'Visits',
        comment: 'Family Visit',
        startTime: '2017-10-15T11:11:00',
        endTime: '2017-10-15T18:30:00',
      },
    ],
  },
  {
    bookingId: 4,
    courtEvents: [
      {
        eventId: 100,
        eventDescription: 'Court visit scheduled',
      },
    ],
    offenderNo: 'A1234AD',
    firstName: 'BUGS',
    lastName: 'BUNNY',
    cellLocation: `${PRISON}-A-1-4`,
    event: 'PA',
    eventType: 'PRISON_ACT',
    eventDescription: 'Prison Activities',
    comment: 'Carrot Sculpture',
    startTime: '2017-10-15T14:00:00',
    endTime: '2017-10-15T15:15:00',
  },
]

const user = {
  activeCaseLoadId: PRISON,
  caseLoadOptions: [
    { caseLoadId: 'XXX', description: 'Some Prison' },
    { caseLoadId: PRISON, description: 'Shrewsbury' },
  ],
}

const activities = [
  { locationId: 4, userDescription: 'Some other activity' },
  { locationId: 5, userDescription: 'Chapel Activity' },
]
const activity = '5'
const mockHistory = {
  push: jest.fn(),
  action: 'PUSH',
  block: jest.fn(),
  createHref: jest.fn(),
  go: jest.fn(),
  goBack: jest.fn(),
  goForward: jest.fn(),
  listen: jest.fn(),
  location: { hash: '', pathname: '', search: '' },
  replace: jest.fn(),
}

const props = {
  history: mockHistory,
  activities,
  activity,
  handlePrint: jest.fn(),
  handlePeriodChange: jest.fn(),
  handleDateChange: jest.fn(),
  attendAllNonAssigned: jest.fn(),
  getActivityList: jest.fn(),
  handleError: jest.fn(),
  setActivityOffenderAttendance: jest.fn(),
  resetErrorDispatch: jest.fn(),
  setColumnSort: jest.fn(),
  showPaymentReasonModal: jest.fn(),
  payable: true,
  orderField: 'lastName',
  sortOrder: 'ASC',
  agencyId: PRISON,
  user,
  raiseAnalyticsEvent: jest.fn(),
  showModal: jest.fn(),
  activityName: 'Activity name',
  userRoles: ['ACTIVITY_HUB'],
  totalAttended: 0,
  totalAbsent: 0,
  redactedPrintState: false,
}

describe('Offender activity list results component', () => {
  const today = moment().format('DD/MM/YYYY')
  let mockAxios

  beforeEach(() => {
    mockAxios = new MockAdapter(axios)
  })

  it('should render initial offender results form correctly', async () => {
    const aFewDaysAgo = moment().subtract(3, 'days')
    const date = aFewDaysAgo.format('DD/MM/YYYY')
    const longDateFormat = aFewDaysAgo.format('dddd Do MMMM')

    const component = shallow(<ResultsActivity {...props} activityData={response} date={date} period="ED" />)
    expect(component.find('.whereabouts-date').text()).toEqual(`${longDateFormat} - ED`)

    // Dig into the DatePicker component
    const searchDate = component
      .find('WhereaboutsDatePicker')
      .dive()
      .prop('input').value
    expect(searchDate).toEqual(date)
    const periodSelect = component.find('#period-select')
    expect(periodSelect.some('[value="ED"]')).toEqual(true)

    const tr = component.find('tr')
    expect(tr.length).toEqual(5) // 4 plus table header tr
    const row1Tds = tr.at(1).find('td')

    expect(
      row1Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Anderson, Arthur')
    expect(row1Tds.at(NOMS_ID_COLUMN).text()).toEqual('A1234AA')
    expect(row1Tds.at(REDACTED_NOMS_ID_COLUMN).text()).toEqual('***34AA')

    const row1Flags = row1Tds
      .at(FLAGS_COLUMN)
      .find('AlertFlags')
      .dive()
      .find('AlertFlag')

    expect(row1Flags.length).toEqual(2)
    expect(
      row1Flags
        .at(0)
        .shallow()
        .text()
    ).toEqual('E-LIST ')
    expect(
      row1Flags
        .at(1)
        .shallow()
        .text()
    ).toEqual('CAT A ')

    // TODO: find out how to fix the following line
    // expect(row1Tds.at(LOCATION_COLUMN).text()).toEqual('A-1-1')
    expect(row1Tds.at(ACTIVITY_COLUMN).text()).toEqual('18:00 - Chapel')
    expect(
      row1Tds
        .at(OTHER_COLUMN)
        .find(OtherActivitiesView)
        .at(0)
        .dive()
        .find('li')
        .at(0)
        .text()
    ).toEqual('Release scheduled')
    expect(
      row1Tds
        .at(OTHER_COLUMN)
        .find(OtherActivitiesView)
        .at(0)
        .dive()
        .find('li')
        .at(1)
        .text()
    ).toEqual('11:00 - Visits - Official Visit')
    expect(
      row1Tds
        .at(OTHER_COLUMN)
        .find(OtherActivitiesView)
        .at(0)
        .dive()
        .find('li')
        .at(2)
        .text()
    ).toEqual('11:40 - Medical - Dentist - Appt details')

    const row2Tds = tr.at(2).find('td')
    expect(
      row2Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Smith, Michael')
    // TODO: find out how to fix the following line
    // expect(row2Tds.at(LOCATION_COLUMN).text()).toEqual('A-1-2')
    expect(row2Tds.at(ACTIVITY_COLUMN).text()).toEqual('18:00 - Visits - Family Visit (cancelled)')
    expect(row2Tds.at(OTHER_COLUMN).find('li').length).toEqual(0)

    const row3Tds = tr.at(3).find('td')
    expect(
      row3Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Quimby, Fred')
    // TODO: find out how to fix the following line
    // expect(row3Tds.at(LOCATION_COLUMN).text()).toEqual('A-1-3')
    expect(row3Tds.at(ACTIVITY_COLUMN).text()).toEqual('18:00 - Chapel')
    expect(
      row3Tds
        .at(OTHER_COLUMN)
        .find(OtherActivitiesView)
        .at(0)
        .dive()
        .find('li')
        .at(0)
        .text()
    ).toEqual('11:11 - Visits - Family Visit (cancelled)')

    const row4Tds = tr.at(4).find('td')
    expect(
      row4Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Bunny, Bugs')
    expect(row4Tds.at(ACTIVITY_COLUMN).text()).toEqual('14:00 - Carrot Sculpture')
    expect(
      row4Tds
        .at(OTHER_COLUMN)
        .find(OtherActivitiesView)
        .at(0)
        .dive()
        .find('li')
        .at(0)
        .text()
    ).toEqual('Court visit scheduled')
  })

  it('should render suspended activity correctly', async () => {
    const aFewDaysAgo = moment().subtract(3, 'days')
    const date = aFewDaysAgo.format('DD/MM/YYYY')

    const data = [
      {
        bookingId: 1,
        eventId: 123,
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: `${PRISON}-A-1-1`,
        event: 'PA',
        eventDescription: 'Prison Activities',
        comment: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        releaseScheduled: true,
        scheduledTransfers: [],
        courtEvents: [],
        category: 'A',
        alertFlags: ['XEL'],
        suspended: true,
      },
    ]

    const component = shallow(<ResultsActivity {...props} activityData={data} date={date} period="ED" />)
    const suspended = component.find('div[data-qa="suspended"]').props().children

    expect(suspended[0]).toBe('18:00 - Chapel')
    expect(suspended[1].props.children).toBe(' (suspended)')
  })

  it('should render empty results list correctly', async () => {
    const component = shallow(<ResultsActivity {...props} activityData={[]} period="PM" date="" />)
    const tr = component.find('tr')
    expect(tr.length).toEqual(1) // table header tr only
    expect(component.find('div.font-small').text()).toEqual('No prisoners found')
  })

  it('should handle buttons correctly', async () => {
    const component = shallow(<ResultsActivity {...props} activityData={response} date={today} period="AM" />)

    expect(component.find('.printButton > button').some('#printButton')).toEqual(true)
    expect(component.find(PrintLink).length).toEqual(0)

    component
      .find('#printButton')
      .at(0)
      .simulate('click')
    expect(props.handlePrint).toHaveBeenCalled()
  })

  it('should recognise "Today"', async () => {
    const component = shallow(<ResultsActivity {...props} activityData={response} date="Today" period="AM" />)
    // If today, print button is present
    expect(component.find('.printButton > button').some('#printButton')).toEqual(true)
  })

  it('should not display print button when date is in the past', async () => {
    const oldDate = '25/05/2018'
    const component = shallow(<ResultsActivity {...props} activityData={response} date={oldDate} period="ED" />)

    expect(component.find('#buttons > button').some('#printButton')).toEqual(false)
    expect(component.find(PrintLink).length).toEqual(0)
  })

  it('should display print button when date is in the future', async () => {
    const futureDate = moment()
      .add(1, 'days')
      .format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity {...props} activityData={response} handleSearch={jest.fn()} date={futureDate} period="ED" />
    )

    expect(component.find('.printButton > button').some('#printButton')).toEqual(true)
    expect(component.find(PrintLink).length).toEqual(2)
  })

  it('should not display "Print list for general view" links if date is today', () => {
    const component = shallow(
      <ResultsActivity {...props} totalPaid={0} activityData={response} date={today} period="AM" />
    )

    const printRedactedButton = component.find('#redactedPrintButton')
    expect(printRedactedButton.length).toEqual(0)
  })

  it('should display "Print list for general view" links if date is after today', () => {
    const date = moment().add(1, 'day')
    const component = shallow(
      <ResultsActivity {...props} totalPaid={0} activityData={response} date={date} period="AM" />
    )

    const printRedactedButton = component.find('.redactedPrintButton')
    expect(printRedactedButton.length).toEqual(2)
  })

  it.skip('checkboxes should be read-only when date is over a week ago', async () => {
    const oldDate = '23/05/2018'
    const component = shallow(<ResultsActivity {...props} activityData={response} date={oldDate} period="ED" />)

    const tr = component.find('tr')
    expect(
      tr
        .at(1)
        .find('td')
        .at(ATTEND_COLUMN)
        .find('input')
        .some('[disabled]')
    ).toEqual(true)
    expect(
      tr
        .at(1)
        .find('td')
        .at(DONT_ATTEND_COLUMN)
        .find('input')
        .some('[disabled]')
    ).toEqual(true)
  })

  it('should not display the location of the main activity', () => {
    const data = [
      {
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        cellLocation: `${PRISON}-A-1-1`,
        event: 'APP',
        eventDescription: 'Gym',
        comment: 'Workout',
        eventLocation: 'GYM Room 1',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        releaseScheduled: true,
        scheduledTransfers: [],
        courtEvents: [],
        category: 'A',
        alertFlags: ['XEL'],
        locationId: 1,
        userDescription: 'test',
      },
    ]

    const oldDate = '23/05/2018'
    const component = shallow(
      <ResultsActivity {...props} activities={data} activity="1" activityData={data} date={oldDate} period="ED" />
    )

    const tr = component.find('tr')
    expect(tr.at(0).contains('Prison no.'))
    const row1Tds = tr.at(1).find('td')

    expect(
      row1Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
        .childAt(0)
        .dive()
        .text()
    ).toEqual('Anderson, Arthur')
    expect(row1Tds.at(NOMS_ID_COLUMN).text()).toEqual('A1234AA')
    // TODO: Find out how to fix the following line
    // expect(row1Tds.at(LOCATION_COLUMN).text()).toEqual('A-1-1')
    expect(row1Tds.at(ACTIVITY_COLUMN).text()).toEqual('18:00 - Gym - Workout')
  })

  it('should display the correct total number of offenders', () => {
    const component = shallow(<ResultsActivity {...props} activityData={response} date="07/06/2019" period="AM" />)

    expect(
      component
        .find('TotalResults')
        .first()
        .props()
    ).toEqual({ label: 'Prisoners listed:', totalResults: 4 })
  })

  it('should display current total number of paid offenders', () => {
    const component = shallow(
      <ResultsActivity {...props} totalAttended={1} activityData={response} date="07/06/2019" period="AM" />
    )
    expect(
      component
        .find('TotalResults')
        .at(1)
        .props()
    ).toEqual({ label: 'Sessions attended:', totalResults: 1 })
  })

  it('should not display pay all button if all prisoners are paid', () => {
    const component = shallow(
      <ResultsActivity {...props} totalAttended={3} activityData={response} date={today} period="AM" />
    )

    const attendAllLink = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(attendAllLink.length).toEqual(0)
  })

  it('should not display "All prisoners have attended" button if the date is more than a week in the past', () => {
    const isMoreThanAWeekOld = moment(new Date())
      .subtract(8, 'days')
      .format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity {...props} totalAttended={0} activityData={response} date={isMoreThanAWeekOld} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(0)
  })

  it('should display "All prisoners have attended" button if the date is less than 8 days old', () => {
    const isInTheLastWeek = moment(new Date())
      .subtract(6, 'days')
      .format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity {...props} totalAttended={0} activityData={response} date={isInTheLastWeek} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(1)
  })

  it('should not display "All prisoners have attended" button if the date is in the future', () => {
    const tomorrow = moment(new Date())
      .add(1, 'days')
      .format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity {...props} totalAttended={0} activityData={response} date={tomorrow} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(0)
  })

  it('should display "All prisoners have attended" button if no prisoners have been paid', () => {
    const component = shallow(
      <ResultsActivity {...props} totalAttended={0} totalAbsent={0} activityData={response} date={today} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(1)
    expect(button.text()).toEqual('All prisoners have attended')
  })

  it('should display "All remaining prisoners have attended" button if there are outstanding prisoners to pay', () => {
    const component = shallow(
      <ResultsActivity {...props} totalAttended={3} totalAbsent={3} activityData={response} date={today} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(1)
    expect(button.text()).toEqual('All remaining prisoners have attended')
  })

  it('should display "All remaining prisoners have attended" button if some prisoners have other attendance info but none are paid', () => {
    const otherAttendanceData = [
      {
        bookingId: 1,
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        attendanceInfo: {
          absentReasons: {
            value: 'RestDay',
            name: 'Rest Day',
          },
          other: true,
          paid: false,
        },
        cellLocation: `${PRISON}-A-1-1`,
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventId: 123,
        comment: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        eventsElsewhere: [],
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AC',
        firstName: 'FRED',
        lastName: 'QUIMBY',
        cellLocation: `${PRISON}-A-1-3`,
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventId: 456,
        comment: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        eventsElsewhere: [],
      },
    ]

    const component = shallow(
      <ResultsActivity
        {...props}
        totalAttended={0}
        totalAbsent={1}
        activityData={otherAttendanceData}
        date={today}
        period="AM"
      />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(1)
    expect(button.text()).toEqual('All remaining prisoners have attended')
  })

  it('should display "All prisoners have attended" button if no prisoners have other attendance info and none are paid', () => {
    const otherAttendanceNull = [
      {
        bookingId: 1,
        offenderNo: 'A1234AA',
        firstName: 'ARTHUR',
        lastName: 'ANDERSON',
        attendanceInfo: null,
        cellLocation: `${PRISON}-A-1-1`,
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventId: 123,
        comment: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        eventsElsewhere: [],
      },
      {
        bookingId: 3,
        offenderNo: 'A1234AC',
        firstName: 'FRED',
        lastName: 'QUIMBY',
        cellLocation: `${PRISON}-A-1-3`,
        event: 'PA',
        eventDescription: 'Prison Activities',
        eventId: 456,
        comment: 'Chapel',
        startTime: '2017-10-15T18:00:00',
        endTime: '2017-10-15T18:30:00',
        eventsElsewhere: [],
      },
    ]

    const component = shallow(
      <ResultsActivity {...props} activityData={otherAttendanceNull} date={today} period="AM" />
    )

    const button = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    expect(button.length).toEqual(1)
    expect(button.text()).toEqual('All prisoners have attended')
  })

  it('should call the attendAll function when the link is clicked', async () => {
    const component = shallow(
      <ResultsActivity {...props} totalAttended={0} totalAbsent={0} activityData={response} date={today} period="AM" />
    )

    const attendAllLink = component
      .find('BatchControls')
      .shallow()
      .find('#attendAllLink')
    attendAllLink.props().onClick()

    mockAxios.onPost('/api/attendance/batch').reply(200, [
      {
        offenderNo: 'A1234AA',
        bookingId: 1,
        eventId: 123,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 'A1234AB',
        bookingId: 2,
        eventId: 456,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
      {
        offenderNo: 'A1234AC',
        bookingId: 3,
        eventId: 789,
        eventLocationId: 123,
        attended: true,
        paid: true,
        period: 'AM',
        prisonId: 'LEI',
        eventDate: '29/06/2019',
      },
    ])

    expect(component.state().attendingAll).toBe(true)

    await waitForAsync()
    expect(component.state().attendingAll).toBe(false)
  })

  describe('not require all', () => {
    describe('not require all link', () => {
      it('should display not require all text', () => {
        const component = shallow(<ResultsActivity {...props} activityData={response} date={today} period="AM" />)
        const batchControls = component.find('BatchControls').shallow()
        const notRequireAllLink = batchControls.find('#notRequireAllLink')

        expect(notRequireAllLink.text()).toEqual('All prisoners are not required')
      })

      it('should display not require all remaining text if there are offenders with records', () => {
        const component = shallow(
          <ResultsActivity {...props} totalAttended={1} activityData={response} date={today} period="AM" />
        )
        const batchControls = component.find('BatchControls').shallow()
        const notRequireAllLink = batchControls.find('#notRequireAllLink')

        expect(notRequireAllLink.text()).toEqual('All remaining prisoners are not required')
      })

      it('should show the attendance not required form when clicked', () => {
        const component = shallow(<ResultsActivity {...props} activityData={response} date={today} period="AM" />)
        const batchControls = component.find('BatchControls').shallow()
        const notRequireAllLink = batchControls.find('#notRequireAllLink')
        notRequireAllLink.props().onClick()

        expect(props.showModal).toBeCalledWith(
          true,
          <AttendanceNotRequiredForm showModal={props.showModal} submitHandler={component.instance().notRequireAll} />
        )
      })

      it('should not display when all prisoners have an attendance record', () => {
        const component = shallow(
          <ResultsActivity
            {...props}
            totalAttended={1}
            totalAbsent={2}
            activityData={response}
            date={today}
            period="AM"
          />
        )
        const batchControls = component.find('BatchControls').shallow()
        const notRequireAllLink = batchControls.find('#notRequireAllLink')

        expect(notRequireAllLink.length).toEqual(0)
      })
    })

    describe('attendance not required submit handler', () => {
      it('notRequireAll should batch update attendance with correct values', () => {
        jest.spyOn(Date, 'now').mockImplementationOnce(() => 1483228800000) // Sunday 2017-01-01T00:00:00.000Z

        const component = shallow(
          <ResultsActivity {...props} activityData={response} date={moment().format('DD/MM/YYYY')} period="AM" />
        )
        const mockAxiosPost = jest.spyOn(axios, 'post')

        component.instance().notRequireAll({ comments: 'Offenders no longer required.' })

        expect(mockAxiosPost).toHaveBeenCalledWith('/api/attendance/batch', {
          attended: false,
          comments: 'Offenders no longer required.',
          offenders: [
            {
              offenderNo: 'A1234AA',
              bookingId: 1,
              eventId: 123,
              eventLocationId: undefined,
              offenderIndex: 0,
              period: 'AM',
              prisonId: 'SYI',
              eventDate: '01/01/2017',
            },
            {
              offenderNo: 'A1234AB',
              bookingId: 2,
              eventId: 456,
              eventLocationId: undefined,
              offenderIndex: 1,
              period: 'AM',
              prisonId: 'SYI',
              eventDate: '01/01/2017',
            },
            {
              offenderNo: 'A1234AC',
              bookingId: 3,
              eventId: 789,
              eventLocationId: undefined,
              offenderIndex: 2,
              period: 'AM',
              prisonId: 'SYI',
              eventDate: '01/01/2017',
            },
          ],
          paid: true,
          reason: 'NotRequired',
        })
      })
    })
  })
})
