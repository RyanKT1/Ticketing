import { useState } from "react";
import TicketForm from "../components/ticket-form/ticket-form.component";
import { createTicket } from "../services/ticket.services";
import { Alert } from "react-bootstrap";

function CreateTicketPage() {
    const baseFormData = {
        title: '',
        description: '',
        deviceId: '',
        deviceManufacturer: '',
        deviceModel: '',
        severity: ''
    };
    
    const [formData, setFormData] = useState(baseFormData);
    const [errors, setErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [modalMessage, setModalMessage] = useState('');

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!formData.description.trim()) {
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
            setModalMessage('Please fix the errors in the form before submitting.');
            setShowErrorModal(true);
            return;
        }
        
        try {
            await createTicket(formData);
            setFormData(baseFormData);
            setModalMessage('Ticket created successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            console.log(error);
            setModalMessage('Failed to create ticket. Please try again.');
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

    return (
        <div className="container mt-4">
            <h2>Create New Ticket</h2>
            
            {showSuccessModal && (
                <Alert variant="success" className="mb-3" dismissible onClose={() => setShowSuccessModal(false)}>
                    {modalMessage}
                </Alert>
            )}
            
            {showErrorModal && (
                <Alert variant="danger" className="mb-3" dismissible onClose={() => setShowErrorModal(false)}>
                    {modalMessage}
                </Alert>
            )}
            
            <TicketForm 
                formData={formData}
                errors={errors}
                handleSubmit={handleSubmit}
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
            />
        </div>
    );
}

export default CreateTicketPage;
