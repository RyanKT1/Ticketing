import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';
import TicketInfo from '../components/ticket-info/ticket-info.component';
import TicketForm from '../components/ticket-form/ticket-form.component';
import { createMessage, deleteMessage, getMessages } from '../services/message.services';
import { getTicket, updateTicket, deleteTicket } from '../services/ticket.services';
import SuccessModal from '../components/modal/success-modal.component';
import ErrorModal from '../components/modal/error-modal.component';
import ConfirmationModal from '../components/modal/confirmation-modal.component';
import { isUserAdmin } from '../helpers/auth.helpers';

function TicketPage() {
  const auth = useAuth();
  const { id } = useParams(); // Get the ticket ID from the URL
  const [messages, setMessages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshMessages, setRefreshMessages] = useState(0);
  const isAdmin = isUserAdmin(auth);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true);
      try {
        const fetchedTicket = await getTicket(id, auth);
        setTicket(fetchedTicket);
      } catch (error) {
        console.error('Error fetching ticket:', error);
        setModalTitle(error.name || 'Error');
        setModalMessage(error.message || 'Failed to load ticket.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, auth]);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!ticket || !ticket.id) return;

      try {
        const fetchedMessages = await getMessages(ticket.id, auth);
        setMessages(fetchedMessages || []);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setModalTitle(error.name || 'Error');
        setModalMessage(error.message || 'Failed to load messages. Please try again later.');
        setShowErrorModal(true);
      }
    };

    fetchMessages();
  }, [ticket, refreshMessages, auth]);

  const handleEditClick = () => {
    if (!ticket) return;

    setEditFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      deviceId: ticket.deviceId || undefined,
      deviceManufacturer: ticket.deviceManufacturer || '',
      deviceModel: ticket.deviceModel || '',
      severity: ticket.severity || 5,
      resolved: ticket.resolved || false,
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setFormErrors({});
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editFormData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!editFormData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!editFormData.severity) {
      newErrors.severity = 'Please select a severity level';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async event => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await updateTicket(
        ticket.id,
        {
          title: editFormData.title,
          description: editFormData.description,
          deviceId: editFormData.deviceId,
          deviceManufacturer: editFormData.deviceManufacturer,
          deviceModel: editFormData.deviceModel,
          severity: editFormData.severity,
          resolved: editFormData.resolved,
        },
        auth
      );

      setTicket({
        ...ticket,
        title: editFormData.title,
        description: editFormData.description,
        deviceId: editFormData.deviceId,
        deviceManufacturer: editFormData.deviceManufacturer,
        deviceModel: editFormData.deviceModel,
        severity: editFormData.severity,
        resolved: editFormData.resolved,
        updatedAt: new Date(),
      });

      setIsEditing(false);
      setModalTitle('Success');
      setModalMessage('Ticket updated successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error updating ticket:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to update ticket. Please try again later.');
      setShowErrorModal(true);
    }
  };

  const handleInputChange = event => {
    const { id, value } = event.target;
    const newValue = id === 'resolved' ? value === 'true' || value === true : value;

    setEditFormData({
      ...editFormData,
      [id]: newValue,
    });
  };

  const handleSelectChange = event => {
    setEditFormData({
      ...editFormData,
      severity: Number(event.target.value),
    });
  };

  const confirmDeleteTicket = () => {
    setModalTitle('Confirm Deletion');
    setModalMessage('Are you sure you want to delete this ticket? This action cannot be undone.');
    setShowConfirmationModal(true);
  };

  const handleDeleteTicket = async () => {
    try {
      await deleteTicket(ticket.id, auth);
      setModalTitle('Success');
      setModalMessage('Ticket deleted successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error deleting ticket:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to delete ticket. Please try again later.');
      setShowErrorModal(true);
    }
  };

  const handleDeleteMessage = async messageId => {
    try {
      await deleteMessage(messageId, auth);
      setMessages(prevMessages => prevMessages.filter(message => message.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to delete message. Please try again later.');
      setShowErrorModal(true);
    }
  };

  const handleSendMessage = async messageData => {
    try {
      await createMessage(messageData, auth);
      setRefreshMessages(refreshMessages + 1);
    } catch (error) {
      console.error('Error sending message:', error);
      setModalTitle(error.name || 'Error');
      setModalMessage(error.message || 'Failed to send message. Please try again later.');
      setShowErrorModal(true);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const closeConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="container">
      {loading ? (
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : !ticket ? (
        <div className="text-center mt-5">
          <h3>Ticket not found</h3>
          <p>The requested ticket could not be found.</p>
        </div>
      ) : isEditing ? (
        <div className="mt-4">
          <h2>Edit Ticket</h2>
          <TicketForm
            formData={editFormData}
            errors={formErrors}
            handleSubmit={handleSubmit}
            handleInputChange={handleInputChange}
            handleSelectChange={handleSelectChange}
            isEditMode={true}
            onCancel={handleCancelEdit}
          />
        </div>
      ) : (
        <TicketInfo
          ticket={ticket}
          messages={messages}
          onEditClick={handleEditClick}
          onDeleteClick={confirmDeleteTicket}
          onDeleteMessage={handleDeleteMessage}
          onSendMessage={handleSendMessage}
          canModify={isAdmin || ticket?.ticketOwner === auth.user?.profile?.['cognito:username']}
          currentUser={auth.user?.profile?.['cognito:username']}
          isAdmin={isAdmin}
        />
      )}

      <SuccessModal
        title={modalTitle}
        message={modalMessage}
        show={showSuccessModal}
        onClose={closeSuccessModal}
        navigateTo="/ticket/management"
      />

      <ErrorModal
        title={modalTitle}
        message={modalMessage}
        show={showErrorModal}
        onClose={closeErrorModal}
        navigateTo="/ticket/management"
      />

      <ConfirmationModal
        title={modalTitle}
        message={modalMessage}
        show={showConfirmationModal}
        onClose={closeConfirmationModal}
        onConfirm={handleDeleteTicket}
      />
    </div>
  );
}

export default TicketPage;
