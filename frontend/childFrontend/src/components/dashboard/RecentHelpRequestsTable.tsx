import React from 'react';
import { Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import '../modern/GlassCard.css';

interface HelpRequest {
    id: string;
    trackingId?: string;
    helpType: string;
    priority: string;
    status: string;
    assignedWorkerId?: string;
}

interface RecentHelpRequestsTableProps {
    requests: HelpRequest[];
    onAssign: (id: string) => void;
}

const RecentHelpRequestsTable: React.FC<RecentHelpRequestsTableProps> = ({ requests, onAssign }) => {
    const navigate = useNavigate();

    return (
        <div className="glass-card p-0 overflow-hidden h-100">
            <div className="p-4 d-flex justify-content-between align-items-center border-bottom">
                <h5 className="mb-0 fw-bold">Active Help Requests</h5>
                <Button
                    variant="link"
                    size="sm"
                    onClick={() => navigate('/admin/help-requests/all')}
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
                            <th className="border-0">Type</th>
                            <th className="border-0">Priority</th>
                            <th className="border-0">Status</th>
                            <th className="border-0 text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length > 0 ? (
                            requests.map((hr) => (
                                <tr key={hr.id}>
                                    <td className="ps-4 fw-medium text-dark">
                                        {hr.trackingId || hr.id.substring(0, 8)}
                                    </td>
                                    <td>{hr.helpType}</td>
                                    <td>
                                        <Badge bg={hr.priority === 'URGENT' ? 'danger' : hr.priority === 'HIGH' ? 'warning' : 'secondary'} pill>
                                            {hr.priority}
                                        </Badge>
                                    </td>
                                    <td>
                                        <Badge bg={hr.status === 'COMPLETED' ? 'success' : hr.status === 'ACTIVE' ? 'primary' : 'warning'}>
                                            {hr.status}
                                        </Badge>
                                    </td>
                                    <td className="text-end pe-4">
                                        <div className="d-flex gap-2 justify-content-end">
                                            <Button
                                                variant="outline-primary"
                                                size="sm"
                                                onClick={() => navigate(`/admin/help-requests/${hr.id}`)}
                                                className="rounded-pill px-3"
                                            >
                                                View
                                            </Button>
                                            {!hr.assignedWorkerId && (
                                                <Button
                                                    variant="outline-success"
                                                    size="sm"
                                                    onClick={() => onAssign(hr.id)}
                                                    className="rounded-pill px-3"
                                                >
                                                    Assign
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center text-muted py-5">
                                    No active help requests
                                </td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default RecentHelpRequestsTable;
