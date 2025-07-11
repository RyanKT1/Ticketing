import { Container, Row, Col } from 'react-bootstrap';

function HomePage() {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col>
          <h1 className="display-4 fw-bold">Welcome to Ticketing</h1>
        </Col>
      </Row>
    </Container>
  );
}

export default HomePage;
