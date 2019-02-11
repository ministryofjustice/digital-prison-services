import * as ActionTypes from '../actions/actionTypes'

// const initialState = {
//   isFetching: false,
//   hasErrored: false,
//   establishments: [],
// }

// export default function authority(state = initialState, action) {
//   switch (action.type) {
//     case 'FETCH_AUTHORITY_REQUEST':
//       return {
//         isFetching: true,
//         hasErrored: false,
//       }
//     case 'FETCH_AUTHORITY_ERROR':
//       return {
//         isFetching: false,
//         hasErrored: true,
//       }
//     case 'FETCH_AUTHORITY_SUCCESS':
//       return {
//         isFetching: false,
//         hasErrored: false,
//         establishments: action.establishments,
//       }
//     default:
//       return state
//   }
// }

const initialState = {
  loading: false,
  links: [],
  entries: [],
}

export default function content(state = initialState, action) {
  switch (action.type) {
    case ActionTypes.FETCH_CONTENT_LINKS:
      return {
        ...state,
        links: action.payload,
      }
    case ActionTypes.CONTENT_LOADING:
      return {
        ...state,
        loading: action.isLoading,
      }
    case ActionTypes.FETCH_CONTENT:
      return {
        ...state,
        entries: [...state.entries, action.payload],
        loading: false,
      }
    default:
      return state
  }
}

// reducer for getting page content
// reducers for getting links to content
