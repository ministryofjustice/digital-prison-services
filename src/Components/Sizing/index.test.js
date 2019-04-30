import React from 'react'
import renderer from 'react-test-renderer'
import 'jest-styled-components'
import { BREAKPOINTS } from '@govuk-react/constants'
import { MobileOnly, DesktopOnly } from '.'

describe('<DesktopOnly />', () => {
  it('Renders correctly at different sizes', () => {
    const elem = renderer.create(<DesktopOnly />).toJSON()
    expect(elem).toHaveStyleRule('display', 'none')
    expect(elem).toHaveStyleRule('display', 'block', { media: `only screen and (min-width: ${BREAKPOINTS.DESKTOP})` })
  })
})

describe('<MobileOnly />', () => {
  it('Renders correctly at different sizes', () => {
    const elem = renderer.create(<MobileOnly />).toJSON()
    expect(elem).toHaveStyleRule('display', 'block')
    expect(elem).toHaveStyleRule('display', 'none', { media: `only screen and (min-width: ${BREAKPOINTS.DESKTOP})` })
  })
})
