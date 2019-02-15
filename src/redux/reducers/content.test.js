import reducer from './content'
import * as ActionTypes from '../actions/actionTypes'

describe('Content reducer', () => {
  const initialState = {
    entries: [],
  }

  it('should return the initial state', () => {
    expect(reducer(undefined, {})).toEqual(initialState)
  })

  it('should handle SET_CONTENT_SUCCESS', () => {
    const action = {
      payload: {
        title: 'Content test',
        path: 'content-test',
        category: 'footer',
        body: 'Content body',
      },
    }
    expect(
      reducer(initialState, {
        type: ActionTypes.SET_CONTENT_SUCCESS,
        payload: action.payload,
      })
    ).toEqual({
      entries: [action.payload],
    })
  })

  it('should handle SET_CONTENT_SUCCESS if another page has been visited previously', () => {
    const previouslyLoadedContent = {
      payload: {
        title: 'Previous content',
        path: 'previous-content',
        category: 'meta',
        body: 'Previous content body',
      },
    }

    initialState.entries.push(previouslyLoadedContent)

    const action = {
      payload: {
        title: 'Content',
        path: 'content',
        category: 'footer',
        body: 'Content body',
      },
    }
    expect(
      reducer(initialState, {
        type: ActionTypes.SET_CONTENT_SUCCESS,
        payload: action.payload,
      })
    ).toEqual({
      entries: [previouslyLoadedContent, action.payload],
    })
  })
})
