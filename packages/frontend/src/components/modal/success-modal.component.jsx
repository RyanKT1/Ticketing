import { Button, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function SuccessModal({ title, message, show, onClose, navigateTo = '/' }) {
  const navigate = useNavigate();

  const handleConfirm = () => {
    onClose();
    navigate(navigateTo);
  };

  return (
    <Modal centered show={show} onHide={onClose} backdrop="static" keyboard={false}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>{message}</p>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="success" onClick={handleConfirm}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default SuccessModal;
