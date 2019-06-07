import React from 'react'
import PropTypes from 'prop-types'
import Table from '@govuk-react/table'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import pathToRegexp from 'path-to-regexp'
import routePaths from '../../routePaths'
import { Flag } from '../../flags'

import { LargeScreenOnly, SmallScreenOnly } from '../../Components/sizing'

import PreviousNextNavigation from '../../PreviousNextNavigation'
import ResultsFilter from '../../Components/ResultsFilter'

const adjudicationPath = pathToRegexp.compile(routePaths.adjudication)

const AdjudicationLink = ({ offenderNo, adjudicationNo }) => (
  <Flag
    name={['adjudicationDetailsLinkEnabled']}
    render={() => (
      <Link to={adjudicationPath({ offenderNo, adjudicationNo })} className="link">
        {adjudicationNo}
      </Link>
    )}
    fallbackRender={() => <>{adjudicationNo}</>}
  />
)

AdjudicationLink.propTypes = {
  offenderNo: PropTypes.string.isRequired,
  adjudicationNo: PropTypes.number.isRequired,
}

export const AdjudicationHistoryTable = ({
  offenderNo,
  results,
  totalRecords,
  pageSize,
  pageNumber,
  changePerPage,
  changePage,
}) => (
  <>
    <ResultsFilter perPage={pageSize} pageNumber={pageNumber} totalResults={totalRecords} noBorder>
      <ResultsFilter.PerPageDropdown handleChange={changePerPage} totalResults={totalRecords} perPage={pageSize} />
    </ResultsFilter>

    <LargeScreenOnly>
      <Table
        className="results"
        head={
          <Table.Row>
            <Table.CellHeader setWidth="10%">Adjudication number</Table.CellHeader>
            <Table.CellHeader setWidth="15%">Report date and time</Table.CellHeader>
            <Table.CellHeader setWidth="20%">Establishment</Table.CellHeader>
            <Table.CellHeader setWidth="45%">Offence description</Table.CellHeader>
            <Table.CellHeader setWidth="10%">Finding</Table.CellHeader>
          </Table.Row>
        }
      >
        {results.map(result => (
          <Table.Row key={result.adjudicationNumber}>
            <Table.Cell>
              <AdjudicationLink offenderNo={offenderNo} adjudicationNo={result.adjudicationNumber} />
            </Table.Cell>
            <Table.Cell>{`${result.reportDate} ${result.reportTime}`}</Table.Cell>
            <Table.Cell>{result.establishment}</Table.Cell>
            <Table.Cell>{result.offenceDescription}</Table.Cell>
            <Table.Cell>{result.findingDescription}</Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </LargeScreenOnly>
    <SmallScreenOnly>
      <Table
        className="results"
        head={
          <Table.Row>
            <Table.CellHeader>Adjudication Number</Table.CellHeader>
            <Table.CellHeader>Report date</Table.CellHeader>
            <Table.CellHeader>Finding</Table.CellHeader>
          </Table.Row>
        }
      >
        {results.map(result => (
          <Table.Row key={result.adjudicationNumber}>
            <Table.Cell>
              <AdjudicationLink offenderNo={offenderNo} adjudicationNo={result.adjudicationNumber} />
            </Table.Cell>
            <Table.Cell>{result.reportDate}</Table.Cell>
            <Table.Cell>{result.findingDescription}</Table.Cell>
          </Table.Row>
        ))}
      </Table>
    </SmallScreenOnly>

    <div>
      <PreviousNextNavigation
        pagination={{ perPage: pageSize, pageNumber }}
        totalRecords={totalRecords}
        pageAction={changePage}
      />
    </div>
  </>
)

AdjudicationHistoryTable.propTypes = {
  totalRecords: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  pageNumber: PropTypes.number.isRequired,
  offenderNo: PropTypes.string.isRequired,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      adjudicationNumber: PropTypes.number.isRequired,
      reportDate: PropTypes.string.isRequired,
      reportTime: PropTypes.string.isRequired,
      establishment: PropTypes.string.isRequired,
      offenceDescription: PropTypes.string.isRequired,
      findingDescription: PropTypes.string,
    })
  ).isRequired,
  changePerPage: PropTypes.func.isRequired,
  changePage: PropTypes.func.isRequired,
}

AdjudicationHistoryTable.defaultProps = {
  offenderNo: null,
}

const mapStateToProps = state => ({
  results: state.adjudicationHistory.results,
  totalRecords: state.adjudicationHistory.totalRecords,
  pageSize: state.adjudicationHistory.pageSize,
  pageNumber: state.adjudicationHistory.pageNumber,
})

export default connect(mapStateToProps)(AdjudicationHistoryTable)
