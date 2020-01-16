import React from 'react'
import PropTypes from 'prop-types'
import GridRow from '@govuk-react/grid-row'
import GridCol from '@govuk-react/grid-col'
import SortableColumn from '../tablesorting/SortableColumn'
import OffenderName from '../OffenderName'
import DateFormatter from '../DateFormatter'
import OffenderLink from '../OffenderLink'
import OffenderImage from '../OffenderImage'
import SortLov from '../tablesorting/SortLov'
import Location from '../Location'
import { LAST_NAME } from '../tablesorting/sortColumns'
import Flags from '../FullFlags/Flags'
import './CurrentlyOut.scss'

const CurrentlyOut = ({ rows, sortOrder, setColumnSort }) => (
  <>
    <GridRow>
      <GridCol setWidth="one-quarter">
        <SortLov sortColumns={[LAST_NAME]} sortColumn={LAST_NAME} sortOrder={sortOrder} setColumnSort={setColumnSort} />
      </GridCol>
    </GridRow>
    <table className="currently-out">
      <thead>
        <tr>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <th className="straight width10" />
          <th className="straight width10">
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
          <th className="straight width10">Location</th>
          <th className="straight width10">Incentive Level</th>
          <th className="straight width15">Flags</th>
          <th className="straight width10">Current location</th>
          <th className="straight width15">Comment</th>
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
            <td className="row-gutters">
              <Location location={row.location} />
            </td>
            <td className="row-gutters">{row.iepLevel}</td>
            <td className="row-gutters">
              <Flags offenderNo={row.offenderNo} alerts={row.alerts} category={row.category} />
            </td>
            <td className="row-gutters">{row.toAgencyDescription || row.toCity}</td>
            <td className="row-gutters">{row.commentText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)

CurrentlyOut.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      offenderNo: PropTypes.string.isRequired,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
      movementTime: PropTypes.string,
      fromAgencyDescription: PropTypes.string,
      alerts: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
      category: PropTypes.string,
      toCity: PropTypes.string,
    })
  ),
  sortOrder: PropTypes.string,
  setColumnSort: PropTypes.func,
}
CurrentlyOut.defaultProps = {
  rows: [],
  sortOrder: '',
  setColumnSort: () => {},
}

export default CurrentlyOut
