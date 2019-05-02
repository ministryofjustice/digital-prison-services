import React from 'react'
import PropTypes from 'prop-types'
import DateTimeFormatter from '../DateTimeFormatter'

const IepHistory = ({ iepHistory }) => (
  <React.Fragment>
    <table className="row-gutters iep-history">
      <thead>
        <tr className="row-gutters">
          <th className="straight width10">Date and Time</th>
          <th className="straight width10">IEP Description</th>
          <th className="straight width10">Comments</th>
          <th className="straight width10">Establishment</th>
          <th className="straight width10">Staff member</th>
        </tr>
      </thead>
      <tbody>
        {iepHistory.map(row => (
          <tr className="row-gutters" key={row.bookingId}>
            <td className="row-gutters">
              <DateTimeFormatter isoDate={row.iepTime} />
            </td>
            <td className="row-gutters">{row.iepLevel}</td>
            <td className="row-gutters">{row.iepCommentText}</td>
            <td className="row-gutters">{row.agencyId}</td>
            <td className="row-gutters">{row.userId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>
)

IepHistory.propTypes = {
  iepHistory: PropTypes.arrayOf(
    PropTypes.shape({
      iepNo: PropTypes.string,
      iepDescription: PropTypes.string,
      iepCommentText: PropTypes.string,
      iepEstablishment: PropTypes.string,
      iepStaffMember: PropTypes.string,
      iepTime: PropTypes.string,
    })
  ),
}
IepHistory.defaultProps = {
  iepHistory: [],
}

export default IepHistory
