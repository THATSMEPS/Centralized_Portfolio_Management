import React, { useState } from 'react';
import { Card, CardBody, Col, Container, Row, Table, Button, Badge } from 'reactstrap';
import { MOCK_MERCHANDISE } from '../../common/data/mockData';

const MerchandiseInventory = () => {
    const [products] = useState(MOCK_MERCHANDISE);

    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h4 className="mb-0">Merchandise Inventory</h4>
                                <p className="text-muted mb-0">Manage e-commerce products</p>
                            </div>
                            <Button color="primary">
                                <i className="ri-add-line me-1"></i> Add New Product
                            </Button>
                        </div>
                    </Col>
                </Row>

                {/* Summary Cards */}
                <Row>
                    <Col xl={3} md={6}>
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="text-uppercase fw-medium text-muted mb-0">Total Products</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4">45</h4>
                                        <span className="badge badge-soft-success mb-0">
                                            Active SKUs
                                        </span>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-success rounded fs-3">
                                            <i className="ri-product-hunt-line"></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={3} md={6}>
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="text-uppercase fw-medium text-muted mb-0">Monthly Revenue</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4">₹1.45L</h4>
                                        <span className="badge badge-soft-info mb-0">
                                            This Month
                                        </span>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-info rounded fs-3">
                                            <i className="ri-money-rupee-circle-line"></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={3} md={6}>
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="text-uppercase fw-medium text-muted mb-0">Low Stock Items</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4">8</h4>
                                        <span className="badge badge-soft-warning mb-0">
                                            <i className="ri-alert-line"></i> Needs Restock
                                        </span>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-warning rounded fs-3">
                                            <i className="ri-error-warning-line"></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>

                    <Col xl={3} md={6}>
                        <Card className="card-animate">
                            <CardBody>
                                <div className="d-flex align-items-center">
                                    <div className="flex-grow-1">
                                        <p className="text-uppercase fw-medium text-muted mb-0">Pending Orders</p>
                                    </div>
                                </div>
                                <div className="d-flex align-items-end justify-content-between mt-4">
                                    <div>
                                        <h4 className="fs-22 fw-semibold ff-secondary mb-4">23</h4>
                                        <span className="badge badge-soft-primary mb-0">
                                            To Ship
                                        </span>
                                    </div>
                                    <div className="avatar-sm flex-shrink-0">
                                        <span className="avatar-title bg-primary rounded fs-3">
                                            <i className="ri-truck-line"></i>
                                        </span>
                                    </div>
                                </div>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

                {/* Products Grid */}
                <Row>
                    {products.map((product) => (
                        <Col xl={4} md={6} key={product.id}>
                            <Card>
                                <CardBody>
                                    <div className="d-flex align-items-center mb-3">
                                        <div className="avatar-lg flex-shrink-0 me-3">
                                            <div className="avatar-title bg-light rounded">
                                                <i className="ri-shopping-bag-3-line text-primary fs-1"></i>
                                            </div>
                                        </div>
                                        <div className="flex-grow-1">
                                            <h5 className="mb-1">{product.name}</h5>
                                            <Badge 
                                                color={product.category === 'Coffee Beans' ? 'primary' : 
                                                       product.category === 'Mugs' ? 'info' : 'warning'}
                                                className="badge-soft"
                                            >
                                                {product.category}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="border-top pt-3">
                                        <Row className="g-3">
                                            <Col xs={6}>
                                                <div>
                                                    <p className="text-muted mb-1 fs-13">Price</p>
                                                    <h6 className="mb-0">₹{product.price}</h6>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div>
                                                    <p className="text-muted mb-1 fs-13">Stock</p>
                                                    <h6 className="mb-0">{product.stock} units</h6>
                                                </div>
                                            </Col>
                                        </Row>

                                        <div className="mt-3">
                                            <Badge 
                                                color={product.status === 'In Stock' ? 'success' : 'warning'}
                                                className={`badge-soft-${product.status === 'In Stock' ? 'success' : 'warning'} w-100`}
                                            >
                                                {product.status}
                                            </Badge>
                                        </div>

                                        <div className="mt-3 d-flex gap-2">
                                            <Button color="primary" size="sm" outline className="flex-grow-1">
                                                <i className="ri-edit-line me-1"></i> Edit
                                            </Button>
                                            <Button color="info" size="sm" outline className="flex-grow-1">
                                                <i className="ri-stock-line me-1"></i> Restock
                                            </Button>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>
        </div>
    );
};

export default MerchandiseInventory;
