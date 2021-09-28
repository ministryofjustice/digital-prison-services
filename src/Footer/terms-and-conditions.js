import React from 'react'
import PropTypes from 'prop-types'

const termsAndConditions = ({ close }) => (
  <div className="container">
    <h1 className="heading-large"> Terms and conditions </h1>

    <div>
      <p>Access to, and use of, this system is restricted to authorized Prison-NOMIS account users only.</p>

      <p>
        All users must read and conform to the Prison-NOMIS Security Operating Procedures, together with any additional
        Security and IT policies from within your organisation which may also apply.
      </p>

      <p>
        You are reminded that this system is protected by a security framework and that all data entered into
        Prison-NOMIS is potentially liable to legal disclosure under the Data Protection Act and/or the Freedom of
        Information Act.
      </p>

      <p>
        All activities undertaken with regard to the Prison-NOMIS system must comply with the requirements of the
        Computer Misuse Act and other relevant data legislation.
      </p>

      <p>Only accurate and relevant information must be entered in Prison-NOMIS.</p>

      <p>
        Unauthorised access or attempts to alter, destroy, damage, disclose or otherwise interfere with the data in
        Prison-NOMIS could result in disciplinary proceedings and / or criminal prosecution.
      </p>
    </div>
    <button type="button" className="button" onClick={close}>
      OK, continue
    </button>
  </div>
)

termsAndConditions.propTypes = {
  close: PropTypes.func.isRequired,
}

export default termsAndConditions
