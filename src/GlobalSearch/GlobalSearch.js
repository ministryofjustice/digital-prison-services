import React from 'react'
import '../index.scss'
import '../lists.scss'
import '../App.scss'
import GlobalSearchResultList from './GlobalSearchResultList'
import GlobalSearchForm from './GlobalSearchForm'

const GlobalSearch = props => (
  <div>
    <GlobalSearchForm {...props} />
    <GlobalSearchResultList {...props} />
  </div>
)

export default GlobalSearch
