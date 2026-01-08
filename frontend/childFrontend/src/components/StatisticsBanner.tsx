import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import apiService from '../services/apiService';
import type { Statistics } from '../types';
import { STATS_REFRESH_INTERVAL } from '../utils/constants';

const StatisticsBanner: React.FC = () => {
  const [stats, setStats] = useState<Statistics>({
    casesResolved: 0,
    activeOfficers: 0,
    socialWorkers: 0,
    childrenHelped: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchStatistics = async () => {
    try {
      const data = await apiService.getStatistics();
      setStats(data);
      setLoading(false);
    } catch (error) {
      console.error('Error in StatisticsBanner:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
    const interval = setInterval(fetchStatistics, STATS_REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  const statsItems = [
    { icon: '✅', label: 'Cases Resolved', value: stats.casesResolved },
    { icon: '👮', label: 'Active Officers', value: stats.activeOfficers },
    { icon: '🤝', label: 'Social Workers', value: stats.socialWorkers },
    { icon: '🏠', label: 'Children Helped', value: stats.childrenHelped }
  ];

  return (
    <div className="statistics-banner py-4 bg-primary text-white">
      <Container>
        <Row className="text-center">
          {statsItems.map((item, index) => (
            <Col key={index} md={3} sm={6} className="mb-3 mb-md-0">
              <div className="stat-item">
                <div className="stat-icon fs-1 mb-2">{item.icon}</div>
                {loading ? (
                  <div className="stat-value placeholder-glow">
                    <span className="placeholder col-6"></span>
                  </div>
                ) : (
                  <div className="stat-value display-6 fw-bold mb-1">
                    {item.value.toLocaleString()}
                  </div>
                )}
                <div className="stat-label fs-5">{item.label}</div>
              </div>
            </Col>
          ))}
        </Row>
        <div className="text-center mt-3 small">
          <i className="bi bi-arrow-repeat me-1"></i>
          Live Updates | Last refreshed: {new Date().toLocaleTimeString()}
        </div>
      </Container>
    </div>
  );
};

export default StatisticsBanner;