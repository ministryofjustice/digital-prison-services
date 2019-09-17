import React from 'react'
import styled from 'styled-components'
import Modal from 'react-modal'
import PropTypes from 'prop-types'

const StyledModal = styled(Modal)`
  background: rgb(255, 255, 255);
  padding: 30px;

  @media screen {
    position: absolute;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    border: 5px solid black;
    overflow: auto scroll;
    border-radius: 4px;
    outline: none;
    width: 90%;
    max-width: 600px;
    max-height: 95vh;
    transform: translate(-50%, -50%);
  }

  @media print {
    height: 100%;
  }
`

const otherModalStyles = {
  overlay: {
    background: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
}

if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root')

const ModalContainer = ({ isOpen, showModal, ...props }) => {
  const closeModal = () => showModal(false)

  return (
    <StyledModal
      isOpen={isOpen}
      onRequestClose={closeModal}
      style={otherModalStyles}
      shouldCloseOnOverlayClick={false}
      {...props}
    />
  )
}

ModalContainer.propTypes = {
  isOpen: PropTypes.func.isRequired,
  showModal: PropTypes.func.isRequired,
}

export default ModalContainer
