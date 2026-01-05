import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { helpRequestService } from '../../services/helpRequestService';
import { caseService } from '../../services/caseService';
import './AnalyticsPage.css';

interface CaseStats {
  total: number;
  active: number;
  resolved: number;
  resolvedPercentage: number;
}

interface CaseTypeDistribution {
  type: string;
  count: number;
  percentage: number;
}

interface PriorityDistribution {
  priority: string;
  count: number;
  percentage: number;
}

interface MonthlyActivity {
  month: string;
  cases: number;
}

const AnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState('30');
  const [caseStats, setCaseStats] = useState<CaseStats>({ total: 0, active: 0, resolved: 0, resolvedPercentage: 0 });
  const [helpRequestStats, setHelpRequestStats] = useState<CaseStats>({ total: 0, active: 0, resolved: 0, resolvedPercentage: 0 });
  const [caseTypeDistribution, setCaseTypeDistribution] = useState<CaseTypeDistribution[]>([]);
  const [priorityDistribution, setPriorityDistribution] = useState<PriorityDistribution[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch cases and help requests
      const [casesResponse, helpRequestsResponse] = await Promise.all([
        caseService.getMyCases(),
        helpRequestService.getMyRequests()
      ]);

      const cases = Array.isArray(casesResponse.data) ? casesResponse.data : [];
      const helpRequests = Array.isArray(helpRequestsResponse.data) ? helpRequestsResponse.data : [];

      // Filter by period
      let filteredCases = cases;
      let filteredHelpRequests = helpRequests;
      
      if (period !== 'all') {
        const daysAgo = parseInt(period);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysAgo);

        filteredCases = cases.filter((c: any) => {
          const reportDate = c.reportDate ? new Date(c.reportDate) : null;
          return !reportDate || reportDate >= cutoffDate;
        });

        filteredHelpRequests = helpRequests.filter((hr: any) => {
          const requestDate = hr.requestDate ? new Date(hr.requestDate) : null;
          return !requestDate || requestDate >= cutoffDate;
        });
      }

      // Calculate case statistics
      const totalCases = filteredCases.length;
      const activeCases = filteredCases.filter((c: any) => 
        c.status && !['RESOLVED', 'CLOSED'].includes(c.status.toUpperCase())
      ).length;
      const resolvedCases = totalCases - activeCases;
      const resolvedPercentage = totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 0;
      
      setCaseStats({ total: totalCases, active: activeCases, resolved: resolvedCases, resolvedPercentage });

      // Calculate help request statistics
      const totalHelpRequests = filteredHelpRequests.length;
      const activeHelpRequests = filteredHelpRequests.filter((hr: any) => 
        hr.status && !['COMPLETED', 'REJECTED'].includes(hr.status.toUpperCase())
      ).length;
      const resolvedHelpRequests = totalHelpRequests - activeHelpRequests;
      const helpRequestResolvedPercentage = totalHelpRequests > 0 ? Math.round((resolvedHelpRequests / totalHelpRequests) * 100) : 0;
      
      setHelpRequestStats({ 
        total: totalHelpRequests, 
        active: activeHelpRequests, 
        resolved: resolvedHelpRequests, 
        resolvedPercentage: helpRequestResolvedPercentage 
      });

      // Calculate case type distribution
      const typeCounts: Record<string, number> = {};
      filteredCases.forEach((c: any) => {
        const type = c.caseType || 'OTHER';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      });

      const typeDist: CaseTypeDistribution[] = Object.entries(typeCounts).map(([type, count]) => ({
        type,
        count: count as number,
        percentage: totalCases > 0 ? Math.round(((count as number) / totalCases) * 100) : 0
      })).sort((a, b) => b.count - a.count);

      setCaseTypeDistribution(typeDist);

      // Calculate priority distribution
      const priorityCounts: Record<string, number> = {};
      filteredCases.forEach((c: any) => {
        const priority = c.priority || 'MEDIUM';
        priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
      });

      const priorityDist: PriorityDistribution[] = Object.entries(priorityCounts).map(([priority, count]) => ({
        priority,
        count: count as number,
        percentage: totalCases > 0 ? Math.round(((count as number) / totalCases) * 100) : 0
      })).sort((a, b) => {
        const priorityOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      });

      setPriorityDistribution(priorityDist);

      // Calculate monthly activity
      const monthlyCounts: Record<string, number> = {};
      filteredCases.forEach((c: any) => {
        if (c.reportDate) {
          const date = new Date(c.reportDate);
          const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
        }
      });

      const monthly: MonthlyActivity[] = Object.entries(monthlyCounts)
        .map(([month, cases]) => ({ month, cases: cases as number }))
        .sort((a, b) => {
          const dateA = new Date(a.month + ' 1, ' + new Date().getFullYear());
          const dateB = new Date(b.month + ' 1, ' + new Date().getFullYear());
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, 6); // Last 6 months

      setMonthlyActivity(monthly);

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getCaseTypeLabel = (type: string): string => {
    const typeUpper = type.toUpperCase();
    if (typeUpper.includes('MISSING')) return 'Missing';
    if (typeUpper.includes('ABUSE')) return 'Abuse';
    if (typeUpper.includes('LABOR')) return 'Labor';
    if (typeUpper.includes('TRAFFICKING')) return 'Trafficking';
    return 'Other';
  };

  const getPriorityLabel = (priority: string): string => {
    return priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase();
  };

  const getPriorityColor = (priority: string): string => {
    const priorityUpper = priority.toUpperCase();
    if (priorityUpper === 'HIGH' || priorityUpper === 'URGENT') return '#dc3545';
    if (priorityUpper === 'MEDIUM') return '#ffc107';
    return '#28a745';
  };

  const getCaseTypeColor = (index: number): string => {
    const colors = ['#0d6efd', '#dc3545', '#ffc107', '#28a745', '#6f42c1', '#fd7e14'];
    return colors[index % colors.length];
  };

  if (loading) {
    return (
      <Container className="analytics-page">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </Container>
    );
  }

  return (
    <div className="analytics-page">
      <Container>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="mb-0">📈 PERSONAL ANALYTICS</h2>
          <div className="d-flex gap-2 align-items-center">
            <Form.Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{ width: '150px' }}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </Form.Select>
            <Button variant="outline-primary" onClick={fetchAnalytics}>
              🔄 Refresh
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="danger" dismissible onClose={() => setError(null)} className="mb-4">
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Row className="mb-4 g-3">
          <Col md={6} lg={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">📊</div>
                <div className="stat-label">Total Cases</div>
                <div className="stat-value">{caseStats.total}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">🔄</div>
                <div className="stat-label">Active Cases</div>
                <div className="stat-value">{caseStats.active}</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">✅</div>
                <div className="stat-label">Resolved Cases</div>
                <div className="stat-value">{caseStats.resolved} ({caseStats.resolvedPercentage}%)</div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} lg={3}>
            <Card className="stat-card">
              <Card.Body className="text-center">
                <div className="stat-icon">❤️</div>
                <div className="stat-label">Help Requests</div>
                <div className="stat-value">{helpRequestStats.total}</div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mb-4 g-3">
          {/* Case Type Distribution */}
          <Col lg={6}>
            <Card className="chart-card h-100">
              <Card.Header>
                <h5 className="mb-0">📋 CASE TYPE DISTRIBUTION</h5>
              </Card.Header>
              <Card.Body>
                {caseTypeDistribution.length > 0 ? (
                  <div className="distribution-container">
                    {caseTypeDistribution.map((item, index) => (
                      <div key={item.type} className="distribution-item mb-3">
                        <div className="d-flex align-items-center mb-1">
                          <span 
                            className="legend-color" 
                            style={{ backgroundColor: getCaseTypeColor(index) }}
                          />
                          <span className="distribution-label ms-2">
                            <strong>{getCaseTypeLabel(item.type)}</strong>
                          </span>
                          <span className="ms-auto text-muted">
                            {item.percentage}% ({item.count})
                          </span>
                        </div>
                        <div className="progress" style={{ height: '24px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: getCaseTypeColor(index),
                            }}
                            aria-valuenow={item.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">No data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Priority Distribution */}
          <Col lg={6}>
            <Card className="chart-card h-100">
              <Card.Header>
                <h5 className="mb-0">⚠️ PRIORITY DISTRIBUTION</h5>
              </Card.Header>
              <Card.Body>
                {priorityDistribution.length > 0 ? (
                  <div className="priority-distribution">
                    {priorityDistribution.map((item) => (
                      <div key={item.priority} className="priority-item mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="priority-label">{getPriorityLabel(item.priority)}</span>
                          <span className="priority-count">{item.count} ({item.percentage}%)</span>
                        </div>
                        <div className="progress" style={{ height: '20px' }}>
                          <div
                            className="progress-bar"
                            role="progressbar"
                            style={{
                              width: `${item.percentage}%`,
                              backgroundColor: getPriorityColor(item.priority),
                            }}
                            aria-valuenow={item.percentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            {item.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">No data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Monthly Activity */}
        <Row className="mb-4">
          <Col>
            <Card className="chart-card">
              <Card.Header>
                <h5 className="mb-0">📅 MONTHLY ACTIVITY</h5>
              </Card.Header>
              <Card.Body>
                {monthlyActivity.length > 0 ? (
                  <div className="bar-chart-container">
                    <div className="bar-chart">
                      {monthlyActivity.map((item) => {
                        const maxCases = Math.max(...monthlyActivity.map(m => m.cases), 1);
                        const heightPercentage = (item.cases / maxCases) * 100;
                        return (
                          <div key={item.month} className="bar-item">
                            <div className="bar-label">{item.month}</div>
                            <div className="bar-wrapper">
                              <div
                                className="bar"
                                style={{ height: `${heightPercentage}%` }}
                                title={`${item.cases} cases`}
                              >
                                <span className="bar-value">{item.cases}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted py-4">No data available</div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AnalyticsPage;
