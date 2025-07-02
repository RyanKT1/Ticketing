import { Form, Button } from "react-bootstrap";

function TicketForm({ 
    formData, 
    errors, 
    handleSubmit, 
    handleInputChange, 
    handleSelectChange 
}) {
    
    return (
        <Form onSubmit={handleSubmit} noValidate>
           <Form.Group className="mb-3" controlId="title">
                <Form.Label>Title</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    required={true} 
                    isInvalid={!!errors.title}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.title}
                </Form.Control.Feedback>
           </Form.Group>
           
           <Form.Group className="mb-3" controlId="description">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                    as="textarea" 
                    rows={3} 
                    value={formData.description} 
                    onChange={handleInputChange} 
                    required={true} 
                    isInvalid={!!errors.description}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.description}
                </Form.Control.Feedback>
           </Form.Group>

           <Form.Group className="mb-3" controlId="deviceId">
                <Form.Label>Device Id</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.deviceId} 
                    onChange={handleInputChange} 
                    isInvalid={!!errors.deviceId}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.deviceId}
                </Form.Control.Feedback>
           </Form.Group>
           
           <Form.Group className="mb-3" controlId="deviceManufacturer">
                <Form.Label>Device Manufacturer</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.deviceManufacturer} 
                    onChange={handleInputChange} 
                    isInvalid={!!errors.deviceManufacturer}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.deviceManufacturer}
                </Form.Control.Feedback>
           </Form.Group>
           
           <Form.Group className="mb-3" controlId="deviceModel">
                <Form.Label>Device Model</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.deviceModel} 
                    onChange={handleInputChange} 
                    isInvalid={!!errors.deviceModel}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.deviceModel}
                </Form.Control.Feedback>
           </Form.Group>

           <Form.Group className="mb-3" controlId="severity">
                <Form.Label>Ticket Severity</Form.Label>
                <Form.Select 
                    value={formData.severity} 
                    onChange={handleSelectChange} 
                    required={true} 
                    isInvalid={!!errors.severity}
                >
                    <option value="">Select Severity</option>
                    <option value="1">Severity 1</option>
                    <option value="2">Severity 2</option>
                    <option value="3">Severity 3</option>
                    <option value="4">Severity 4</option>
                    <option value="5">Severity 5</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                    {errors.severity}
                </Form.Control.Feedback>
           </Form.Group>

           <Button variant="primary" type="submit">
                Create Ticket
           </Button>
        </Form>
    );
}

export default TicketForm;
