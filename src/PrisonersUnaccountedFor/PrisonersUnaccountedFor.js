import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Table from '@govuk-react/table'

import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import OtherActivityListView from '../OtherActivityListView'
import SortableColumn from '../tablesorting/SortableColumn'
import { LAST_NAME, ACTIVITY, CELL_LOCATION } from '../tablesorting/sortColumns'
import { getHoursMinutes, getMainEventDescription } from '../utils'
import { Flag } from '../flags'
import AttendanceOptions from '../Attendance/AttendanceOptions'

const TableContainer = styled.div`
  overflow-y: scroll;

  @media print {
    th {
      width: auto !important;
    }
  }
`

const PrisonersUnaccountedFor = ({
  prisonersUnaccountedFor,
  sortOrder,
  setColumnSort,
  date,
  period,
  agencyId,
  setOffenderPaymentDataDispatch,
  resetErrorDispatch,
  raiseAnalyticsEvent,
  handleError,
  showModal,
  activityHubUser,
}) => (
  <TableContainer>
    <Table
      head={
        <Table.Row>
          <Table.CellHeader setWidth="20%">
            <SortableColumn
              heading="Name"
              column={LAST_NAME}
              sortOrder={sortOrder.orderDirection}
              setColumnSort={setColumnSort}
              sortColumn={sortOrder.orderColumn}
            />
          </Table.CellHeader>
          <Table.CellHeader setWidth="15%">
            <SortableColumn
              heading="Location"
              column={CELL_LOCATION}
              sortOrder={sortOrder.orderDirection}
              setColumnSort={setColumnSort}
              sortColumn={sortOrder.orderColumn}
            />
          </Table.CellHeader>
          <Table.CellHeader setWidth="15%">Prison no.</Table.CellHeader>
          <Table.CellHeader setWidth="25%">
            <SortableColumn
              heading="Activities"
              column={ACTIVITY}
              sortOrder={sortOrder.orderDirection}
              setColumnSort={setColumnSort}
              sortColumn={sortOrder.orderColumn}
            />
          </Table.CellHeader>
          <Table.CellHeader setWidth="25%">Other activities</Table.CellHeader>
          {activityHubUser && (
            <Flag
              name={['updateAttendanceEnabled']}
              render={() => (
                <>
                  <Table.CellHeader setWidth="15%">Attended</Table.CellHeader>
                  <Table.CellHeader setWidth="15%">Not attended</Table.CellHeader>
                </>
              )}
              fallbackRender={() => <></>}
            />
          )}
        </Table.Row>
      }
    >
      {prisonersUnaccountedFor.length === 0 && (
        <Table.Row>
          <Table.Cell colSpan="7">No results found</Table.Cell>
        </Table.Row>
      )}
      {prisonersUnaccountedFor.map(prisonerActivity => (
        <Table.Row key={prisonerActivity.eventId}>
          <Table.Cell>
            <OffenderLink offenderNo={prisonerActivity.offenderNo}>
              <OffenderName firstName={prisonerActivity.firstName} lastName={prisonerActivity.lastName} />
            </OffenderLink>
          </Table.Cell>
          <Table.Cell>
            <Location location={prisonerActivity.cellLocation} />
          </Table.Cell>
          <Table.Cell>{prisonerActivity.offenderNo}</Table.Cell>
          <Table.Cell>{`${getHoursMinutes(prisonerActivity.startTime)} - ${getMainEventDescription(
            prisonerActivity
          )}`}</Table.Cell>
          <Table.Cell>
            <OtherActivityListView
              offenderMainEvent={{
                ...prisonerActivity,
                others: prisonerActivity.eventsElsewhere,
              }}
            />
          </Table.Cell>
          {activityHubUser && (
            <Flag
              name={['updateAttendanceEnabled']}
              render={() => (
                <AttendanceOptions
                  offenderDetails={prisonerActivity}
                  raiseAnalyticsEvent={raiseAnalyticsEvent}
                  resetErrorDispatch={resetErrorDispatch}
                  handleError={handleError}
                  agencyId={agencyId}
                  period={period}
                  showModal={showModal}
                  activityName={getMainEventDescription(prisonerActivity)}
                  setOffenderAttendance={setOffenderPaymentDataDispatch}
                  date={date}
                  payAll={false}
                />
              )}
              fallbackRender={() => <></>}
            />
          )}
        </Table.Row>
      ))}
    </Table>
  </TableContainer>
)

PrisonersUnaccountedFor.propTypes = {
  prisonersUnaccountedFor: PropTypes.arrayOf(PropTypes.shape({})),
  setColumnSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.shape({ orderColumn: PropTypes.string, orderDirection: PropTypes.string }).isRequired,
  handleError: PropTypes.func.isRequired,
  date: PropTypes.string.isRequired,
  period: PropTypes.string.isRequired,
  agencyId: PropTypes.string.isRequired,
  resetErrorDispatch: PropTypes.func.isRequired,
  raiseAnalyticsEvent: PropTypes.func.isRequired,
  setOffenderPaymentDataDispatch: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
  activityHubUser: PropTypes.bool.isRequired,
}

PrisonersUnaccountedFor.defaultProps = {
  prisonersUnaccountedFor: [],
}

export default PrisonersUnaccountedFor
