import React from 'react'
import Spinner from '../../Spinner'

const withLoading = WrappedComponent => {
  const Component = props => {
    if (props.loading) return <Spinner />
    return <WrappedComponent {...props} />
  }

  return Component
}

export default withLoading

// const higherOrderComponent = (WrappedComponent) => {
//   class HOC extends React.Component {
//     render() {
//       return <WrappedComponent />;
//     }
//   }

//   return HOC;
// };
