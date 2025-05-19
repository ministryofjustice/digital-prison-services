/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import 'regenerator-runtime/runtime'
import { TextEncoder, TextDecoder } from 'util'

configure({ adapter: new Adapter() })

global.print = jest.fn()
global.afterPrint = jest.fn()
global.open = jest.fn()

process.env.USE_OF_FORCE_URL = '//useOfForceUrl'
process.env.USE_OF_FORCE_PRISONS = 'LEI'

jest.mock('nanoid', () => ({
  nanoid: () => {},
}))

if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder
}
if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder
}
