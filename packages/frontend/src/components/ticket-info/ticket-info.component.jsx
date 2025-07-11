import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import styles from './ticket-info.module.css';

function TicketInfo({
  ticket = {},
  messages = [],
  onEditClick,
  onDeleteClick,
  onDeleteMessage,
  onSendMessage,
  canModify = false,
  currentUser = '',
  isAdmin = false,
}) {
  const [messageContent, setMessageContent] = useState('');

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      const messageData = {
        ticketId: ticket.id,
        content: messageContent,
      };

      onSendMessage(messageData);
      setMessageContent('');
    }
  };

  return (
    <div className={styles.ticketInfoContainer}>
      <div className={styles.contentLayout}>
        <div className={styles.ticketHeader}>
          <h2>Ticket Details</h2>
          {canModify && (
            <div className={styles.ticketActions}>
              <Button variant="primary" className={styles.actionButton} onClick={onEditClick}>
                Edit
              </Button>
              <Button variant="danger" className={styles.actionButton} onClick={onDeleteClick}>
                Delete
              </Button>
            </div>
          )}
        </div>

        <div className={styles.ticketDetailsContainer}>
          <div className={styles.ticketDetailsGrid}>
            {/* Left Column */}
            <div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>ID:</span>
                <span className={styles.detailValue}>{ticket.id || 'N/A'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Status:</span>
                <span
                  className={`${styles.detailValue} ${ticket.resolved ? styles.resolved : styles.unresolved}`}
                >
                  {ticket.resolved ? 'Resolved' : 'Unresolved'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Severity:</span>
                <span className={styles.detailValue}>Sev{ticket.severity || '5'}</span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Owner:</span>
                <span className={styles.detailValue}>{ticket.ticketOwner || 'N/A'}</span>
              </div>
            </div>

            {/* Right Column */}
            <div>
              {ticket.deviceId ? (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Device Id:</span>
                  <span className={styles.detailValue}>{ticket.deviceId}</span>
                </div>
              ) : (
                <>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Device Model:</span>
                    <span className={styles.detailValue}>{ticket.deviceModel || 'N/A'}</span>
                  </div>
                  <div className={styles.detailRow}>
                    <span className={styles.detailLabel}>Device Manufacturer:</span>
                    <span className={styles.detailValue}>{ticket.deviceManufacturer || 'N/A'}</span>
                  </div>
                </>
              )}
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Created:</span>
                <span className={styles.detailValue}>
                  {ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Updated:</span>
                <span className={styles.detailValue}>
                  {ticket.updatedAt ? new Date(ticket.updatedAt).toLocaleString() : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.descriptionSection}>
            <div className={styles.description}>
              <h3>Description</h3>
              <p>{ticket.description || 'No description available'}</p>
            </div>
          </div>
        </div>

        <div className={styles.messagesSection}>
          <h3>Messages</h3>
          <div className={styles.messagesList}>
            {messages.length > 0 ? (
              messages.map(message => (
                <div key={message.id} className={styles.messageItem}>
                  <div className={styles.messageHeader}>
                    <span className={styles.messageAuthor}>{message.author}</span>
                    <div className={styles.messageActions}>
                      <span className={styles.messageTime}>
                        {new Date(message.createdAt).toLocaleString()}
                      </span>
                      {(isAdmin || message.author === currentUser) && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className={styles.deleteMessageBtn}
                          onClick={() => onDeleteMessage && onDeleteMessage(message.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className={styles.messageContent}>{message.content}</div>
                </div>
              ))
            ) : (
              <p className={styles.noMessages}>No messages yet</p>
            )}
          </div>

          <div className={styles.addMessage}>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Type a new message..."
              className={styles.messageInput}
              value={messageContent}
              onChange={e => setMessageContent(e.target.value)}
            />
            <div className={styles.messageActions}>
              <Button variant="primary" className={styles.sendButton} onClick={handleSendMessage}>
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TicketInfo;
