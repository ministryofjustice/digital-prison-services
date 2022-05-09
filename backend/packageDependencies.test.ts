import fs from 'fs'

describe('app insights compatibility', () => {
  const packageData = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))
  it('uses bunyan v1', () => {
    // See https://github.com/Microsoft/node-diagnostic-channel/blob/master/src/diagnostic-channel-publishers/README.md
    // eslint-disable-next-line no-useless-escape
    expect(packageData.dependencies.bunyan).toMatch(/[^\.]1\..*/)
  })
  it('uses redis v3', () => {
    // Don't update redis to v4 until the compatibility issues with Node 16 are worked out.
    // See here: https://github.com/redis/node-redis/issues/2095 and here for Andy Lee's fix https://github.com/ministryofjustice/hmpps-template-typescript/pull/84
    // eslint-disable-next-line no-useless-escape
    expect(packageData.dependencies.redis).toMatch(/[^\.]3\..*/)
  })
})
