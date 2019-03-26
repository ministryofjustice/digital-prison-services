import React from 'react'
import renderer from 'react-test-renderer'
import ResultsFilter from '.'

describe('<ResultsFilter />', () => {
  it('should match the default snapshot', () => {
    const tree = renderer.create(<ResultsFilter />).toJSON()

    expect(tree).toMatchSnapshot()
  })

  it('should match the with children snapshot', () => {
    const props = {
      perPage: 20,
      pageNumber: 1,
      totalResults: 100,
    }
    const tree = renderer
      .create(
        <ResultsFilter {...props}>
          <ResultsFilter.PerPageDropdown {...props} handleChange={jest.fn()} />
        </ResultsFilter>
      )
      .toJSON()

    expect(tree).toMatchSnapshot()
  })
})
