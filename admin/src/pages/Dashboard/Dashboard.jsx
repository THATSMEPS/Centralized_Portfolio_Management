import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, Spinner, Badge } from 'reactstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getDashboardAnalytics } from '../../api/portfolioDashboard.api';

const StatCard = ({ title, count, icon, color, link }) => (
  <Col xl={3} md={6}>
    <style>
      {`
        .stat-card-glow {
            border-radius: 16px !important;
            border: none !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1) !important;
        }
        .stat-card-glow:hover {
            transform: translateY(-5px) !important;
            box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2), 0 4px 6px -4px rgba(37, 99, 235, 0.2) !important;
            filter: drop-shadow(0 0 8px rgba(37, 99, 235, 0.1));
        }
        .icon-box-dark {
            background-color: #0f172a !important;
            border-radius: 12px !important;
        }
      `}
    </style>
    <Card className="card-animate stat-card-glow">
      <CardBody>
        <div className="d-flex align-items-center">
          <div className="flex-grow-1 overflow-hidden">
            <p className="text-uppercase fw-medium text-muted text-truncate mb-0" style={{ letterSpacing: '0.5px', fontSize: '11px' }}>{title}</p>
          </div>
        </div>
        <div className="d-flex align-items-end justify-content-between mt-4">
          <div>
            <h4 className="fs-22 fw-semibold ff-secondary mb-4" style={{ color: '#1e293b' }}>{count}</h4>
            {link && <Link to={link} className="text-decoration-underline text-muted" style={{ fontSize: '12px' }}>View All</Link>}
          </div>
          <div className="avatar-sm flex-shrink-0">
            <span className="avatar-title icon-box-dark fs-3">
              <i className={`${icon} text-white`}></i>
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  </Col>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard | Portfolio Admin';
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await getDashboardAnalytics();
      if (res.data?.isOk) setData(res.data.data);
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-content text-center"><Spinner /></div>;

  const stats = data || { teamMembers: {}, services: {}, projects: {}, enquiries: {}, recentEnquiries: [] };

  // Extract totals — API returns { total, active } objects
  const memberCount = typeof stats.teamMembers === 'object' ? (stats.teamMembers?.total || 0) : (stats.teamMembers || 0);
  const projectCount = typeof stats.projects === 'object' ? (stats.projects?.total || 0) : (stats.projects || 0);
  const serviceCount = typeof stats.services === 'object' ? (stats.services?.total || 0) : (stats.services || 0);
  const enquiryCount = typeof stats.enquiries === 'object' ? (stats.enquiries?.total || 0) : (stats.enquiries || 0);

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Dashboard" pageTitle="Portfolio" />

        <Row>
          <StatCard title="Team Members" count={memberCount} icon="ri-team-line" color="primary" link="/team-members" />
          <StatCard title="Projects" count={projectCount} icon="ri-code-s-slash-line" color="success" link="/projects" />
          <StatCard title="Services" count={serviceCount} icon="ri-service-line" color="info" link="/services" />
          <StatCard title="Enquiries" count={enquiryCount} icon="ri-mail-line" color="warning" link="/enquiries" />
        </Row>

        <Row>
          <Col xl={12}>
            <Card className="stat-card-glow">
              <div className="card-header d-flex align-items-center justify-content-between">
                <h4 className="card-title mb-0">Recent Enquiries</h4>
                <Link to="/enquiries" className="btn btn-sm btn-soft-primary">View All</Link>
              </div>
              <CardBody>
                {(stats.recentEnquiries || []).length === 0 ? (
                  <p className="text-muted text-center mb-0">No enquiries yet</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-borderless table-nowrap align-middle mb-0">
                      <thead className="table-light text-muted">
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentEnquiries.map((enq, i) => (
                          <tr key={enq._id || i}>
                            <td className="fw-medium">{enq.name}</td>
                            <td>{enq.email}</td>
                            <td>
                              <Badge color={
                                enq.status === 'NEW' ? 'info' :
                                enq.status === 'READ' ? 'warning' :
                                enq.status === 'REPLIED' ? 'success' : 'secondary'
                              }>{enq.status}</Badge>
                            </td>
                            <td>{new Date(enq.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
