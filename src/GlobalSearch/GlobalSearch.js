import React from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import links from '../links'
import GlobalSearchResultList from './GlobalSearchResultList'

const GlobalSearch = props => (
  <div>
    <div className="padding-top">
      <a title="Home" className="link" href={links.getHomeLink()}>
        Home
      </a>
      <span> &gt; </span>
      Global search results
    </div>
    <h1 className="heading-large">Global search results</h1>
    {/* TODO: 'search again' component goes here */}
    <GlobalSearchResultList {...props} />
  </div>
)

export default GlobalSearch
