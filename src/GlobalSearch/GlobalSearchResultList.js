import React, { Component } from 'react';
import '../index.scss';
import '../lists.scss';
import '../App.scss';
import PropTypes from 'prop-types';
import { getOffenderLink } from "../links";
import PreviousNextNavigation from "../PreviousNextNavigation";
import { properCaseName } from "../utils";

class GlobalSearchResultList extends Component {
  render () {
    const headings = (<tr>
      <th className="straight">Name</th>
      <th className="straight">NOMS&nbsp;ID</th>
      <th className="straight">Date of birth</th>
      <th className="straight">Location</th>
    </tr>);

    const offenders = this.props.data && this.props.data.map((prisoner, index) => {
      return (
        <tr key={prisoner.offenderNo} className="row-gutters">
          {prisoner.agencyId === this.props.agencyId ? <td className="row-gutters">
            <a target="_blank" className="link" href={getOffenderLink(prisoner.offenderNo)}
            >{properCaseName(prisoner.lastName)}, {properCaseName(prisoner.firstName)}</a>
          </td> :
            <td className="row-gutters">{properCaseName(prisoner.lastName)}, {properCaseName(prisoner.firstName)}</td>}
          <td className="row-gutters">{prisoner.offenderNo}</td>
          <td className="row-gutters">{prisoner.dateOfBirth}</td>
          <td className="row-gutters">{prisoner.latestLocation}</td>
        </tr>
      );
    });

    const pagination = { perPage: this.props.pageSize, pageNumber: this.props.pageNumber };
    const totalRecords = this.props.totalRecords;

    return (<div>
      <table className="row-gutters">
        <thead>{headings}</thead>
        <tbody>{offenders}</tbody>
      </table>
      {(!offenders || offenders.length === 0) &&
          <div className="font-small padding-top-large padding-bottom padding-left">No prisoners found</div>
      }
      <div className="pure-u-md-7-12">
        <PreviousNextNavigation pagination={pagination} totalRecords={totalRecords} pageAction={id => { this.props.handlePageAction(id); }} />
      </div>
    </div>);
  }
}

GlobalSearchResultList.propTypes = {
  agencyId: PropTypes.string,
  data: PropTypes.array,
  handlePageAction: PropTypes.func,
  pageNumber: PropTypes.number,
  pageSize: PropTypes.number,
  totalRecords: PropTypes.number
};

export default GlobalSearchResultList;
