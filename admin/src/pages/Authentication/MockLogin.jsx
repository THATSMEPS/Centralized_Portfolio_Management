import React, { useContext, useState } from "react";
import { Card, CardBody, Col, Container, Row, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { MOCK_USERS } from "../../common/data/mockData";
import { ROLE_NAMES } from "../../common/data/roles";
import { setAuthorization } from "../../api";

const MockLogin = () => {
    const { setAdminData } = useContext(AuthContext);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleMockLogin = (userKey) => {
        setLoading(true);
        const user = MOCK_USERS[userKey];
        
        // Simulate API delay
        setTimeout(() => {
            // Set mock token
            const mockToken = `mock_token_${user._id}`;
            localStorage.setItem("_id", user._id);
            localStorage.setItem("token", mockToken);
            localStorage.setItem("role", user.role);
            localStorage.setItem("storeId", user.storeId || '');
            localStorage.setItem("storeName", user.storeName || '');
            
            setAuthorization(mockToken);
            setAdminData(user);
            
            setLoading(false);
            navigate("/dashboard");
        }, 500);
    };

    return (
        <div className="auth-page-wrapper pt-5">
            <div className="auth-one-bg-position auth-one-bg" id="auth-particles">
                <div className="bg-overlay"></div>
            </div>

            <div className="auth-page-content">
                <Container>
                    <Row>
                        <Col lg={12}>
                            <div className="text-center mt-sm-5 mb-4 text-white-50">
                                <div>
                                    <h1 className="display-5 coming-soon-text text-white">
                                        Portfolio Admin
                                    </h1>
                                    <p className="fs-16">Admin Panel - Mock Login</p>
                                </div>
                            </div>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col md={8} lg={6} xl={5}>
                            <Card className="mt-4">
                                <CardBody className="p-4">
                                    <div className="text-center mt-2">
                                        <h5 className="text-primary">Select User Role to Login</h5>
                                        <p className="text-muted">Mock authentication for UI testing</p>
                                    </div>
                                    <div className="p-2 mt-4">
                                        <div className="d-grid gap-3">
                                            {Object.entries(MOCK_USERS).map(([key, user]) => (
                                                <Button
                                                    key={key}
                                                    color={
                                                        user.role === 'super_super_admin' ? 'danger' :
                                                        user.role === 'super_admin' ? 'primary' :
                                                        'success'
                                                    }
                                                    size="lg"
                                                    onClick={() => handleMockLogin(key)}
                                                    disabled={loading}
                                                    className="text-start"
                                                >
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <div>
                                                            <div className="fw-bold">{user.name}</div>
                                                            <small className="opacity-75">{ROLE_NAMES[user.role]}</small>
                                                            {user.storeName && (
                                                                <div className="small mt-1">
                                                                    <i className="ri-store-2-line me-1"></i>
                                                                    {user.storeName}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <i className="ri-arrow-right-line fs-3"></i>
                                                    </div>
                                                </Button>
                                            ))}
                                        </div>

                                        <div className="mt-4 pt-4 border-top text-center">
                                            <p className="mb-0 text-muted">
                                                <i className="ri-information-line text-warning me-1"></i>
                                                This is a mock login for frontend testing only
                                            </p>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default MockLogin;
