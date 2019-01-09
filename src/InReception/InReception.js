import React from 'react'
import PropTypes from 'prop-types'
import SortableColumn from '../tablesorting/SortableColumn'
import { LAST_NAME } from '../tablesorting/sortColumns'
import OffenderLink from '../OffenderLink'
import OffenderImage from '../OffenderImage'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import Flags from '../FullFlags/Flags'
import SortLov from '../tablesorting/SortLov'

const InReception = ({ sortOrder, setColumnSort, rows }) => (
  <React.Fragment>
    <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
    <table>
      <thead>
        <tr>
          <th className="straight width10" />
          <th className="straight width15">
            <SortableColumn
              heading="Name"
              column={LAST_NAME}
              sortOrder={sortOrder}
              setColumnSort={setColumnSort}
              sortColumn={LAST_NAME}
            />
          </th>
          <th className="straight width10">Prison no.</th>
          <th className="straight width10">D.O.B.</th>
          <th className="straight width15"> Received from </th>
          <th className="straight width10">IEP </th>
          <th className="straight width25">Flags</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(row => (
          <tr className="row-gutters" key={row.offenderNo}>
            <td className="row-gutters">
              <OffenderLink offenderNo={row.offenderNo}>
                <OffenderImage offenderNo={row.offenderNo} />
              </OffenderLink>
            </td>
            <td className="row-gutters">
              <OffenderLink offenderNo={row.offenderNo}>
                <OffenderName lastName={row.lastName} firstName={row.firstName} />
              </OffenderLink>
            </td>
            <td className="row-gutters">{row.offenderNo}</td>
            <td className="row-gutters">
              <DateFormatter isoDate={row.dateOfBirth} />
            </td>
            <td> {row.fromAgencyDescription} </td>
            <td> {row.iepLevel} </td>
            <td className="row-gutters">
              <Flags offenderNo={row.offenderNo} alerts={row.alerts} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </React.Fragment>
)

InReception.defaultProps = {
  sortOrder: '',
  setColumnSort: () => {},
  rows: [],
}

InReception.propTypes = {
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      fromAgencyDescription: PropTypes.string,
      dateOfBirth: PropTypes.string.isRequired,
      alerts: PropTypes.arrayOf(PropTypes.string),
      iepLevel: PropTypes.string,
    })
  ),
}

export default InReception
