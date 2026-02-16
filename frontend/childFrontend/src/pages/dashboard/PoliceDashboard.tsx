import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Badge, Button, Form, Spinner } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { authService } from '../../services/authService';
import { policeService } from '../../services/policeService';
import { Link } from 'react-router-dom';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

// Mock data if API fails
const MOCK_STATS = {
    assignedCases: 5,
    urgentCases: 2,
    resolvedToday: 3,
    avgResponse: '2.4h'
};

const MOCK_CASES = [
    { id: 'C-1001', type: 'Child Abuse', priority: 'HIGH', status: 'INVESTIGATING', date: '2024-01-05' },
    { id: 'C-1002', type: 'Neglect', priority: 'MEDIUM', status: 'ASSIGNED', date: '2024-01-04' },
    { id: 'C-1003', type: 'Domestic Violence', priority: 'CRITICAL', status: 'NEW', date: '2024-01-06' },
    { id: 'C-1004', type: 'Cyber Bullying', priority: 'LOW', status: 'RESOLVED', date: '2023-12-28' },
    { id: 'C-1005', type: 'Missing Child', priority: 'CRITICAL', status: 'INVESTIGATING', date: '2024-01-06' },
];

const MOCK_ACTIVITY = [
    { id: 1, text: 'Case #C-4567 assigned', time: '2 hours ago' },
    { id: 2, text: 'Evidence added to C-1234', time: '4 hours ago' },
    { id: 3, text: 'Case C-8910 resolved', time: 'Yesterday' },
];

