import Button from 'react-bootstrap/Button';

function ReadonlyRow({device,handleCreateTicket,handleUpdateDevice,handleDeleteDevice}){

    return(
        <tr>
                    <td>{device.name}</td>
                    <td>{device.manufacturer}</td>
                    <td>{device.model}</td>
                    <td>{device.createdAt}</td>
                    <td>{device.updatedAt}</td>
                    <td>
                        <Button variant="primary" size="sm" onClick={() => handleCreateTicket(device)}>Create Ticket</Button>
                        <Button variant="primary" size="sm" onClick={(event) => handleUpdateDevice(event,device)}>Modify Device</Button>
                        <Button variant="primary" size="sm" onClick={() => handleDeleteDevice(device)}>Delete </Button>
                    </td>
                </tr>
    )
}

export default ReadonlyRow