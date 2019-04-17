import { extractSubLocations } from './ResultsHouseblockContainer'

describe('extractSubLocations', () => {
  it('should handle no locations', () => {
    expect(extractSubLocations([], 'x')).toEqual([])
  })

  it('should handle absent location', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, no children field', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x' }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, undefined children field', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x', children: undefined }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location, empty children', () => {
    expect(extractSubLocations([{ key: 'a' }, { key: 'x', children: [] }, { key: 'b' }], 'x')).toEqual([])
  })

  it('should handle matching location with children', () => {
    expect(
      extractSubLocations([{ key: 'a' }, { key: 'x', children: [{ key: 'xx' }, { key: 'yy' }] }, { key: 'b' }], 'x')
    ).toEqual([{ key: 'xx' }, { key: 'yy' }])
  })
})
