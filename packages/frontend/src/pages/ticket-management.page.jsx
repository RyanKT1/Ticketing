import { useEffect, useState } from "react";
import { Container, Row, Col, Pagination, Alert, ButtonGroup, Button } from "react-bootstrap";
import { useAuth } from "react-oidc-context";
import { deleteTicket, getTickets, updateTicket } from "../services/ticket.services";
import TicketCard from "../components/ticket-card/ticket-card.component";
import SuccessModal from "../components/modal/success-modal.component";
import ErrorModal from "../components/modal/error-modal.component";
import ConfirmationModal from "../components/modal/confirmation-modal.component";

function TicketManagementPage() {
    const auth = useAuth();
    const [tickets, setTickets] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [filter, setFilter] = useState('all');
    const ticketsPerPage = 5;
    
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [modalTitle, setModalTitle] = useState('');
    const [modalMessage, setModalMessage] = useState('');
    const [ticketToDelete, setTicketToDelete] = useState(null);

    const exampleTicket = [{
        id: "12312312",
        title: 'ryan ticket title',
        ticketDescription: "Hello this is my ticket 123",
        deviceId: "21321321321",
        ticketOwner: "Ryan",
        resolved: false,
        severity: 5,
        createdAt: new Date(),
        updatedAt: new Date()
    },{
        id: "1231231234",
        title: 'ryan ticket title2',
        ticketDescription: "Hello this is my ticket 1234",
        deviceModel: "s22",
        deviceManufacturer: "Samsung",
        ticketOwner: "Ryan",
        resolved: false,
        severity: 3,
        createdAt: new Date(),
        updatedAt: new Date()
    }]

    useEffect(() => {
        const fetchTickets = async () => {
            try {
                const ticketList = await getTickets(auth);
                
                const safeTicketList = ticketList || [];
                
                const updatedTickets = [...safeTicketList, ...exampleTicket];
                
                setTickets(updatedTickets);
                setTotalPages(Math.ceil(updatedTickets.length / ticketsPerPage));
            } catch (error) {
                console.error("Error fetching tickets:", error);
                setModalTitle(error.name || 'Error');
                setModalMessage(error.message || 'Failed to load tickets. Please try again later.');
                setShowErrorModal(true);
                setTickets(exampleTicket); 
                setTotalPages(1);
            }
        };

        fetchTickets();
    }, [auth]); 

    const handleResolveTicket = async (ticketId, markAsResolved = true) => {
        try {
            await updateTicket(ticketId, { resolved: markAsResolved }, auth);
            setTickets(prevTickets => 
                prevTickets.map(ticket => 
                    ticket.id === ticketId 
                        ? { ...ticket, resolved: markAsResolved } 
                        : ticket
                )
            );
            setModalTitle('Success');
            setModalMessage(`Ticket ${markAsResolved ? 'resolved' : 'reopened'} successfully!`);
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error updating ticket:", error);
            setModalTitle(error.name || 'Error');
            setModalMessage(error.message || `Failed to ${markAsResolved ? 'resolve' : 'reopen'} ticket. Please try again.`);
            setShowErrorModal(true);
        }
    };

    const confirmDeleteTicket = (ticketId) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        setTicketToDelete(ticketId);
        setModalTitle('Confirm Deletion');
        setModalMessage(`Are you sure you want to delete the ticket "${ticket.title}"? This action cannot be undone.`);
        setShowConfirmationModal(true);
    };

    const handleDeleteTicket = async () => {
        if (!ticketToDelete) return;
        
        try {
            await deleteTicket(ticketToDelete, auth);
            setTickets(prevTickets => 
                prevTickets.filter(ticket => ticket.id !== ticketToDelete)
            );
            setModalTitle('Success');
            setModalMessage('Ticket deleted successfully!');
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error deleting ticket:", error);
            setModalTitle(error.name || 'Error');
            setModalMessage(error.message || 'Failed to delete ticket. Please try again.');
            setShowErrorModal(true);
        }
        
        setTicketToDelete(null);
    };
    
    const getFilteredTickets = () => {
        if (filter === 'all') return tickets;
        return tickets.filter(ticket => 
            filter === 'resolved' ? ticket.resolved : !ticket.resolved
        );
    };
   
    const getCurrentTickets = () => {
        const filteredTickets = getFilteredTickets();
        const indexOfLastTicket = currentPage * ticketsPerPage;
        const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
        return filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
    };

    // Update total pages when filter changes
    useEffect(() => {
        const filteredTickets = getFilteredTickets();
        setTotalPages(Math.ceil(filteredTickets.length / ticketsPerPage));
        setCurrentPage(1);
    }, [filter, tickets]);

    const renderPaginationItems = () => {
        let items = [];
        
        items.push(
            <Pagination.Prev 
                key="prev" 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
            />
        );

        for (let number = 1; number <= totalPages; number++) {
            items.push(
                <Pagination.Item 
                    key={number} 
                    active={number === currentPage}
                    onClick={() => setCurrentPage(number)}
                >
                    {number}
                </Pagination.Item>
            );
        }
        
        items.push(
            <Pagination.Next 
                key="next" 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
            />
        );
        
        return items;
    };
    
    const closeSuccessModal = () => {
        setShowSuccessModal(false);
    };
    
    const closeErrorModal = () => {
        setShowErrorModal(false);
    };
    
    const closeConfirmationModal = () => {
        setShowConfirmationModal(false);
        setTicketToDelete(null);
    };

    return (
        <Container className="py-4">
            <h1 className="mb-4">Ticket Management</h1>
            
            <div className="d-flex justify-content-between align-items-center mb-4">
                <ButtonGroup>
                    <Button 
                        variant={filter === 'all' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('all')}
                    >
                        All ({tickets.length})
                    </Button>
                    <Button 
                        variant={filter === 'resolved' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('resolved')}
                    >
                        Resolved ({tickets.filter(t => t.resolved).length})
                    </Button>
                    <Button 
                        variant={filter === 'unresolved' ? 'primary' : 'outline-primary'}
                        onClick={() => setFilter('unresolved')}
                    >
                        Unresolved ({tickets.filter(t => !t.resolved).length})
                    </Button>
                </ButtonGroup>
            </div>
         
            {tickets.length === 0 ? (
                <Alert variant="info">No tickets found.</Alert>
            ) : (
                <>
                    <Row>
                        {getCurrentTickets().map(ticket => (
                            <Col key={ticket.id} xs={12} lg={6} className="mb-4">
                                <TicketCard 
                                    ticket={ticket} 
                                    onResolve={handleResolveTicket}
                                    onDelete={confirmDeleteTicket}
                                />
                            </Col>
                        ))}
                    </Row>
                    
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center mt-4">
                            <Pagination>{renderPaginationItems()}</Pagination>
                        </div>
                    )}
                </>
            )}
            
            <SuccessModal
                title={modalTitle}
                message={modalMessage}
                show={showSuccessModal}
                onClose={closeSuccessModal}
                navigateTo="/ticket/management"
            />
            
            <ErrorModal
                title={modalTitle}
                message={modalMessage}
                show={showErrorModal}
                onClose={closeErrorModal}
                navigateTo="/ticket/management"
            />
            
            <ConfirmationModal
                title={modalTitle}
                message={modalMessage}
                show={showConfirmationModal}
                onClose={closeConfirmationModal}
                onConfirm={handleDeleteTicket}
            />
        </Container>
    );
}

export default TicketManagementPage;
