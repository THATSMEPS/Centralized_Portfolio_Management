import React, { useContext, useState, useEffect } from "react";
import { Container, Row, Col, Card, CardBody, CardHeader, Label, Input, Button, Form } from "reactstrap";
import { AuthContext } from "../../context/AuthContext";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { updateCompany } from "../../api/companies.api";
import { getAllCountries, getStatesByCountry, getCitiesByState } from "../../api/locations.api";
import { toast } from "react-toastify";
import config from "../../config";

const UserProfile = () => {
    const { adminData, role, getAdmin } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({});
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);

    document.title = `Profile | Portfolio Admin`;

    const isEmployee = role === "EMPLOYEE";
    const isAdmin = role === "ADMIN";

    useEffect(() => {
        if (adminData) {
            setFormData({
                companyName: adminData.companyName || "",
                email: adminData.email || "",
                mobileNumber: adminData.mobileNumber || "",
                contactPersonName: adminData.contactPersonName || "",
                contactNumber: adminData.contactNumber || "",
                gstNumber: adminData.gstNumber || "",
                address: adminData.address || "",
                pincode: adminData.pincode || "",
                website: adminData.website || "",
                countryId: adminData.countryId?._id || adminData.countryId || "",
                stateId: adminData.stateId?._id || adminData.stateId || "",
                cityId: adminData.cityId?._id || adminData.cityId || "",
                logo: null,
                favicon: null,
            });
        }
    }, [adminData]);

    useEffect(() => {
        if (isEditing) {
            fetchCountries();
            if (formData.countryId) fetchStates(formData.countryId);
            if (formData.stateId) fetchCities(formData.stateId);
        }
    }, [isEditing]);

    const fetchCountries = async () => {
        try {
            const res = await getAllCountries();
            setCountries(res.data.data);
        } catch (err) {
            console.error("Error fetching countries", err);
        }
    };

    const fetchStates = async (countryId) => {
        try {
            const res = await getStatesByCountry(countryId);
            setStates(res.data.data);
        } catch (err) {
            console.error("Error fetching states", err);
        }
    };

    const fetchCities = async (stateId) => {
        try {
            const res = await getCitiesByState(stateId);
            setCities(res.data.data);
        } catch (err) {
            console.error("Error fetching cities", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        if (name === "countryId") {
            setFormData(prev => ({ ...prev, stateId: "", cityId: "" }));
            setStates([]);
            setCities([]);
            if (value) fetchStates(value);
        } else if (name === "stateId") {
            setFormData(prev => ({ ...prev, cityId: "" }));
            setCities([]);
            if (value) fetchCities(value);
        }
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const updateData = new FormData();
            Object.keys(formData).forEach(key => {
                if (key !== "email") { // Skip email as requested
                    if (formData[key] !== null && formData[key] !== undefined && formData[key] !== "") {
                        updateData.append(key, formData[key]);
                    }
                }
            });

            await updateCompany(adminData._id, updateData);
            toast.success("Profile updated successfully!");
            setIsEditing(false);
            getAdmin(); // Refresh data
        } catch (err) {
            console.error("Error updating profile", err);
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const formatLocation = () => {
        const city = adminData?.cityId?.cityName || adminData?.cityId;
        const state = adminData?.stateId?.stateName || adminData?.stateId;
        const country = adminData?.countryId?.countryName || adminData?.countryId;
        const pincode = adminData?.pincode;

        return [city, state, country, pincode].filter(v => typeof v === 'string' && v).join(", ");
    };

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="My Profile" pageTitle="Store" />
                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col xxl={6}>
                                <Card>
                                    <CardHeader className="d-flex align-items-center justify-content-between">
                                        <h5 className="card-title mb-0">Personal Details</h5>
                                        {isAdmin && !isEditing && (
                                            <Button color="primary" size="sm" onClick={() => setIsEditing(true)}>
                                                Edit Profile
                                            </Button>
                                        )}
                                        {isEditing && (
                                            <div>
                                                <Button color="success" size="sm" type="submit" disabled={loading} className="me-2">
                                                    {loading ? "Saving..." : "Save Changes"}
                                                </Button>
                                                <Button color="soft-danger" size="sm" onClick={() => setIsEditing(false)}>
                                                    Cancel
                                                </Button>
                                            </div>
                                        )}
                                    </CardHeader>
                                    <CardBody>
                                        <Row className="gy-3">
                                            <Col sm={6}>
                                                <Label className="form-label text-muted">Company Name</Label>
                                                {isEditing ? (
                                                    <Input
                                                        name="companyName"
                                                        value={formData.companyName}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                ) : (
                                                    <Input
                                                        type="text"
                                                        className="form-control-plaintext fw-semibold"
                                                        value={isEmployee ? adminData?.employeeName || "" : adminData?.companyName || ""}
                                                        readOnly
                                                    />
                                                )}
                                            </Col>
                                            <Col sm={6}>
                                                <Label className="form-label text-muted">Email Address</Label>
                                                <Input
                                                    type="email"
                                                    className="form-control-plaintext fw-semibold"
                                                    value={isEmployee ? adminData?.emailOffice || "" : adminData?.email || ""}
                                                    readOnly
                                                />
                                                {isEditing && <small className="text-info d-block">Email cannot be changed.</small>}
                                            </Col>
                                            <Col sm={6}>
                                                <Label className="form-label text-muted">Mobile Number</Label>
                                                {isEditing ? (
                                                    <Input
                                                        name="mobileNumber"
                                                        value={formData.mobileNumber}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                ) : (
                                                    <p className="fw-semibold">{adminData?.mobileNumber || "N/A"}</p>
                                                )}
                                            </Col>
                                            {!isEmployee && (
                                                <React.Fragment>
                                                    <Col sm={6}>
                                                        <Label className="form-label text-muted">Contact Person</Label>
                                                        {isEditing ? (
                                                            <Input
                                                                name="contactPersonName"
                                                                value={formData.contactPersonName}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            <p className="fw-semibold">{adminData?.contactPersonName || "N/A"}</p>
                                                        )}
                                                    </Col>
                                                    <Col sm={6}>
                                                        <Label className="form-label text-muted">Contact Number</Label>
                                                        {isEditing ? (
                                                            <Input
                                                                name="contactNumber"
                                                                value={formData.contactNumber}
                                                                onChange={handleInputChange}
                                                            />
                                                        ) : (
                                                            <p className="fw-semibold">{adminData?.contactNumber || "N/A"}</p>
                                                        )}
                                                    </Col>
                                                </React.Fragment>
                                            )}

                                            <Col sm={isAdmin ? 12 : 6}>
                                                <Label className="form-label text-muted">Address</Label>
                                                {isEditing ? (
                                                    <Input
                                                        type="textarea"
                                                        name="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        required
                                                    />
                                                ) : (
                                                    <p className="fw-semibold mb-0">
                                                        {adminData?.address || "N/A"}
                                                    </p>
                                                )}
                                                {!isEditing && (
                                                    <p className="fw-semibold">
                                                        {formatLocation()}
                                                    </p>
                                                )}
                                            </Col>

                                            {isEditing && (
                                                <React.Fragment>
                                                    <Col sm={4}>
                                                        <Label className="form-label">Country</Label>
                                                        <Input type="select" name="countryId" value={formData.countryId} onChange={handleInputChange} required>
                                                            <option value="">Select Country</option>
                                                            {countries.map(c => <option key={c._id} value={c._id}>{c.countryName}</option>)}
                                                        </Input>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <Label className="form-label">State</Label>
                                                        <Input type="select" name="stateId" value={formData.stateId} onChange={handleInputChange} required>
                                                            <option value="">Select State</option>
                                                            {states.map(s => <option key={s._id} value={s._id}>{s.stateName}</option>)}
                                                        </Input>
                                                    </Col>
                                                    <Col sm={4}>
                                                        <Label className="form-label">City</Label>
                                                        <Input type="select" name="cityId" value={formData.cityId} onChange={handleInputChange} required>
                                                            <option value="">Select City</option>
                                                            {cities.map(c => <option key={c._id} value={c._id}>{c.cityName}</option>)}
                                                        </Input>
                                                    </Col>
                                                    <Col sm={12}>
                                                        <Label className="form-label">Pincode</Label>
                                                        <Input name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                                                    </Col>
                                                </React.Fragment>
                                            )}
                                        </Row>
                                    </CardBody>
                                </Card>
                            </Col>

                            {!isEmployee && (
                                <Col xxl={6}>
                                    <Row>
                                        <Col lg={12}>
                                            <Card>
                                                <CardHeader>
                                                    <h5 className="card-title mb-0">Business Details & Assets</h5>
                                                </CardHeader>
                                                <CardBody>
                                                    <Row className="gy-3">
                                                        <Col sm={6}>
                                                            <Label className="form-label text-muted">GST Number</Label>
                                                            {isEditing ? (
                                                                <Input
                                                                    name="gstNumber"
                                                                    value={formData.gstNumber}
                                                                    onChange={handleInputChange}
                                                                />
                                                            ) : (
                                                                <p className="fw-semibold">{adminData?.gstNumber || "N/A"}</p>
                                                            )}
                                                        </Col>
                                                        <Col sm={6}>
                                                            <Label className="form-label text-muted">Website</Label>
                                                            {isEditing ? (
                                                                <Input
                                                                    name="website"
                                                                    value={formData.website}
                                                                    onChange={handleInputChange}
                                                                />
                                                            ) : (
                                                                <p className="fw-semibold">{adminData?.website || "N/A"}</p>
                                                            )}
                                                        </Col>
                                                        <Col sm={6}>
                                                            <Label className="form-label text-muted d-block">Company Logo</Label>
                                                            <div className="mb-2">
                                                                {adminData?.logo ? (
                                                                    <img src={`${config.api.API_URL}/${adminData.logo}`} alt="Logo" style={{ maxHeight: '80px', maxWidth: '100%', objectFit: 'contain' }} className="border p-1 rounded" />
                                                                ) : <span>No Logo</span>}
                                                            </div>
                                                            {isEditing && (
                                                                <Input type="file" name="logo" onChange={handleFileChange} accept="image/*" />
                                                            )}
                                                        </Col>
                                                        <Col sm={6}>
                                                            <Label className="form-label text-muted d-block">Favicon</Label>
                                                            <div className="mb-2">
                                                                {adminData?.favicon ? (
                                                                    <img src={`${config.api.API_URL}/${adminData.favicon}`} alt="Favicon" style={{ maxHeight: '40px', maxWidth: '100%', objectFit: 'contain' }} className="border p-1 rounded" />
                                                                ) : <span>No Favicon</span>}
                                                            </div>
                                                            {isEditing && (
                                                                <Input type="file" name="favicon" onChange={handleFileChange} accept="image/*" />
                                                            )}
                                                        </Col>
                                                    </Row>
                                                </CardBody>
                                            </Card>
                                        </Col>
                                    </Row>
                                </Col>
                            )}

                            {isEmployee && adminData?.storeId && (
                                <Col xxl={6}>
                                    <Card>
                                        <CardHeader className="bg-soft-info">
                                            <h5 className="card-title mb-0 text-info">Store Information</h5>
                                        </CardHeader>
                                        <CardBody>
                                            <Row className="gy-3">
                                                <Col sm={6}>
                                                    <Label className="form-label text-muted">Store Name</Label>
                                                    <p className="fw-bold text-primary">{adminData.storeId.storeName || "N/A"}</p>
                                                </Col>
                                                <Col sm={6}>
                                                    <Label className="form-label text-muted">Store Code</Label>
                                                    <p className="fw-semibold">{adminData.storeId.storeCode || "N/A"}</p>
                                                </Col>
                                                <Col sm={12}>
                                                    <Label className="form-label text-muted">Store Address</Label>
                                                    <p className="fw-semibold">{adminData.storeId.address || "N/A"}</p>
                                                </Col>
                                                <Col sm={6}>
                                                    <Label className="form-label text-muted">Contact Number</Label>
                                                    <p className="fw-semibold">{adminData.storeId.contactNumber || "N/A"}</p>
                                                </Col>
                                                <Col sm={6}>
                                                    <Label className="form-label text-muted">GST Number</Label>
                                                    <p className="fw-semibold">{adminData.storeId.gstNumber || "N/A"}</p>
                                                </Col>
                                            </Row>
                                        </CardBody>
                                    </Card>
                                </Col>
                            )}
                        </Row>
                    </Form>
                </Container>
            </div>
        </React.Fragment>
    );
};

export default UserProfile;
