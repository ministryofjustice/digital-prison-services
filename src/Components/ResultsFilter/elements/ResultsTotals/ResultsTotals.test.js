import React from 'react'
import renderer from 'react-test-renderer'
import ResultsTotals from './ResultsTotals'

describe('<ResultsTotals />', () => {
  it('should match the default snapshot', () => {
    const tree = renderer.create(<ResultsTotals />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match the first page snapshot', () => {
    const tree = renderer.create(<ResultsTotals perPage={20} pageNumber={0} totalResults={100} />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match the with page number snapshot', () => {
    const tree = renderer.create(<ResultsTotals perPage={20} pageNumber={3} totalResults={100} />).toJSON()

    expect(tree).toMatchSnapshot()
  })
})
