import createFlags from 'flag'
import { createReduxBindings } from 'flag/redux'

const { FlagsProvider, Flag } = createFlags()

const { setFlagsAction, createFlagsReducer, ConnectedFlagsProvider } = createReduxBindings(FlagsProvider)

export { Flag, setFlagsAction, createFlagsReducer, ConnectedFlagsProvider }
