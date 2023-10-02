import { feComponentsRoutes } from './getFeComponents'

describe('applicable routes regex', () => {
  test.each`
    path                                        | used
    ${'/prisoner/A12345/cell-move/select-cell'} | ${true}
    ${'/api/anything'}                          | ${false}
    ${'/app/image/prisoner'}                    | ${false}
    ${'/save-backlink/some-page'}               | ${false}
    ${'/other/thing'}                           | ${true}
  `('$path: $used', async ({ path, used }) => {
    expect(feComponentsRoutes.test(path)).toEqual(used)
  })
})
