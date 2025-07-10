import { useState, useEffect } from "react";
import { getDevices, deleteDevice, updateDevice } from "../services/device.services";
import DevicesTable from "../components/device-table/devices-table.component";
import { useAuth } from "react-oidc-context";

function DeviceTablePage() {

    const auth = useAuth();
    const [devices, setDevices] = useState([]);
    const [editDeviceRow, setEditDeviceRow] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const deviceList = await getDevices(auth);
                console.log(deviceList)
                const fetchedDevices = deviceList || [];
                const updatedDevices = [
                    ...fetchedDevices,
                    {
                        name: "ryan phone",
                        manufacturer: "phone",
                        model: "phone 2",
                        createdAt: "03/06/2028",
                        updatedAt: "05/12/2030",
                    }
                ];
                
                setDevices(updatedDevices);
                console.log("Updated devices:", updatedDevices);
            } catch (error) {
                console.error("Error fetching devices:", error);

                const fallbackDevices = [
                    {
                        name: "ryan phone",
                        manufacturer: "phone",
                        model: "phone 2",
                        createdAt: "03/06/2028",
                        updatedAt: "05/12/2030",
                    }
                ];
                
                setDevices(fallbackDevices);
                console.log("Fallback devices:", fallbackDevices);
            }
        };
        
        fetchDevices();
    }, []);
    
    const handleDeleteDevice = async (device) => {
        try {
            await deleteDevice(device.id,auth);
            setDevices(devices.filter(d => d.id !== device.id));
            // success modal 
        } catch (error) {
            // error modal
            console.error("Error deleting device:", error);
        }
    };
    
    const handleUpdateClick = (event, device) => {
        event.preventDefault();
        setEditDeviceRow(device.id);
        setEditFormData({
            name: device.name,
            manufacturer: device.manufacturer,
            model: device.model,
            createdAt: device.createdAt,
            updatedAt: device.updatedAt
        });
    };
    
    const handleEditInputChange = (event) => {
        event.preventDefault();
        const { name, value } = event.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };
    
    const handleEditFormSubmit = async (event) => {
        event.preventDefault();
        try {
            await updateDevice(editDeviceRow, editFormData,auth);
            const updatedDevices = devices.map(device => 
                device.id === editDeviceRow ? { ...device, ...editFormData } : device
            );
            
            setDevices(updatedDevices);
            setEditDeviceRow(null);
            setEditFormData({});
            // Success modal
        } catch (error) {
            console.error("Error updating device:", error);
            // Error modal
        }
    };
    
    const handleCancelClick = () => {
        setEditDeviceRow(null);
        setEditFormData({});
    };
    
    const handleCreateTicket = async (device) => {
        // navigate to the page and enter the device id
        console.log(device)
    };
    
    return (
        <div>
            <DevicesTable 
                deviceList={devices} 
                editDeviceRow={editDeviceRow}
                editFormData={editFormData}
                handleDeleteDevice={handleDeleteDevice}
                handleUpdateClick={handleUpdateClick}
                handleEditInputChange={handleEditInputChange}
                handleEditFormSubmit={handleEditFormSubmit}
                handleCancelClick={handleCancelClick}
                handleCreateTicket={handleCreateTicket}
            />
        </div>
    );
}

export default DeviceTablePage;
