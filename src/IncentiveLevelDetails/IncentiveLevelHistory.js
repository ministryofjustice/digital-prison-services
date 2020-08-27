import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Table from '@govuk-react/table'
import { H2 } from '@govuk-react/heading'
import { LargeScreenOnly, SmallScreenOnly } from '../Components/sizing'

const IepHistory = ({ results }) => (
  <>
    <H2>Incentive level history</H2>
    <LargeScreenOnly>
      <Table className="results">
        <Table.Row>
          <Table.CellHeader setWidth="20%">Date and time</Table.CellHeader>
          <Table.CellHeader setWidth="15%">Incentive level</Table.CellHeader>
          <Table.CellHeader setWidth="30%">Reason</Table.CellHeader>
          <Table.CellHeader setWidth="20%">Establishment</Table.CellHeader>
          <Table.CellHeader setWidth="15%">Staff member</Table.CellHeader>
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
          <Table.CellHeader>Date and time</Table.CellHeader>
          <Table.CellHeader>Incentive Level</Table.CellHeader>
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
