import { Card, Badge, Button, Row, Col } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import styles from './ticket-card.module.css';

function TicketCard({ ticket, onResolve, onDelete, isAdmin = false, currentUser = '' }) {
  const [isHovered, setIsHovered] = useState(false);
  const ticketInfoUrl = `/ticket/info/${ticket.id}`;

  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-UK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card
      className={styles.ticketCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <nav>
        <NavLink to={ticketInfoUrl} end>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <div>
              <Card.Title className="mb-0">{ticket.title || 'Untitled Ticket'}</Card.Title>
              <Card.Subtitle className="text-muted mt-1">
                ID: {ticket.id?.substring(0, 8) || 'N/A'}
              </Card.Subtitle>
            </div>
            <Badge>Sev-{ticket.severity}</Badge>
            <Badge bg={ticket.resolved ? 'success' : 'danger'}>
              {ticket.resolved ? 'Resolved' : 'Unresolved'}
            </Badge>
          </Card.Header>

          <Card.Body>
            <div className={styles.metaInfo}>
              <Row className="mb-2">
                <Col xs={4} className="text-muted">
                  Owner:
                </Col>
                <Col>{ticket.ticketOwner || ticket.owner || 'N/A'}</Col>
              </Row>

              {ticket.deviceId ? (
                <Row className="mb-2">
                  <Col xs={4} className="text-muted">
                    Device ID:
                  </Col>
                  <Col>{ticket.deviceId}</Col>
                </Row>
              ) : (
                <>
                  <Row className="mb-2">
                    <Col xs={4} className="text-muted">
                      Device Manufacturer:
                    </Col>
                    <Col>{ticket.deviceManufacturer}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col xs={4} className="text-muted">
                      Device Model:
                    </Col>
                    <Col>{ticket.deviceModel}</Col>
                  </Row>
                </>
              )}

              <Row className="mb-2">
                <Col xs={4} className="text-muted">
                  Created:
                </Col>
                <Col>{formatDate(ticket.createdAt)}</Col>
              </Row>
            </div>
          </Card.Body>
        </NavLink>
      </nav>
      {isHovered && (isAdmin || ticket.ticketOwner === currentUser) && (
        <Card.Footer className="d-flex justify-content-end gap-2">
          {ticket.resolved ? (
            <Button
              variant="outline-warning"
              size="sm"
              onClick={() => onResolve && onResolve(ticket.id, false)}
            >
              Mark as Unresolved
            </Button>
          ) : (
            <Button
              variant="outline-success"
              size="sm"
              onClick={() => onResolve && onResolve(ticket.id, true)}
            >
              Mark as Resolved
            </Button>
          )}
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => onDelete && onDelete(ticket.id)}
          >
            Delete
          </Button>
        </Card.Footer>
      )}
    </Card>
  );
}
export default TicketCard;
