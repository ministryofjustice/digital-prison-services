import React from 'react'
import Modal from 'react-modal'

const modalStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    width: '90%',
    maxWidth: '600px',
    transform: 'translate(-50%, -50%)',
    border: '5px solid black',
    padding: '30px',
  },
  overlay: {
    background: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
}

if (process.env.NODE_ENV !== 'test') Modal.setAppElement('#root')

const ModalContainer = ({ isOpen, closeModal, ...props }) => (
  <Modal isOpen={isOpen} onRequestClose={closeModal} style={modalStyles} shouldCloseOnOverlayClick={false} {...props} />
)

export default ModalContainer
