import { useState, useEffect } from 'react';
import { getDevices, deleteDevice, updateDevice } from '../services/device.services';
import DevicesTable from '../components/device-table/devices-table.component';
import { useAuth } from 'react-oidc-context';
import SuccessModal from '../components/modal/success-modal.component';
import ErrorModal from '../components/modal/error-modal.component';
import ConfirmationModal from '../components/modal/confirmation-modal.component';
import { useNavigate } from 'react-router-dom';
import { isUserAdmin } from '../helpers/auth.helpers';

function DeviceTablePage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState([]);
  const [editDeviceRow, setEditDeviceRow] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const isAdmin = isUserAdmin(auth);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [deviceToDelete, setDeviceToDelete] = useState(null);

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const deviceList = await getDevices(auth);
        setDevices(deviceList || []);
      } catch (error) {
        console.error('Error fetching devices:', error);
        setModalTitle(error.name || 'Error');
        setModalMessage(error.message || 'Failed to fetch devices.');
        setShowErrorModal(true);
        setDevices([]);
      }
    };

    fetchDevices();
  }, [auth]);

  const confirmDeleteDevice = device => {
    setDeviceToDelete(device);
    setModalTitle('Confirm Deletion');
    setModalMessage(`Are you sure you want to delete the device "${device.name}"?`);
    setShowConfirmationModal(true);
  };

  const handleDeleteDevice = async () => {
    if (!deviceToDelete) return;

    try {
      await deleteDevice(deviceToDelete.id, auth);
      setDevices(devices.filter(device => device.id !== deviceToDelete.id));
      setModalTitle('Success');
      setModalMessage('Device deleted successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting device:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to delete device. Please try again.');
      setShowErrorModal(true);
    }

    setDeviceToDelete(null);
  };

  const handleUpdateClick = (event, device) => {
    event.preventDefault();
    setEditDeviceRow(device.id);
    setEditFormData({
      name: device.name,
      manufacturer: device.manufacturer,
      model: device.model,
      createdAt: device.createdAt,
      updatedAt: device.updatedAt,
    });
  };

  const handleEditInputChange = event => {
    event.preventDefault();
    const { name, value } = event.target;
    setEditFormData({
      ...editFormData,
      [name]: value,
    });
  };

  const handleEditFormSubmit = async event => {
    event.preventDefault();
    try {
      await updateDevice(editDeviceRow, editFormData, auth);
      const updatedDevices = devices.map(device =>
        device.id === editDeviceRow ? { ...device, ...editFormData } : device
      );

      setDevices(updatedDevices || []);
      setEditDeviceRow(null);
      setEditFormData({});
      setModalTitle('Success');
      setModalMessage('Device updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating device:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to update device. Please try again.');
      setShowErrorModal(true);
    }
  };

  const handleCancelClick = () => {
    setEditDeviceRow(null);
    setEditFormData({});
  };

  const handleCreateTicket = async device => {
    navigate(`/ticket/create/${device.id}`);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
    setDeviceToDelete(null);
  };

  return (
    <div>
      {devices.length === 0 ? (
        <div className="text-center mt-5">
          <h3>No devices found</h3>
          <p>There are no devices available.</p>
        </div>
      ) : (
        <DevicesTable
          deviceList={devices}
          editDeviceRow={editDeviceRow}
          editFormData={editFormData}
          handleDeleteDevice={confirmDeleteDevice}
          handleUpdateClick={handleUpdateClick}
          handleEditInputChange={handleEditInputChange}
          handleEditFormSubmit={handleEditFormSubmit}
          handleCancelClick={handleCancelClick}
          handleCreateTicket={handleCreateTicket}
          isAdmin={isAdmin}
        />
      )}

      <SuccessModal
        title={modalTitle}
        message={modalMessage}
        show={showSuccessModal}
        onClose={closeSuccessModal}
        navigateTo="/device/table"
      />

      <ErrorModal
        title={modalTitle}
        message={modalMessage}
        show={showErrorModal}
        onClose={closeErrorModal}
        navigateTo="/device/table"
      />

      <ConfirmationModal
        title={modalTitle}
        message={modalMessage}
        show={showConfirmationModal}
        onClose={closeConfirmationModal}
        onConfirm={handleDeleteDevice}
      />
    </div>
  );
}

export default DeviceTablePage;
