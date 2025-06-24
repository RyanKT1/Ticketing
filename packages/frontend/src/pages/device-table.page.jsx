import { useState, useEffect } from "react";
import { getDevices } from "../services/device.services";
import DevicesTable from "../components/device-table/devices-table.component";

function DevicePage() {
    const [devices, setDevices] = useState([]);
    
    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const deviceList = await getDevices();
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
    console.log(devices);
    
    return (
        <div>
            <DevicesTable deviceList={devices}/>
        </div>
    );
}

export default DevicePage;
