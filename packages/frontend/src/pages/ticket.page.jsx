import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "react-oidc-context";
import TicketInfo from "../components/ticket-info/ticket-info.component";
import TicketForm from "../components/ticket-form/ticket-form.component";
import { createMessage, deleteMessage, getMessages } from "../services/message.services";
import { getTicket, updateTicket } from "../services/ticket.services";

function TicketPage(){
    const auth = useAuth();
    const navigate = useNavigate()
    const { id } = useParams(); // Get the ticket ID from the URL
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState({});
    const [formErrors, setFormErrors] = useState({});
    const [ticket, setTicket] = useState({});
    const [loading, setLoading] = useState(true);
    const [refreshMessages,setRefreshMessages] = useState(0)

    const exampleTicket = {
                        id: id || "12312312",
                        title: 'Example Ticket',
                        ticketDescription: "This is an example ticket description",
                        ticketOwner: "Ryan",
                        resolved: true,
                        severity: "3",
                        deviceModel: "Model X",
                        deviceManufacturer: "Acme Inc",
                        createdAt: new Date(),
                        updatedAt: new Date()
                    }
    const exampleMessage = {
        id: "1",
        author: "ryan",
        content: "hello im ryan",
        createdAt: new Date()
    }
    const exampleMessage2 = {
        id: "2",
        author: "ryan2",
        content: "hello im ryan2",
        createdAt: new Date()
    }
    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true);
            try {
                const fetchedTicket = await getTicket(id);
                
                if (fetchedTicket) {
                    setTicket(fetchedTicket);
                } else {
                    setTicket(exampleTicket);
                }
            } catch (error) {
                console.error("Error fetching ticket:", error);
                setError("Failed to load ticket. Please try again later.");
                setTicket(exampleTicket);
            } finally {
                setLoading(false);
            }
        };
        
        fetchTicket();
    }, [id],refreshMessages);
    useEffect(() => {
        const fetchMessages = async () => {
            if (!ticket.id) return;
            
            try {
                const messages = await getMessages(ticket.id);
                setMessages([
                   exampleMessage,exampleMessage2, ...messages
                ]);
                setError(null);
            } catch (error) {
                console.error("Error fetching messages:", error);
                setError("Failed to load messages. Please try again later.");
                setMessages([exampleMessage]);
            }
        };

        fetchMessages();
    }, [ticket.id]);
    const handleEditClick = () => {
        setEditFormData({
            title: ticket.title || '',
            description: ticket.ticketDescription || '',
            deviceId: ticket.deviceId || '',
            deviceManufacturer: ticket.deviceManufacturer || '',
            deviceModel: ticket.deviceModel || '',
            severity: ticket.severity || '',
            resolved: ticket.resolved || false
        });
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!editFormData.title?.trim()) {
            newErrors.title = 'Title is required';
        }
        
        if (!editFormData.description?.trim()) {
            newErrors.description = 'Description is required';
        }
        
        if (!editFormData.severity) {
            newErrors.severity = 'Please select a severity level';
        }
        
        setFormErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validateForm()) {
            return;
        }
        
        try {
             await updateTicket(ticket.id, {
                title: editFormData.title,
                ticketDescription: editFormData.description,
                deviceId: editFormData.deviceId,
                deviceManufacturer: editFormData.deviceManufacturer,
                deviceModel: editFormData.deviceModel,
                severity: editFormData.severity,
                resolved: editFormData.resolved
            });
            
            setTicket({
                ...ticket,
                title: editFormData.title,
                ticketDescription: editFormData.description,
                deviceId: editFormData.deviceId,
                deviceManufacturer: editFormData.deviceManufacturer,
                deviceModel: editFormData.deviceModel,
                severity: editFormData.severity,
                resolved: editFormData.resolved,
                updatedAt: new Date()
            });
            
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating ticket:', error);
            setError("Failed to update ticket. Please try again later.");
        }
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        const newValue = id === 'resolved' ? (value === 'true' || value === true) : value;
        
        setEditFormData({
            ...editFormData,
            [id]: newValue
        });
    };
    
    const handleSelectChange = (event) => {
        setEditFormData({
            ...editFormData,
            severity: event.target.value
        });
    };

    const handleDeleteTicket = async (ticketId) => {
        try {
            await deleteTicket(ticketId);
            console.log("Ticket deleted:", ticketId);
            navigate("/")
        } catch (error) {
            console.error("Error deleting ticket:", error);
            setError("Failed to delete ticket. Please try again later.");
        }
    };
    const handleDeleteMessage = async (messageId) => {
        try {
            await deleteMessage(messageId);
            console.log("Message deleted:", messageId);

            setMessages(prevMessages => 
                prevMessages.filter(message => message.id !== messageId)
            );
        } catch (error) {
            console.error("Error deleting message:", error);
            setError("Failed to delete message. Please try again later.");
        }
    };
    
    const handleSendMessage = async (messageData, file) => {
        try {
            await createMessage(messageData, file);
            setRefreshMessages(refresh++)    
        } catch (error) {
            console.error("Error sending message:", error);
            setError("Failed to send message. Please try again later.");
        }
    };
    
    return (
        <div className="container">
            {loading ? (
                <div className="text-center mt-5">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            ) : isEditing ? (
                <div className="mt-4">
                    <h2>Edit Ticket</h2>
                    <TicketForm 
                        formData={editFormData}
                        errors={formErrors}
                        handleSubmit={handleSubmit}
                        handleInputChange={handleInputChange}
                        handleSelectChange={handleSelectChange}
                        isEditMode={true}
                        onCancel={handleCancelEdit}
                    />
                </div>
            ) : (
                <TicketInfo 
                    ticket={ticket} 
                    messages={messages}
                    onEditClick={handleEditClick}
                    onDeleteClick={() => handleDeleteTicket(ticket.id)}
                    onDeleteMessage={handleDeleteMessage}
                    onSendMessage={handleSendMessage}
                />
            )}
        </div>
    );
}

export default TicketPage