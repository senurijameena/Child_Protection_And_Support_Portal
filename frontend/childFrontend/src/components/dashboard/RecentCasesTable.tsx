import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../modern/GlassCard.css';

interface Case {
    id: string;
    trackingId?: string;
    caseType: string;
    location: string;
    priority: string;
    status: string;
    assignedOfficerId?: string;
    assignedWorkerId?: string;
}

interface RecentCasesTableProps {
    cases: Case[];
    basePath?: string;
}

const RecentCasesTable: React.FC<RecentCasesTableProps> = ({ cases, basePath = '/admin' }) => {
    const navigate = useNavigate();

    const getStatusBadgeColor = (status: string) => {
        const statusUpper = status.toUpperCase();
        if (statusUpper.includes('RESOLVED') || statusUpper.includes('CLOSED')) return 'success';
        if (statusUpper.includes('ACTIVE') || statusUpper.includes('ASSIGNED')) return 'primary';
        if (statusUpper.includes('PENDING') || statusUpper.includes('REVIEW')) return 'warning';
        return 'secondary';
    };

    return (
        <div className="glass-card p-0 overflow-hidden h-100">
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="mb-0 fw-bold">Recent Cases</h5>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate(`${basePath}/cases`)}
                    className="text-decoration-none fw-semibold"
                >
                    View All →
                </Button>
            </div>
            <div className="table-responsive">
                <Table hover className="mb-0 align-middle">
                    <thead className="bg-light">
                        <tr>
                            <th className="border-0 ps-4">ID</th>
                            <th className="border-0">Category</th>
                            <th className="border-0">Location</th>
                            <th className="border-0">Priority</th>
                            <th className="border-0">Status</th>
                            <th className="border-0 text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.length > 0 ? (
                            cases.map((c) => (
                                <tr key={c.id}>
                                    <td className="ps-4 fw-medium text-dark">
                                        {c.trackingId || c.id.substring(0, 8)}
                                    </td>
                                    <td>{c.caseType}</td>
                                    <td>{c.location}</td>
                                    <td>
                                        <Badge bg={c.priority === 'URGENT' ? 'danger' : c.priority === 'HIGH' ? 'warning' : 'secondary'} pill>
                                            {c.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={getStatusBadgeColor(c.status)}>
                                            {c.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() => navigate(`${basePath}/cases/${c.id}`)}
                                            className="rounded-pill px-3"
                                        >
                                            View
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} className="text-center text-muted py-5">
                                    No recent cases found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default RecentCasesTable;
