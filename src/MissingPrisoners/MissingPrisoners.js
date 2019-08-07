import React from 'react'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import Table from '@govuk-react/table'

import OffenderName from '../OffenderName'
import OffenderLink from '../OffenderLink'
import Location from '../Location'

const TableContainer = styled.div`
  overflow-y: scroll;
`

const MissingPrisoners = ({ missingPrisoners }) => (
  <TableContainer>
    <Table
      head={
        <Table.Row>
          <Table.CellHeader setWidth="20%">Name</Table.CellHeader>
          <Table.CellHeader setWidth="10%">Location</Table.CellHeader>
          <Table.CellHeader setWidth="20%">Prison no.</Table.CellHeader>
          <Table.CellHeader setWidth="20%">Activities</Table.CellHeader>
          <Table.CellHeader setWidth="20%">Other activities</Table.CellHeader>
          <Table.CellHeader setWidth="5%">Attended</Table.CellHeader>
          <Table.CellHeader setWidth="5%">Not attended</Table.CellHeader>
        </Table.Row>
      }
    >
      {missingPrisoners.length === 0 && (
        <Table.Row>
          <Table.Cell colSpan="7">No missing prisoners</Table.Cell>
        </Table.Row>
      )}
      {missingPrisoners.map(prisoner => (
        <Table.Row>
          <Table.Cell>
            <OffenderLink offenderNo={prisoner.offenderNo}>
              <OffenderName firstName={prisoner.firstName} lastName={prisoner.lastName} />
            </OffenderLink>
          </Table.Cell>
          <Table.Cell>
            <Location location={prisoner.cellLocation} />
          </Table.Cell>
          <Table.Cell>{prisoner.offenderNo}</Table.Cell>
          <Table.Cell>{prisoner.activites}</Table.Cell>
          <Table.Cell>{prisoner.otherActivities}</Table.Cell>
          <Table.Cell>{prisoner.attended}</Table.Cell>
          <Table.Cell>{prisoner.notAttended}</Table.Cell>
        </Table.Row>
      ))}
    </Table>
  </TableContainer>
)

MissingPrisoners.propTypes = {
  missingPrisoners: PropTypes.arrayOf(PropTypes.shape({})),
}

MissingPrisoners.defaultProps = {
  missingPrisoners: [],
}

export default MissingPrisoners
