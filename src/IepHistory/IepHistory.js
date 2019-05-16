import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Table from '@govuk-react/table'
import { H2 } from '@govuk-react/heading'
import { LargeScreenOnly, SmallScreenOnly } from '../Components/sizing'

const IepHistory = ({ results }) => (
  <>
    <H2>IEP history</H2>
    <LargeScreenOnly>
      <Table className="results">
        <Table.Row>
          <Table.CellHeader>Date and Time</Table.CellHeader>
          <Table.CellHeader>IEP Description</Table.CellHeader>
          <Table.CellHeader>Reason</Table.CellHeader>
          <Table.CellHeader>Establishment</Table.CellHeader>
          <Table.CellHeader>Staff member</Table.CellHeader>
        </Table.Row>
        {results.map(row => (
          <Table.Row key={row.iepTime}>
            <Table.Cell>{row.formattedTime}</Table.Cell>
            <Table.Cell>{row.iepLevel}</Table.Cell>
            <Table.Cell>{row.comments || '\u2014'}</Table.Cell>
            <Table.Cell>{row.iepEstablishment}</Table.Cell>
            <Table.Cell>{row.iepStaffMember || '\u2014'}</Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </LargeScreenOnly>
    <SmallScreenOnly>
      <Table>
        <Table.Row>
          <Table.CellHeader>Date and Time</Table.CellHeader>
          <Table.CellHeader>IEP Description</Table.CellHeader>
          <Table.CellHeader>Establishment</Table.CellHeader>
        </Table.Row>
        {results.map(row => (
          <Table.Row key={row.iepTime}>
            <Table.Cell>{row.formattedTime}</Table.Cell>
            <Table.Cell>{row.iepLevel}</Table.Cell>
            <Table.Cell>{row.iepEstablishment}</Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </SmallScreenOnly>
  </>
)

IepHistory.propTypes = {
  results: PropTypes.arrayOf(
    PropTypes.shape({
      comments: PropTypes.string,
      iepEstablishment: PropTypes.string.isRequired,
      iepStaffMember: PropTypes.string,
      iepTime: PropTypes.string.isRequired,
      formattedTime: PropTypes.string.isRequired,
    })
  ).isRequired,
}

const mapStateToProps = state => ({
  results: state.iepHistory.results,
})

export default connect(mapStateToProps)(IepHistory)
