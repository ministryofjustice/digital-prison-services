import PropTypes from 'prop-types'
import moment from 'moment'

const ageFromIsoDate = dateOfBirth => {
  const dob = moment(dateOfBirth, 'YYYY-MM-DD')
  return moment().diff(dob, 'years')
}

const Index = props => {
  const { dateOfBirth } = props
  if (!dateOfBirth) return ''
  return ageFromIsoDate(dateOfBirth)
}

Index.propTypes = {
  dateOfBirth: PropTypes.string,
}

export default Index

export { ageFromIsoDate }
