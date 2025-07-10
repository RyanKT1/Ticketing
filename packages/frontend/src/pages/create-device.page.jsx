import { useState } from "react";
import DeviceForm from "../components/device-form/device-form.component";
import { createDevice } from "../services/device.services";
import { Alert } from "react-bootstrap";
import { useAuth } from "react-oidc-context";

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
            setModalMessage('Please fix the errors in the form before submitting.');
            setShowErrorModal(true);
            return;
        }
        
        try {
            await createDevice(formData,auth);
            setFormData(baseFormData);
            setModalMessage('Device created successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            console.log(error);
            setModalMessage('Failed to create device. Please try again.');
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

    return (
        <div className="container mt-4">
            <h2>Create New Device</h2>
            
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
            
            <DeviceForm 
                formData={formData}
                errors={errors}
                handleSubmit={handleSubmit}
                handleInputChange={handleInputChange}
            />
        </div>
    );
}

export default CreateDevicePage;
