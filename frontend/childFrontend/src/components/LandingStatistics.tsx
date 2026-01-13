import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { API_BASE_URL } from '../utils/constants';
import axios from 'axios';
import './LandingStatistics.css';

interface PublicStatistics {
  totalCasesReported: number;
  activeCases: number;
  casesSaved: number;
  caseResolutionRate: number;
  helpRequestsCompleted: number;
  childrenSupported: number;
  publicUsersCount: number;
  socialWorkersCount: number;
  policeOfficersCount: number;
  caseTypeDistribution: Record<string, number>;
  monthlyActivity: Array<{
    month: string;
    cases: number;
    helpRequests: number;
  }>;
  lastUpdated: string;
}

interface CounterProps {
  value: number;
  label: string;
  icon: string;
  color: string;
  loading: boolean;
  subtitle?: string;
  isPercentage?: boolean;
}

const AnimatedCounter: React.FC<CounterProps> = ({ value, label, icon, color, loading, subtitle, isPercentage = false }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (!loading && value > 0) {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      const stepDuration = duration / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          if (isPercentage) {
            setDisplayValue(Math.round(current * 100) / 100);
          } else {
            setDisplayValue(Math.floor(current));
          }
        }
      }, stepDuration);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(0);
    }
  }, [value, loading, isPercentage]);

  const formatValue = (val: number) => {
    if (isPercentage) {
      return `${val.toFixed(1)}%`;
    }
    return val.toLocaleString();
  };

  return (
    <Card className="h-100 border-0 shadow-lg text-center stat-card">
      <Card.Body className="d-flex flex-column justify-content-center align-items-center p-4">
        <div className="stat-icon mb-3">
          <span style={{ fontSize: '3rem' }}>{icon}</span>
        </div>
        {loading ? (
          <div className="stat-value placeholder-glow">
            <span className="placeholder col-6"></span>
          </div>
        ) : (
          <>
            <div className={`stat-value display-4 fw-bold mb-3 text-${color}`} style={{ lineHeight: '1.2' }}>
              {formatValue(displayValue)}
            </div>
            <div className="stat-label fw-semibold text-dark mb-2" style={{ fontSize: '1.15rem', lineHeight: '1.4' }}>
              {label}
            </div>
            {subtitle && (
              <div className="stat-subtitle text-muted small mt-2">
                {subtitle}
              </div>
            )}
          </>
        )}
      </Card.Body>
    </Card>
  );
};

const LandingStatistics: React.FC = () => {
  const [stats, setStats] = useState<PublicStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get<PublicStatistics>(`${API_BASE_URL}/statistics/public`);
      setStats(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching statistics:', error);

      // If API fails, set stats to null to show loading/error state
      setStats(null);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const resolvedCases = stats ? (stats.totalCasesReported - stats.activeCases) : 0;
  // Note: activeOfficers and activeWorkers would need to come from API if needed
  const activeOfficers = stats?.activeOfficers || 0;
  const activeWorkers = stats?.activeWorkers || 0;

  const statisticsCards = [
    {
      value: stats?.totalCasesReported || 0,
      label: 'Cases Reported',
      icon: '📊',
      color: 'primary',
      subtitle: stats?.lastUpdated ? `Live since ${stats.lastUpdated.split(' ')[0]}` : 'Total cases reported'
    },
    {
      value: stats?.helpRequestsCompleted || 0,
      label: 'Help Requests',
      icon: '❤️',
      color: 'danger',
      subtitle: 'Support requests'
    },
    {
      value: stats?.publicUsersCount || 0,
      label: 'Public Users',
      icon: '👥',
      color: 'info',
      subtitle: 'Registered citizens'
    },
    {
      value: stats?.socialWorkersCount || 0,
      label: 'Social Workers',
      icon: '🏥',
      color: 'success',
      subtitle: 'Professional workers'
    },
    {
      value: stats?.policeOfficersCount || 0,
      label: 'Police Officers',
      icon: '👮',
      color: 'warning',
      subtitle: 'On-duty officers'
    }
  ];

  return (
    <section className="landing-statistics py-5" id="statistics">
      <Container>
        <div className="text-center mb-5">
          <h2 className="display-5 fw-bold text-primary mb-3 statistics-title">
            🌍 REAL-TIME IMPACT
          </h2>
          <p className="lead text-muted">Real data from our active user base</p>
        </div>

        <Row className="g-4 mb-4 justify-content-center">
          {statisticsCards.map((stat, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={2} className="mb-4">
              <AnimatedCounter
                value={stat.value}
                label={stat.label}
                icon={stat.icon}
                color={stat.color}
                loading={loading}
                subtitle={stat.subtitle}
              />
            </Col>
          ))}
        </Row>


        {/* Animated Stacked Bar Chart */}
        {!loading && stats && stats.monthlyActivity && (
          <Row className="justify-content-center mt-5">
            <Col xs={12} lg={10}>
              <Card className="border-0 shadow-lg p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="fw-bold mb-0">Monthly Activity Trends</h4>
                  <Badge bg="success" className="pulse-badge">Live Updates</Badge>
                </div>
                <div style={{ width: '100%', height: 400 }}>
                  <ResponsiveContainer>
                    <BarChart
                      data={stats.monthlyActivity}
                      margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280' }}
                        dy={10}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#6B7280' }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '12px',
                          border: 'none',
                          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(4px)',
                        }}
                        cursor={{ fill: 'rgba(229, 231, 235, 0.4)' }}
                      />
                      <Legend
                        iconType="circle"
                        wrapperStyle={{ paddingTop: '20px' }}
                      />
                      <Bar
                        dataKey="cases"
                        name="Cases Reported"
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        barSize={30}
                      />
                      <Bar
                        dataKey="helpRequests"
                        name="Help Requests"
                        fill="#10B981"
                        radius={[4, 4, 0, 0]}
                        animationDuration={1500}
                        animationBegin={300}
                        barSize={30}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </section>
  );
};

export default LandingStatistics;
