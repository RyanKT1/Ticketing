import TicketCard from "../components/ticket-card/ticket-card.component"
import TicketInfo from "../components/ticket-info/ticket-info.component"

function HomePage(){
    const ticket = {
        title:'ticket title',
        ticketDescription:"Hello this is my ticket 123",
        deviceId:"21321321321",
        ticketOwner:"Ryan",
        resolved:false,
        createdAt: new Date(),
        updatedAt: new Date()
        
    }
    return (
        <>
        <TicketCard ticket={ticket}></TicketCard>
        <TicketInfo ticket={ticket}></TicketInfo>
        </>
    )
}
export default HomePage