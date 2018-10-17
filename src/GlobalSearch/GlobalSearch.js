import React, { Component } from 'react';
import '../index.scss';
import '../lists.scss';
import '../App.scss';
import GlobalSearchResultList from "./GlobalSearchResultList";

class GlobalSearch extends Component {
  render () {
    return (<div>
      <h1 className="heading-large whereabouts-title no-print">Global search results</h1>
      {/* TODO: 'search again' component goes here */}
      <GlobalSearchResultList {...this.props} />
    </div>);
  }
}

GlobalSearch.propTypes = {

};

export default GlobalSearch;
