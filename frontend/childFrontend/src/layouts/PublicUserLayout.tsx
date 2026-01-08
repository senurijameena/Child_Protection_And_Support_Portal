import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import './PublicUserLayout.css';

const PublicUserLayout: React.FC = () => {
  return (
    <div className="public-user-layout">
      <DashboardHeader />
      <Container fluid className="dashboard-container">
        <Row>
          <Col lg={3} xl={2} className="sidebar-column">
            <SidebarNavigation userType="PUBLIC" />
          </Col>
          
          <Col lg={9} xl={10} className="main-content-column">
            <div className="dashboard-content">
              <Outlet />
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PublicUserLayout;
