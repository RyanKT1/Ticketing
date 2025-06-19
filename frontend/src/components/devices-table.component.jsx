import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

function DevicesTable ({ deviceList = [] }){
    //only createticketclick should be available to regular customers 
    console.log(deviceList);
    function createTicketClick(device){
        console.log("Create ticket for:", device);
    }

    function deleteDeviceClick(device){
        console.log("Delete device:", device);
    }
    
    function modifyDeviceClick(device){
        console.log("Modify device:", device);
    }
    
    function createDeviceClick(){
        
    }
    
    return (
        <Table>
        <thead>
            <tr>
            <th>Name</th>
            <th>Manufacturer</th>
            <th>Model</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            {deviceList && deviceList.map(device => (
                <tr key={device.name}>
                    <td>{device.name}</td>
                    <td>{device.manufacturer}</td>
                    <td>{device.model}</td>
                    <td>{device.createdAt}</td>
                    <td>{device.updatedAt}</td>
                    <td>
                        <Button variant="primary" size="sm" onClick={() => createTicketClick(device)}>Create Ticket</Button>
                        <Button variant="primary" size="sm" onClick={() => modifyDeviceClick(device)}>Modify Device</Button>
                        <Button variant="primary" size="sm" onClick={() => deleteDeviceClick(device)}>Delete </Button>
                    </td>
                </tr>
            ))}
            <tr>                                                                                                                                                                                               
                <td>hi</td>                                                   
                <td>hi</td>
                <td colSpan="4"></td>
            </tr>
        </tbody>
        </Table>
    )
}

export default DevicesTable
