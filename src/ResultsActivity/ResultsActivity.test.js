import React from 'react'
import { shallow } from 'enzyme'
import moment from 'moment'
import { ResultsActivity } from './ResultsActivity'
import OtherActivitiesView from '../OtherActivityListView'

const PRISON = 'SYI'
const OFFENDER_NAME_COLUMN = 0
const NOMS_ID_COLUMN = 2
const FLAGS_COLUMN = 3
const ACTIVITY_COLUMN = 4
const OTHER_COLUMN = 5
const ATTEND_COLUMN = 6
const DONT_ATTEND_COLUMN = 7

const response = [
  {
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
    offenderNo: 'A1234AB',
    firstName: 'MICHAEL',
    lastName: 'SMITH',
    cellLocation: `${PRISON}-A-1-2`,
    event: 'VISIT',
    eventStatus: 'CANC',
    eventDescription: 'Visits',
    comment: 'Family Visit',
    startTime: '2017-10-15T18:00:00',
    endTime: '2017-10-15T18:30:00',
  },
  {
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

describe('Offender activity list results component', () => {
  it('should render initial offender results form correctly', async () => {
    const aFewDaysAgo = moment().subtract(3, 'days')
    const date = aFewDaysAgo.format('DD/MM/YYYY')
    const longDateFormat = aFewDaysAgo.format('dddd Do MMMM')

    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        handlePrint={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        date={date}
        period="ED"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )
    expect(component.find('.whereabouts-date').text()).toEqual(`Gym - ${longDateFormat} - ED`)

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
    expect(row1Tds.at(FLAGS_COLUMN).text()).toEqual('E\u2011LISTCAT\u00a0A') // non-breaking hyphen and space!
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
    ).toEqual('** Release scheduled **')
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
    // Reinstate with checkboxes in V2
    // expect(
    //   row1Tds
    //     .at(ATTEND_COLUMN)
    //     .find('input')
    //     .some('[type="checkbox"]')
    // ).toEqual(true)
    // Check not disabled. This odd looking attribute value is handled correctly in the real DOM
    // expect(
    //   row1Tds
    //     .at(ATTEND_COLUMN)
    //     .find('input')
    //     .debug()
    // ).toEqual(expect.stringContaining('disabled={false}'))
    // expect(
    //   row1Tds
    //     .at(DONT_ATTEND_COLUMN)
    //     .find('input')
    //     .some('[type="checkbox"]')
    // ).toEqual(true)

    const row2Tds = tr.at(2).find('td')
    expect(
      row2Tds
        .at(OFFENDER_NAME_COLUMN)
        .childAt(0)
        .dive()
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
    ).toEqual('** Court visit scheduled ** ')
  })

  it('should render empty results list correctly', async () => {
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={[]}
        handlePrint={jest.fn()}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        period="PM"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        date=""
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )
    const tr = component.find('tr')
    expect(tr.length).toEqual(1) // table header tr only
    expect(component.find('div.font-small').text()).toEqual('No prisoners found')
  })

  it('should handle buttons correctly', async () => {
    const getActivityList = jest.fn()

    const handlePrint = jest.fn()
    const today = moment().format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        getActivityList={getActivityList}
        handlePrint={handlePrint}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        date={today}
        period="AM"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )

    expect(component.find('#buttons > button').some('#printButton')).toEqual(true)

    component.find('#updateButton').simulate('click')
    expect(getActivityList).toHaveBeenCalled()
    expect(handlePrint).not.toHaveBeenCalled()
    expect(handlePrint).not.toHaveBeenCalled()
    component
      .find('#printButton')
      .at(0)
      .simulate('click')
    expect(handlePrint).toHaveBeenCalled()
  })

  it('should recognise "Today"', async () => {
    const getActivityList = jest.fn()
    const handlePrint = jest.fn()
    const today = 'Today'
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        getActivityList={getActivityList}
        handlePrint={handlePrint}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        date={today}
        period="AM"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )
    // If today, print button is present
    expect(component.find('#buttons > button').some('#printButton')).toEqual(true)
  })

  it('should not display print button when date is in the past', async () => {
    const oldDate = '25/05/2018'
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        handlePrint={jest.fn()}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        date={oldDate}
        period="ED"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )

    expect(component.find('#buttons > button').some('#printButton')).toEqual(false)
  })

  it('should display print button when date is in the future', async () => {
    const futureDate = moment()
      .add(1, 'days')
      .format('DD/MM/YYYY')
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        handleSearch={jest.fn()}
        handlePrint={jest.fn()}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        date={futureDate}
        period="ED"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )

    expect(component.find('#buttons > button').some('#printButton')).toEqual(true)
  })

  it.skip('checkboxes should be read-only when date is over a week ago', async () => {
    const handleSearch = jest.fn()
    const handlePrint = jest.fn()
    const oldDate = '23/05/2018'
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={activities}
        activity={activity}
        activityData={response}
        handleSearch={handleSearch}
        handlePrint={handlePrint}
        // handleLocationChange={jest.fn()}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        date={oldDate}
        period="ED"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
    )

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

    const handleSearch = jest.fn()
    const handlePrint = jest.fn()
    const oldDate = '23/05/2018'
    const component = shallow(
      <ResultsActivity
        history={mockHistory}
        activities={data}
        activity="1"
        activityData={data}
        handleSearch={handleSearch}
        handlePrint={handlePrint}
        handlePeriodChange={jest.fn()}
        handleDateChange={jest.fn()}
        getActivityList={jest.fn()}
        date={oldDate}
        period="ED"
        agencyId={PRISON}
        showPaymentReasonModal={jest.fn()}
        user={user}
        resetErrorDispatch={jest.fn()}
        setColumnSort={jest.fn()}
        orderField="lastName"
        sortOrder="ASC"
        activityName="Gym"
        updateAttendanceEnabled={false}
        payable
      />
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
    expect(row1Tds.at(FLAGS_COLUMN).text()).toEqual('E\u2011LISTCAT\u00a0A') // non-breaking hyphen and space!
    // TODO: Find out how to fix the following line
    // expect(row1Tds.at(LOCATION_COLUMN).text()).toEqual('A-1-1')
    expect(row1Tds.at(ACTIVITY_COLUMN).text()).toEqual('18:00 - Gym - Workout')
  })
})
