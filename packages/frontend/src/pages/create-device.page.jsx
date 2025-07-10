import { useState } from "react";
import DeviceForm from "../components/device-form/device-form.component";
import { createDevice } from "../services/device.services";
import { useAuth } from "react-oidc-context";
import SuccessModal from "../components/modal/success-modal.component";
import ErrorModal from "../components/modal/error-modal.component";

function CreateDevicePage() {
    const baseFormData = {
        name: '',
        model: '',
        manufacturer: '',
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
        
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'Model is required';
        }

        if (!formData.manufacturer.trim()) {
            newErrors.manufacturer = 'Manufacturer is required';
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
            await createDevice(formData, auth);
            setFormData(baseFormData);
            setModalTitle('Success');
            setModalMessage('Device created successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            console.log(error);
            setModalTitle(error.name || 'Error');
            setModalMessage(error.message || 'Failed to create device. Please try again.');
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

    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };

    const closeErrorModal = () => {
        setShowErrorModal(false);
    };

    return (
        <div className="container mt-4">
            <h2>Create New Device</h2>
            
            <DeviceForm 
                formData={formData}
                errors={errors}
                handleSubmit={handleSubmit}
                handleInputChange={handleInputChange}
            />
            
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
        </div>
    );
}

export default CreateDevicePage;
