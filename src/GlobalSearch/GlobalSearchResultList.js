import React from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import './GlobalSearch.scss'
import PropTypes from 'prop-types'
import { getOffenderLink } from '../links'
import PreviousNextNavigation from '../PreviousNextNavigation'
import { properCaseName } from '../utils'

const GlobalSearchResultList = ({
  agencyId,
  data,
  pageSize,
  pageNumber,
  totalRecords,
  handlePageAction,
  licencesUser,
  licencesUrl,
  searchPerformed,
}) => {
  const headings = (
    <tr>
      <th className="straight" />
      <th className="straight">Name</th>
      <th className="straight">Prison&nbsp;no.</th>
      <th className="straight">Date of birth</th>
      <th className="straight">Location</th>
      <th className="straight">Actual working name</th>
      {licencesUser && <th className="straight" />}
    </tr>
  )

  const offenderImageUrl = offenderNo => `/app/images/${offenderNo}/data`

  const offenders =
    data &&
    data.map(prisoner => (
      <tr key={`${prisoner.offenderNo}-${prisoner.uiId}`} className="row-gutters">
        <td className="row-gutters">
          {prisoner.latestLocationId === agencyId ? (
            <a
              id={`imageLink-${prisoner.offenderNo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
              href={getOffenderLink(prisoner.offenderNo)}
            >
              <img
                id={`image-${prisoner.offenderNo}`}
                alt={`prisoner ${prisoner.offenderNo}`}
                className="photo clickable"
                src={offenderImageUrl(prisoner.offenderNo)}
              />
            </a>
          ) : (
            <img
              alt={`prisoner ${prisoner.offenderNo}`}
              id={`image-${prisoner.offenderNo}`}
              className="photo clickable"
              src={offenderImageUrl(prisoner.offenderNo)}
            />
          )}
        </td>
        {prisoner.latestLocationId === agencyId ? (
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
        <td className="row-gutters">
          {properCaseName(prisoner.currentWorkingLastName)}, {properCaseName(prisoner.currentWorkingFirstName)}
        </td>
        {licencesUser && (
          <td className="row-gutters">
            <a
              href={`${licencesUrl}hdc/taskList/${prisoner.latestBookingId}`}
              className="clear-filters link clickable toLicences"
            >
              Update licence
            </a>
          </td>
        )}
      </tr>
    ))

  const pagination = { perPage: pageSize, pageNumber }
  const noResultsText = searchPerformed ? 'No prisoners found' : 'Use the search box above'

  return (
    <div>
      <table className="row-gutters">
        <thead>{headings}</thead>
        <tbody>{offenders}</tbody>
      </table>
      {(!offenders || offenders.length === 0) && (
        <div className="font-small padding-top-large padding-bottom padding-left">{noResultsText}</div>
      )}
      <div>
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
      uiId: PropTypes.string,
    })
  ).isRequired,
  pageNumber: PropTypes.number.isRequired,
  pageSize: PropTypes.number.isRequired,
  totalRecords: PropTypes.number.isRequired,
  licencesUser: PropTypes.bool.isRequired,
  licencesUrl: PropTypes.string.isRequired,
  searchPerformed: PropTypes.bool.isRequired,
}

export default GlobalSearchResultList
