import React, { useState } from 'react';
import { Card, CardBody, Col, Container, Row, Table, Button, Badge, Input } from 'reactstrap';
import { MOCK_MENU_ITEMS } from '../../common/data/mockData';

const MenuAvailability = () => {
    const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);

    const toggleAvailability = (id) => {
        setMenuItems(menuItems.map(item =>
            item.id === id ? { ...item, isAvailable: !item.isAvailable } : item
        ));
    };

    const categorizedItems = menuItems.reduce((acc, item) => {
        if (!acc[item.category]) {
            acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="page-content">
            <Container fluid>
                <Row>
                    <Col lg={12}>
                        <div className="d-flex align-items-center justify-content-between mb-4">
                            <div>
                                <h4 className="mb-0">Menu Availability</h4>
                                <p className="text-muted mb-0">Toggle items on/off for your store</p>
                            </div>
                        </div>
                    </Col>
                </Row>

                {Object.entries(categorizedItems).map(([category, items]) => (
                    <Row key={category}>
                        <Col lg={12}>
                            <Card>
                                <div className="card-header">
                                    <h5 className="card-title mb-0">{category}</h5>
                                </div>
                                <CardBody>
                                    <div className="table-responsive">
                                        <Table className="table table-borderless align-middle mb-0">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>Item Name</th>
                                                    <th>Description</th>
                                                    <th>Base Price</th>
                                                    <th>Type</th>
                                                    <th>Status</th>
                                                    <th>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="d-flex align-items-center">
                                                                <div className="avatar-sm flex-shrink-0 me-3">
                                                                    <div className="avatar-title bg-light rounded">
                                                                        <i className="ri-restaurant-line text-primary fs-4"></i>
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <h6 className="mb-0">{item.name}</h6>
                                                                    <small className="text-muted">{item.id}</small>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <p className="mb-0 text-muted fs-13">
                                                                {item.description}
                                                            </p>
                                                        </td>
                                                        <td>
                                                            <h6 className="mb-0">₹{item.basePrice}</h6>
                                                        </td>
                                                        <td>
                                                            {item.isCombo ? (
                                                                <Badge color="info" className="badge-soft-info">
                                                                    Combo
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="secondary" className="badge-soft-secondary">
                                                                    Single
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td>
                                                            {item.isAvailable ? (
                                                                <Badge color="success" className="badge-soft-success">
                                                                    Available
                                                                </Badge>
                                                            ) : (
                                                                <Badge color="danger" className="badge-soft-danger">
                                                                    Out of Stock
                                                                </Badge>
                                                            )}
                                                        </td>
                                                        <td>
                                                            <div className="form-check form-switch">
                                                                <Input
                                                                    type="checkbox"
                                                                    className="form-check-input"
                                                                    checked={item.isAvailable}
                                                                    onChange={() => toggleAvailability(item.id)}
                                                                    role="switch"
                                                                />
                                                                <label className="form-check-label">
                                                                    {item.isAvailable ? 'Disable' : 'Enable'}
                                                                </label>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                ))}
            </Container>
        </div>
    );
};

export default MenuAvailability;
