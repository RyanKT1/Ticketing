import { useState } from 'react';
import TicketForm from '../components/ticket-form/ticket-form.component';
import { createTicket } from '../services/ticket.services';
import { useAuth } from 'react-oidc-context';
import SuccessModal from '../components/modal/success-modal.component';
import ErrorModal from '../components/modal/error-modal.component';
import { useParams } from 'react-router-dom';

function CreateTicketPage() {
  const { deviceId } = useParams(); // Get the device ID from the URL
  const baseFormData = {
    title: '',
    description: '',
    deviceId: deviceId ?? undefined,
    deviceManufacturer: undefined,
    deviceModel: undefined,
    severity: 5,
  };

  const auth = useAuth();
  const [formData, setFormData] = useState(baseFormData);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalNavigation, setModalNavigation] = useState('/ticket/management');
  const currentPath = window.location.pathname;

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.severity) {
      newErrors.severity = 'Please select a severity level';
    }

    if (!formData.deviceId) {
      if (!formData.deviceManufacturer || !formData.deviceModel) {
        newErrors.deviceId = 'Either Device ID or both Manufacturer and Model are required';
        if (!formData.deviceManufacturer) {
          newErrors.deviceManufacturer = 'Required when Device ID is not provided';
        }
        if (!formData.deviceModel) {
          newErrors.deviceModel = 'Required when Device ID is not provided';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!validateForm()) {
      setModalTitle('Validation Error');
      setModalMessage('Please fix the errors in the form before submitting.');
      setModalNavigation(currentPath);
      setShowErrorModal(true);
      return;
    }

    try {
      await createTicket(formData, auth);
      setFormData(baseFormData);
      setModalTitle('Success');
      setModalMessage('Ticket created successfully!');
      setModalNavigation('/ticket/management');
      setShowSuccessModal(true);
    } catch (error) {
      setModalTitle(error.name || 'Error');
      setModalNavigation(currentPath);
      setModalMessage(error.message || 'Failed to create ticket. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleInputChange = event => {
    const { id, value } = event.target;
    setFormData({
      ...formData,
      [id]: value === '' ? undefined : value,
    });
  };

  const handleSelectChange = event => {
    setFormData({
      ...formData,
      severity: Number(event.target.value),
    });
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <div className="container mt-4">
      <h2>Create New Ticket</h2>

      <TicketForm
        formData={formData}
        errors={errors}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
      />

      <SuccessModal
        title={modalTitle}
        message={modalMessage}
        show={showSuccessModal}
        onClose={closeSuccessModal}
        navigateTo={modalNavigation}
      />

      <ErrorModal
        title={modalTitle}
        message={modalMessage}
        show={showErrorModal}
        onClose={closeErrorModal}
        navigateTo={modalNavigation}
      />
    </div>
  );
}

export default CreateTicketPage;
