/* eslint-disable import/no-extraneous-dependencies */
import { configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import 'regenerator-runtime/runtime'

configure({ adapter: new Adapter() })

global.print = jest.fn()
global.afterPrint = jest.fn()
global.open = jest.fn()