const PoliceDashboard: React.FC = () => {
    const user = authService.getCurrentUser();
    const [stats, setStats] = useState<any>(MOCK_STATS);
    const [cases, setCases] = useState<any[]>(MOCK_CASES);
    const [loading, setLoading] = useState(true);
    const [officerStatus, setOfficerStatus] = useState<'AVAILABLE' | 'BUSY' | 'OFF_DUTY'>('AVAILABLE');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                try {
                    const statsData = await policeService.getPoliceStatistics();
                    setStats(statsData);
                } catch (e) {
                    console.error("Failed to fetch statistics", e);
                }

                // Fetch Cases
                try {
                    const casesData = await policeService.getAssignedCases();
                    setCases(casesData);
                } catch (e) {
                    console.error("Failed to fetch cases", e);
                }

                // Simulate network delay
                setTimeout(() => setLoading(false), 800);
            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const chartData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
            {
                label: 'Cases Resolved',
                data: [1, 3, 2, 4, 3, 5, 2],
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
                tension: 0.3
            },
            {
                label: 'New Assignments',
                data: [2, 1, 3, 2, 4, 2, 1],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                tension: 0.3
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top' as const,
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    const getPriorityBadgeAndColor = (priority: string) => {
        switch (priority) {
            case 'CRITICAL': return { bg: 'danger', text: 'CRITICAL' };
            case 'HIGH': return { bg: 'warning', text: 'HIGH' };
            case 'MEDIUM': return { bg: 'info', text: 'MEDIUM' };
            default: return { bg: 'success', text: 'LOW' };
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW': return <Badge bg="primary">New</Badge>;
            case 'ASSIGNED': return <Badge bg="info">Assigned</Badge>;
            case 'INVESTIGATING': return <Badge bg="warning" text="dark">Investigating</Badge>;
            case 'RESOLVED': return <Badge bg="success">Resolved</Badge>;
            case 'CLOSED': return <Badge bg="secondary">Closed</Badge>;
            default: return <Badge bg="light" text="dark">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    return (
        <Container fluid className="p-0">
            {/* Dashboard Overview Header */}
            <Card className="mb-4 shadow-sm border-0 bg-primary text-white" style={{ background: 'linear-gradient(45deg, #0d6efd, #0dcaf0)' }}>
                <Card.Body className="p-4">
                    <Row className="align-items-center">
                        <Col md={8}>
                            <h2 className="mb-1 fw-bold">Welcome back, Officer {user?.name || 'User'}</h2>
                            <p className="mb-0 opacity-75">Badge #{user?.id?.substring(0, 5).toUpperCase() || '12345'} | Rank: Sergeant</p>
                        </Col>
                        <Col md={4} className="text-md-end mt-3 mt-md-0">
                            <div className="d-inline-block bg-white bg-opacity-25 rounded px-3 py-2">
                                <span className="me-2">Status:</span>
                                <Form.Select
                                    size="sm"
                                    className="d-inline-block w-auto border-0 shadow-none fw-bold"
                                    style={{ backgroundColor: 'transparent', color: 'white', cursor: 'pointer' }}
                                    value={officerStatus}
                                    onChange={(e) => setOfficerStatus(e.target.value as any)}
                                >
                                    <option value="AVAILABLE" className="text-dark">🟢 AVAILABLE</option>
                                    <option value="BUSY" className="text-dark">🔴 BUSY</option>
                                    <option value="OFF_DUTY" className="text-dark">⚪ OFF DUTY</option>
                                </Form.Select>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Quick Stats Cards */}
            <Row className="mb-4 g-3">
                <Col md={6} xl={3}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-primary hover-scale">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Assigned Cases</h6>
                                    <h3 className="mb-0 fw-bold display-6">{stats.assignedCases} <span className="text-muted fs-6">/ 10</span></h3>
                                </div>
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                                    <i className="bi bi-folder-fill fs-4"></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} xl={3}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-danger hover-scale">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Urgent Cases</h6>
                                    <h3 className="mb-0 fw-bold display-6">{stats.urgentCases}</h3>
                                </div>
                                <div className="bg-danger bg-opacity-10 p-3 rounded-circle text-danger">
                                    <i className="bi bi-exclamation-triangle-fill fs-4"></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} xl={3}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-success hover-scale">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Resolved Today</h6>
                                    <h3 className="mb-0 fw-bold display-6">{stats.resolvedToday}</h3>
                                </div>
                                <div className="bg-success bg-opacity-10 p-3 rounded-circle text-success">
                                    <i className="bi bi-check-circle-fill fs-4"></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6} xl={3}>
                    <Card className="h-100 shadow-sm border-0 border-start border-4 border-info hover-scale">
                        <Card.Body>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: '0.75rem' }}>Avg. Response</h6>
                                    <h3 className="mb-0 fw-bold display-6">{stats.avgResponse}</h3>
                                </div>
                                <div className="bg-info bg-opacity-10 p-3 rounded-circle text-info">
                                    <i className="bi bi-stopwatch-fill fs-4"></i>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row>
                {/* Assigned Cases Table */}
                <Col xl={8} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-bold">Assigned Cases</h5>
                            <Button variant="outline-primary" size="sm" as={Link as any} to="/police/assignments/active">View All</Button>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <Table hover responsive className="mb-0 align-middle">
                                <thead className="bg-light text-muted small text-uppercase">
                                    <tr>
                                        <th className="ps-4">ID</th>
                                        <th>Type</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                        <th className="text-end pe-4">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {cases.map((c: any) => {
                                        const priorityMeta = getPriorityBadgeAndColor(c.priority ? c.priority.toString() : 'LOW');
                                        const caseIdDisplay = c.trackingId || c.id;
                                        const caseTypeDisplay = c.caseType ? c.caseType.toString().replace(/_/g, ' ') : c.type || 'Unknown';
                                        const dateDisplay = c.reportDate ? new Date(c.reportDate).toLocaleDateString() : c.date || 'N/A';

                                        return (
                                            <tr key={c.id}>
                                                <td className="ps-4 fw-medium text-primary">#{caseIdDisplay}</td>
                                                <td>{caseTypeDisplay}</td>
                                                <td>
                                                    <Badge bg={priorityMeta.bg}>{priorityMeta.text}</Badge>
                                                </td>
                                                <td>{getStatusBadge(c.status ? c.status.toString() : 'NEW')}</td>
                                                <td className="text-muted small">{dateDisplay}</td>
                                                <td className="text-end pe-4">
                                                    <Button variant="light" size="sm" className="me-1" title="View Details" as={Link as any} to={`/police/cases/${c.id}`}>
                                                        <i className="bi bi-eye"></i>
                                                    </Button>
                                                    <Button variant="light" size="sm" title="Edit" as={Link as any} to={`/police/cases/${c.id}`}>
                                                        <i className="bi bi-pencil"></i>
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Performance Chart & Recent Activity */}
                <Col xl={4}>
                    <Row>
                        {/* Performance Chart */}
                        <Col xs={12} className="mb-4">
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0 fw-bold">Performance Trends</h5>
                                </Card.Header>
                                <Card.Body>
                                    <div style={{ height: '220px' }}>
                                        <Line data={chartData} options={chartOptions} />
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Recent Activity */}
                        <Col xs={12} className="mb-4">
                            <Card className="shadow-sm border-0">
                                <Card.Header className="bg-white py-3">
                                    <h5 className="mb-0 fw-bold">Recent Activity</h5>
                                </Card.Header>
                                <Card.Body>
                                    <ul className="list-unstyled mb-0">
                                        {MOCK_ACTIVITY.map((activity, index) => (
                                            <li key={activity.id} className="d-flex mb-3">
                                                <div className="me-3">
                                                    <div className={`bg-light p-2 rounded-circle ${index % 2 === 0 ? 'text-primary' : 'text-success'}`}>
                                                        <i className="bi bi-circle-fill" style={{ fontSize: '0.6rem' }}></i>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="mb-1 text-dark fw-medium small">{activity.text}</p>
                                                    <small className="text-muted" style={{ fontSize: '0.7rem' }}>{activity.time}</small>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Container>
    );
};

export default PoliceDashboard;
