import React from 'react'
import ShallowRenderer from 'react-test-renderer/shallow'
import { OffenderBreadcrumb } from './OffenderBreadcrumb'

describe('Offender Breadcrumb', () => {
  it('should render correctly when values are present', () => {
    const match = { params: { offenderNo: 'AAAA111222' } }
    const renderer = new ShallowRenderer()
    renderer.render(<OffenderBreadcrumb match={match} firstName="Bob" lastName="Smith" />)
    expect(renderer.getRenderOutput()).toEqual(<a href="/prisoner/AAAA111222">Smith, Bob</a>)
  })

  it('should render correctly when values are not present', () => {
    const match = { params: { offenderNo: 'AAAA111222' } }
    const renderer = new ShallowRenderer()
    renderer.render(<OffenderBreadcrumb match={match} />)
    expect(renderer.getRenderOutput()).toEqual(<span>Unknown</span>)
  })
})
