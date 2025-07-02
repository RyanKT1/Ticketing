import { Form, Button } from "react-bootstrap";

function DeviceForm({ 
    formData, 
    errors, 
    handleSubmit, 
    handleInputChange 
}) {

    
    return (
        <Form onSubmit={handleSubmit} noValidate>
           <Form.Group className="mb-3" controlId="name">
                <Form.Label>Name</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.name} 
                    onChange={handleInputChange} 
                    required={true} 
                    isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.name}
                </Form.Control.Feedback>
           </Form.Group>
           
           <Form.Group className="mb-3" controlId="model">
                <Form.Label>Model</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.model} 
                    onChange={handleInputChange} 
                    required={true}
                    isInvalid={!!errors.model}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.model}
                </Form.Control.Feedback>
           </Form.Group>            

           <Form.Group className="mb-3" controlId="manufacturer">
                <Form.Label>Manufacturer</Form.Label>
                <Form.Control  
                    type="text" 
                    value={formData.manufacturer} 
                    onChange={handleInputChange} 
                    required={true} 
                    isInvalid={!!errors.manufacturer}
                />
                <Form.Control.Feedback type="invalid">
                    {errors.manufacturer}
                </Form.Control.Feedback>
           </Form.Group>
          
           <Button variant="primary" type="submit">
                Create Device
           </Button>
        </Form>
    );
}

export default DeviceForm;
