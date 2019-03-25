import React from 'react'
import renderer from 'react-test-renderer'
import 'jest-styled-components'
import { BREAKPOINTS } from '@govuk-react/constants'
import { StyledImage } from './OffenderImage'

test('renders with the correct styles', () => {
  const tree = renderer.create(<StyledImage />).toJSON()
  expect(tree).toMatchSnapshot()
  expect(tree).toHaveStyleRule('max-width', '70px')
  expect(tree).toHaveStyleRule('max-width', '90px', { media: `(min-width: ${BREAKPOINTS.DESKTOP})` })
})
