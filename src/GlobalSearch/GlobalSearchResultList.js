import React from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import PropTypes from 'prop-types'
import { getOffenderLink } from '../links'
import PreviousNextNavigation from '../PreviousNextNavigation'
import { properCaseName } from '../utils'

const GlobalSearchResultList = ({ agencyId, data, pageSize, pageNumber, totalRecords, handlePageAction }) => {
  const headings = (
    <tr>
      <th className="straight">Name</th>
      <th className="straight">NOMS&nbsp;ID</th>
      <th className="straight">Date of birth</th>
      <th className="straight">Location</th>
    </tr>
  )

  const offenders =
    data &&
    data.map(prisoner => (
      <tr key={prisoner.offenderNo} className="row-gutters">
        {prisoner.agencyId === agencyId ? (
          <td className="row-gutters">
            <a target="_blank" rel="noopener noreferrer" className="link" href={getOffenderLink(prisoner.offenderNo)}>
              {properCaseName(prisoner.lastName)}, {properCaseName(prisoner.firstName)}
            </a>
          </td>
        ) : (
          <td className="row-gutters">
            {properCaseName(prisoner.lastName)}, {properCaseName(prisoner.firstName)}
          </td>
        )}
        <td className="row-gutters">{prisoner.offenderNo}</td>
        <td className="row-gutters">{prisoner.dateOfBirth}</td>
        <td className="row-gutters">{prisoner.latestLocation}</td>
      </tr>
    ))

  const pagination = { perPage: pageSize, pageNumber }

  return (
    <div>
      <table className="row-gutters">
        <thead>{headings}</thead>
        <tbody>{offenders}</tbody>
      </table>
      {(!offenders || offenders.length === 0) && (
        <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
      )}
      <div className="pure-u-md-7-12">
        <PreviousNextNavigation
          pagination={pagination}
          totalRecords={totalRecords}
          pageAction={id => {
            handlePageAction(id)
          }}
        />
      </div>
    </div>
  )
}

GlobalSearchResultList.propTypes = {
  // props
  handlePageAction: PropTypes.func.isRequired,
  agencyId: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      dateOfBirth: PropTypes.string.isRequired,
      latestLocation: PropTypes.string.isRequired,
      agencyId: PropTypes.string,
    })
  ).isRequired,
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
}

export default GlobalSearchResultList
