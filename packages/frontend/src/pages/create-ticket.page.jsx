import { useState } from "react";
import TicketForm from "../components/ticket-form/ticket-form.component";
import { createTicket } from "../services/ticket.services";
import { useAuth } from "react-oidc-context";
import SuccessModal from "../components/modal/success-modal.component";
import ErrorModal from "../components/modal/error-modal.component";
import { useParams } from "react-router-dom";

function CreateTicketPage() {
    const { deviceId } = useParams(); // Get the device ID from the URL
    const baseFormData = {
        title: '',
        description: '',
        deviceId: deviceId ?? '',
        deviceManufacturer: '',
        deviceModel: '',
        severity: '',
    };
    
    const auth = useAuth();
    const [formData, setFormData] = useState(baseFormData);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');

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

        if (!formData.deviceId.trim()) {
            if (!formData.deviceManufacturer.trim() || !formData.deviceModel.trim()) {
                newErrors.deviceId = 'Either Device ID or both Manufacturer and Model are required';
                if (!formData.deviceManufacturer.trim()) {
                    newErrors.deviceManufacturer = 'Required when Device ID is not provided';
                }
                if (!formData.deviceModel.trim()) {
                    newErrors.deviceModel = 'Required when Device ID is not provided';
                }
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            setModalTitle('Validation Error');
            setModalMessage('Please fix the errors in the form before submitting.');
            setShowErrorModal(true);
            return;
        }
        
        try {
            await createTicket(formData, auth);
            setFormData(baseFormData);
            setModalTitle('Success');
            setModalMessage('Ticket created successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            console.log(error);
            setModalTitle(error.name || 'Error');
            setModalMessage(error.message || 'Failed to create ticket. Please try again.');
            setShowErrorModal(true);
        }
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };
    
    const handleSelectChange = (event) => {
        setFormData({
            ...formData,
            severity: event.target.value
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
                navigateTo="/ticket/management"
            />
            
            <ErrorModal
                title={modalTitle}
                message={modalMessage}
                show={showErrorModal}
                onClose={closeErrorModal}
                navigateTo="/ticket/management"
            />
        </div>
    );
}

export default CreateTicketPage;
