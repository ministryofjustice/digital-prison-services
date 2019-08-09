import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Table from '@govuk-react/table'

import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'
import OtherActivityListView from '../OtherActivityListView'
import SortableColumn from '../tablesorting/SortableColumn'
import { LAST_NAME, ACTIVITY } from '../tablesorting/sortColumns'
import { getHoursMinutes, getMainEventDescription } from '../utils'

const TableContainer = styled.div`
  overflow-y: scroll;
`

const MissingPrisoners = ({ missingPrisoners, sortOrder, setColumnSort }) => (
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
          <Table.CellHeader setWidth="15%">Location</Table.CellHeader>
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
        </Table.Row>
      }
    >
      {missingPrisoners.length === 0 && (
        <Table.Row>
          <Table.Cell colSpan="7">No results found</Table.Cell>
        </Table.Row>
      )}
      {missingPrisoners.map(prisonerActivity => (
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
        </Table.Row>
      ))}
    </Table>
  </TableContainer>
)

MissingPrisoners.propTypes = {
  missingPrisoners: PropTypes.arrayOf(PropTypes.shape({})),
  setColumnSort: PropTypes.func.isRequired,
  sortOrder: PropTypes.shape({ orderColumn: PropTypes.string, orderDirection: PropTypes.string }).isRequired,
}

MissingPrisoners.defaultProps = {
  missingPrisoners: [],
}

export default MissingPrisoners
