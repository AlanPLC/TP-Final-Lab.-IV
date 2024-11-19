import React from 'react';
import "../styles/Login/modal.scss"

const Modal = ({isVisible, onClose, children}) => {
    if(!isVisible){
        return null;
    }
  return (
    <div className='modal-overlay'>
        <div className='modal-content'>
            <button className="modal-close" onClick={onClose}>Volver</button>
            {children}
        </div>

    </div>
  );
};

export default Modal;