import React from 'react';
import { connect } from 'react-redux';

import { Tab, Navbar, Nav, Container, Card, Form, Button } from 'react-bootstrap';

class LoginPage extends React.Component {
  render() {
    return (
      <div className="App">
        <Tab.Container defaultActiveKey='login'>
          <Navbar bg='dark' variant='dark'>
            <Navbar.Brand>
              <img
                src='/logo.svg'
                width='30'
                height='30'
                alt='Logo'
              />{' '}
              Inventory Manager
            </Navbar.Brand>
            <Navbar.Collapse>
              <Nav onSelect={this.handleSelect} >
                <Nav.Item>
                  <Nav.Link eventKey='login'>Login</Nav.Link>
                </Nav.Item>
              </Nav>
            </Navbar.Collapse>
          </Navbar>

          <Container>
            <Card>
              <Card.Header>Vibe Check Failed</Card.Header>
              <Card.Body>
                <Card.Text>
                  <Form onSubmit={(e) => {
                    e.preventDefault();

                    const url = e.target[0].value;
                    const user = e.target[1].value;
                    const pass = e.target[2].value;

                    localStorage.setItem('dbURL', url)
                    localStorage.setItem('dbUser', user)
                    localStorage.setItem('dbPass', pass)

                    this.props.dispatch({type: 'DB_UPDATE_REQUESTED'});
                  }}>
                    <Form.Group controlId='url'>
                      <Form.Label>Database URL</Form.Label>
                      <Form.Control name='url' defaultValue={localStorage.getItem('dbURL')} />
                    </Form.Group>
                    <Form.Group controlId='user'>
                      <Form.Label>Username</Form.Label>
                      <Form.Control name='user' defaultValue={localStorage.getItem('dbUser')} />
                    </Form.Group>
                    <Form.Group controlId='password'>
                      <Form.Label>Password</Form.Label>
                      <Form.Control name='password' type='password' />
                    </Form.Group>
                    <Button variant='primary' type='submit'>Submit</Button>
                  </Form>
                </Card.Text>
              </Card.Body>
            </Card>
          </Container>
        </Tab.Container>
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    dispatch
  }),
)(LoginPage);
