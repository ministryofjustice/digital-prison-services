import React from 'react'
import renderer from 'react-test-renderer'
import 'jest-styled-components'
import { BREAKPOINTS } from '@govuk-react/constants'
import { SmallScreenOnly, LargeScreenOnly } from './sizing'

describe('<LargeScreenOnly />', () => {
  it('Renders correctly at different sizes', () => {
    const elem = renderer.create(<LargeScreenOnly />).toJSON()
    expect(elem).toHaveStyleRule('display', 'none')
    expect(elem).toHaveStyleRule('display', 'block', {
      media: `only screen and (min-width: ${BREAKPOINTS.TABLET})`,
    })
  })
})

describe('<SmallScreenOnly />', () => {
  it('Renders correctly at different sizes', () => {
    const elem = renderer.create(<SmallScreenOnly />).toJSON()
    expect(elem).toHaveStyleRule('display', 'block')
    expect(elem).toHaveStyleRule('display', 'none', {
      media: `only screen and (min-width: ${BREAKPOINTS.TABLET})`,
    })
  })
})
