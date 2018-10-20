import React from "react";
import "../index.scss";
import "../lists.scss";
import "../App.scss";
import GlobalSearchResultList from "./GlobalSearchResultList";

const GlobalSearch = props => {
  return (
    <div>
      <h1 className="heading-large whereabouts-title no-print">Global search results</h1>
      {/* TODO: 'search again' component goes here */}
      <GlobalSearchResultList {...props} />
    </div>
  );
};

export default GlobalSearch;
