// Probably a good candidate for new-nomis-shared if used elsewhere
import React from 'react'
import PropTypes from 'prop-types'

import MultiChoice from '@govuk-react/multi-choice'
import Radio from '@govuk-react/radio'
import styled from 'styled-components'
import { SPACING } from '@govuk-react/constants'

const ImageContainer = styled.img`
  margin-left: ${SPACING.SCALE_2};
  vertical-align: middle;
  width: 20%;
`

const RadioGroup = ({ label, hint, options, inline, input, meta }) => (
  <MultiChoice label={label} hint={hint} meta={meta} mb={6}>
    {options.map(o => (
      <div key={o.value}>
        <Radio {...input} value={o.value} inline={inline} checked={o.value === input.value}>
          {o.title}
          {o.image && <ImageContainer src={`/static/images/${o.image}`} alt="" />}
        </Radio>
      </div>
    ))}
  </MultiChoice>
)

RadioGroup.defaultProps = {
  input: {},
  meta: {},
  label: undefined,
  hint: undefined,
  inline: false,
  options: [],
}

RadioGroup.propTypes = {
  input: PropTypes.shape({}),
  meta: PropTypes.shape({}),
  label: PropTypes.string,
  hint: PropTypes.string,
  inline: PropTypes.bool,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      value: PropTypes.string,
    })
  ),
}

export default RadioGroup
