import React from 'react'
import { Link } from 'react-router-dom'

const Dashboard = () => (
  <div>
    <h1 className="heading-large">Prison staff hub</h1>
    <p>You will find access to all services and help from this page</p>

    <h3>Applications</h3>
    <ul>
      <li>
        <a href="https://notm-dev.hmpps.dsd.io">New Nomis</a>
      </li>
      <li>
        <span>Old P-Nomis</span>
      </li>
      <li>
        <a href="https://licences-stage.hmpps.dsd.io">Licence Management</a>
      </li>
      <li>
        <a href="https://omic-dev.hmpps.dsd.io">Key worker Management</a>
      </li>
      <li>
        <Link id="whereabouts_link" title="Whereabouts link" className="link" to="/manage-prisoner-whereabouts">
          Whereabouts
        </Link>
      </li>
    </ul>
  </div>
)

export default Dashboard
