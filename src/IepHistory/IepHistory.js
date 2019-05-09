import React from 'react'
import PropTypes from 'prop-types'
import Table from '@govuk-react/table'

const IepHistory = ({ iepHistory }) => (
  <Table caption="IEP history">
    <Table.Row>
      <Table.CellHeader>Date and Time</Table.CellHeader>
      <Table.CellHeader>IEP Description</Table.CellHeader>
      <Table.CellHeader>Comments</Table.CellHeader>
      <Table.CellHeader>Establishment</Table.CellHeader>
      <Table.CellHeader>Staff member</Table.CellHeader>
    </Table.Row>
    {iepHistory.map(row => (
      <Table.Row key={row.iepTime}>
        <Table.Cell>{row.formattedTime}</Table.Cell>
        <Table.Cell>{row.iepLevel}</Table.Cell>
        <Table.Cell>{row.comments || '\u2014'}</Table.Cell>
        <Table.Cell>{row.iepEstablishment}</Table.Cell>
        <Table.Cell>{row.iepStaffMember || '\u2014'}</Table.Cell>
      </Table.Row>
    ))}
  </Table>
)

IepHistory.propTypes = {
  iepHistory: PropTypes.arrayOf(
    PropTypes.shape({
      iepDescription: PropTypes.string.isRequired,
      comments: PropTypes.string,
      iepEstablishment: PropTypes.string.isRequired,
      iepStaffMember: PropTypes.string,
      iepTime: PropTypes.string.isRequired,
      formattedTime: PropTypes.string.isRequired,
    })
  ),
}
IepHistory.defaultProps = {
  iepHistory: [],
}

export default IepHistory
