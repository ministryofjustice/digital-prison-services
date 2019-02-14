import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import TimePicker from '../Components/TimePicker/TimePicker'

const OffenderTable = ({ offenders }) => (
  <React.Fragment>
    <table className="row-gutters">
      <thead>
        <tr>
          <th className="straight width5">Prison no.</th>
          <th className="straight width15"> Last name </th>
          <th className="straight width15"> First name </th>
          <th className="straight width15"> Start time </th>
          <th className="straight width15"> Appointment clash </th>
        </tr>
      </thead>
      <tbody>
        {offenders.map(row => (
          <tr className="row-gutters" key={[row.offenderNo].join('_')}>
            <td className="row-gutters">{row.offenderNo}</td>

            <td className="row-gutters">{row.lastName}</td>

            <td className="row-gutters">{row.firstName}</td>

            <td className="row-gutters">
              <TimePicker
                meta={{}}
                input={{ value: '', name: 'StartTime' }}
                title="Start time"
                component={TimePicker}
                date={moment()}
                now={moment()}
                futureTimeOnly
              />
            </td>
            <td />
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>
)

OffenderTable.propTypes = {
  offenders: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    })
  ).isRequired,
}

export default OffenderTable
