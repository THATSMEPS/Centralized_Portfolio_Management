import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import {
    Button,
    Card,
    CardBody,
    CardHeader,
    Col,
    Container,
    Label,
    Input,
    Row,
} from "reactstrap";
import { Link } from "react-router-dom";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import ReferenceErrorModal from "../../Components/Common/ReferenceErrorModal";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import FormsFooter from "../../Components/Common/FormAddFooter";
import FormUpdateFooter from "../../Components/Common/FormUpdateFooter";
import { toast } from "react-toastify";
import { AuthContext } from "../../context/AuthContext";
import { MenuContext } from "../../context/MenuContext";
import {
    createStore,
    deleteStore,
    getStoreById,
    updateStore,
    getAllStores,
    bulkCreateStores
} from "../../api/stores.api";
import { getAllCountries, getStatesByCountry, getCitiesByState } from "../../api/locations.api";
import BulkUploadModal from "../../Components/Common/BulkUploadModal";

const initialState = {
    storeName: "",
    storeCode: "",
    address: "",
    countryId: "",
    stateId: "",
    cityId: "",
    gstNumber: "",
    contactNumber: "",
    isActive: true,
    googleMapsLink: "",
    latitude: "",
    longitude: "",
    minOrderAmount: 200,
    isAcceptingOrders: true,
    openingTime: "10:00",
    closingTime: "22:00",
    imageUrl: "",
};

const StoreMaster = () => {
    const { adminData, role } = useContext(AuthContext);
    const { currentPagePermissions, isAdmin } = useContext(MenuContext);

    // Safety check: if adminData is not available yet, don't render or show loading
    // This prevents the 'Cannot read properties of null' crash
    const isLoadingAuth = !adminData;

    const [values, setValues] = useState(initialState);
    const [formErrors, setFormErrors] = useState({});
    const [isSubmit, setIsSubmit] = useState(false);
    const [filter, setFilter] = useState(true);
    const [imageFile, setImageFile] = useState(null);
    const imageInputRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isDeleteLoading, setIsDeleteLoading] = useState(false);

    const [stores, setStores] = useState([]);

    const [query, setQuery] = useState("");

    const [_id, set_Id] = useState("");
    const [remove_id, setRemove_id] = useState("");

    // Location States
    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [isStatesLoading, setIsStatesLoading] = useState(false);
    const [isCitiesLoading, setIsCitiesLoading] = useState(false);

    // Reference error modal states
    const [referenceModal, setReferenceModal] = useState(false);
    const [referenceData, setReferenceData] = useState(null);

    useEffect(() => {
        if (Object.keys(formErrors).length === 0 && isSubmit) {
            console.log("no errors");
        }
    }, [formErrors, isSubmit]);

    // Fetch countries
    const fetchCountries = useCallback(async () => {
        try {
            const response = await getAllCountries();
            if (response.data.isOk) {
                setCountryList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching countries:", error);
            toast.error("Failed to load countries");
        }
    }, []);

    useEffect(() => {
        fetchCountries();
    }, [fetchCountries]);

    // Fetch states by country
    const fetchStatesByCountry = useCallback(async (countryId) => {
        try {
            setIsStatesLoading(true);
            setStateList([]);
            const response = await getStatesByCountry(countryId);
            if (response.data.isOk) {
                setStateList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching states:", error);
            toast.error("Failed to load states");
        } finally {
            setIsStatesLoading(false);
        }
    }, []);

    // Fetch cities by state
    const fetchCitiesByState = useCallback(async (stateId) => {
        try {
            setIsCitiesLoading(true);
            setCityList([]);
            const response = await getCitiesByState(stateId);
            if (response.data.isOk) {
                setCityList(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
            toast.error("Failed to load cities");
        } finally {
            setIsCitiesLoading(false);
        }
    }, []);

    const [showForm, setShowForm] = useState(false);
    const [updateForm, setUpdateForm] = useState(false);

    // Removed modal_list and modal_edit in favor of showForm and updateForm

    const [modal_delete, setmodal_delete] = useState(false);
    const tog_delete = (_id) => {
        setmodal_delete(!modal_delete);
        setRemove_id(_id);
    };

    // Bulk Upload State
    const [bulkModalOpen, setBulkModalOpen] = useState(false);

    const toggleBulkModal = () => setBulkModalOpen(!bulkModalOpen);

    const handleBulkSave = async (data) => {
        setIsLoading(true);
        try {
            const payloads = data.map(item => ({
                storeName: item['Store Name'] || item.storeName,
                storeCode: item['Store Code'] || item.storeCode,
                address: item.Address || item.address,
                countryId: values.countryId || null,
                stateId: values.stateId || null,
                cityId: values.cityId || null,
                gstNumber: item.GST || item.gstNumber || "",
                contactNumber: item.Contact || item.contactNumber || "",
                isActive: true,
                companyId: adminData._id
            }));

            const res = await bulkCreateStores(payloads);
            if (res.data.isOk) {
                toast.success(res.data.message);
                toast.info("Note: Stores were created with currently selected (or empty) location settings.");
            } else {
                toast.warning("Bulk upload completed with potential issues.");
            }
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || "Bulk Upload Failed");
        } finally {
            setIsLoading(false);
            toggleBulkModal();
            fetchStores();
        }
    };

    const handleList = () => {
        setShowForm(!showForm);
        setUpdateForm(false);
        setValues(initialState);
        setIsSubmit(false);
        setFormErrors({});
        setStateList([]);
        setImageFile(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
        setCityList([]);
    };

    const handleTog_edit = (_id) => {
        setUpdateForm(true);
        setShowForm(true);
        setIsSubmit(false);
        set_Id(_id);
        setIsLoading(true);
        // ... rest of logic stays same, fetching data
        getStoreById(_id)
            .then(async (res) => {
                const data = res.data.data;
                const countryId = data.countryId && typeof data.countryId === 'object' ? data.countryId._id : data.countryId;
                const stateId = data.stateId && typeof data.stateId === 'object' ? data.stateId._id : data.stateId;
                const cityId = data.cityId && typeof data.cityId === 'object' ? data.cityId._id : data.cityId;

                // Load dependent locations
                if (countryId) await fetchStatesByCountry(countryId);
                if (stateId) await fetchCitiesByState(stateId);

                setValues({
                    ...values,
                    storeName: data.storeName,
                    storeCode: data.storeCode,
                    address: data.address,
                    countryId: countryId || "",
                    stateId: stateId || "",
                    cityId: cityId || "",
                    gstNumber: data.gstNumber || "",
                    contactNumber: data.contactNumber || "",
                    isActive: data.isActive,
                    latitude: data.location?.coordinates?.[1] || "",
                    longitude: data.location?.coordinates?.[0] || "",
                    minOrderAmount: data.minOrderAmount || 200,
                    isAcceptingOrders: data.isAcceptingOrders !== undefined ? data.isAcceptingOrders : true,
                    openingTime: data.openingTime || "10:00",
                    closingTime: data.closingTime || "22:00",
                    imageUrl: data.imageUrl || "",
                });
                setImageFile(null);
                if (imageInputRef.current) imageInputRef.current.value = '';
            })
            .catch((err) => {
                console.log(err);
                toast.error("Failed to fetch store details");
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const handleChange = async (e) => {
        const { name, value } = e.target;

        if (name === "countryId") {
            setValues({ ...values, countryId: value, stateId: "", cityId: "" });
            setStateList([]);
            setCityList([]);
            if (value) await fetchStatesByCountry(value);
        } else if (name === "stateId") {
            setValues({ ...values, stateId: value, cityId: "" });
            setCityList([]);
            if (value) await fetchCitiesByState(value);
        } else {
            setValues({ ...values, [name]: value });
        }
    };

    const handleCheck = (e) => {
        setValues({ ...values, isActive: e.target.checked });
    };

    const handleSubmitCancel = () => {
        setShowForm(false);
        setUpdateForm(false);
        setValues(initialState);
        setIsSubmit(false);
        setImageFile(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleClick = (e) => {
        e.preventDefault();
        setFormErrors({});
        let errors = validate(values);
        setFormErrors(errors);
        setIsSubmit(true);

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });
            formData.append('companyId', adminData._id);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            createStore(formData)
                .then((res) => {
                    if (res.data.isOk) {
                        toast.success("Store Added Successfully!");
                        handleList();
                        fetchStores();
                    }
                })
                .catch((error) => {
                    console.log(error);
                    toast.error(error.response?.data?.message || "Failed to add store.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const handleDelete = (e) => {
        e.preventDefault();
        setIsDeleteLoading(true);
        deleteStore(remove_id)
            .then((res) => {
                setmodal_delete(!modal_delete);
                toast.success("Store Removed Successfully!");
                fetchStores();
            })
            .catch((err) => {
                console.log(err);
                setmodal_delete(false);

                if (err.response && err.response.status === 409) {
                    setReferenceData(err.response.data);
                    setReferenceModal(true);
                } else {
                    toast.error("Failed to delete store.");
                }
            })
            .finally(() => {
                setIsDeleteLoading(false);
            });
    };

    const handleDeleteClose = (e) => {
        e.preventDefault();
        setmodal_delete(false);
    };

    const handleReferenceModalClose = () => {
        setReferenceModal(false);
        setReferenceData(null);
    };

    const handleUpdateCancel = (e) => {
        setShowForm(false);
        setUpdateForm(false);
        setIsSubmit(false);
        setFormErrors({});
        setImageFile(null);
        if (imageInputRef.current) imageInputRef.current.value = '';
    };

    const handleUpdate = (e) => {
        e.preventDefault();
        let errors = validate(values);
        setFormErrors(errors);
        setIsSubmit(true);

        if (Object.keys(errors).length === 0) {
            setIsLoading(true);
            const formData = new FormData();
            Object.keys(values).forEach(key => {
                if (values[key] !== null && values[key] !== undefined && values[key] !== '') {
                    formData.append(key, values[key]);
                }
            });
            formData.append('companyId', adminData._id);
            if (imageFile) {
                formData.append('image', imageFile);
            }
            updateStore(_id, formData)
                .then((res) => {
                    setShowForm(false);
                    setUpdateForm(false);
                    fetchStores();
                    toast.success("Store Updated Successfully!");
                })
                .catch((err) => {
                    console.log(err);
                    toast.error(err.response?.data?.message || "Failed to update store.");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    };

    const extractCoordsFromGoogleMapsLink = (link) => {
        if (!link) return null;

        try {
            // Pattern 1: @latitude,longitude,zoom (most common when sharing location)
            const pattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match1 = link.match(pattern1);
            if (match1) {
                return { latitude: match1[1], longitude: match1[2] };
            }

            // Pattern 2: q=latitude,longitude
            const pattern2 = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
            const match2 = link.match(pattern2);
            if (match2) {
                return { latitude: match2[1], longitude: match2[2] };
            }

            // Pattern 3: place URL with coordinates
            const pattern3 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
            const match3 = link.match(pattern3);
            if (match3) {
                return { latitude: match3[1], longitude: match3[2] };
            }

            return null;
        } catch (error) {
            console.error("Error parsing Google Maps link:", error);
            return null;
        }
    };

    const handleGoogleMapsLinkChange = (e) => {
        const link = e.target.value;
        setValues({ ...values, googleMapsLink: link });

        if (link) {
            const coords = extractCoordsFromGoogleMapsLink(link);
            if (coords) {
                setValues({
                    ...values,
                    googleMapsLink: link,
                    latitude: coords.latitude,
                    longitude: coords.longitude,
                });
                toast.success("Coordinates extracted from Google Maps link!");
            }
        }
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        toast.info("Getting your location...");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setValues({
                    ...values,
                    latitude: position.coords.latitude.toFixed(6),
                    longitude: position.coords.longitude.toFixed(6),
                });
                toast.success("Location captured successfully!");
            },
            (error) => {
                console.error("Error getting location:", error);
                toast.error("Failed to get location. Please enter manually.");
            }
        );
    };

    const validate = (values) => {
        const errors = {};

        if (!values.storeName) errors.storeName = "Store Name is required!";
        if (!values.storeCode) errors.storeCode = "Store Code is required!";
        if (!values.address) errors.address = "Address is required!";
        if (!values.countryId) errors.countryId = "Country is required!";
        if (!values.stateId) errors.stateId = "State is required!";
        if (!values.cityId) errors.cityId = "City is required!";
        if (!values.contactNumber) errors.contactNumber = "Contact Number is required!";
        else if (values.contactNumber.length !== 10) errors.contactNumber = "Contact Number should be 10 digits!";

        return errors;
    };

    const [loading, setLoading] = useState(false);
    // Pagination states removed for basic implementation using getAllStores (client side pagination via DataTable)

    useEffect(() => {
        fetchStores();
    }, [filter]);

    const fetchStores = async () => {
        setLoading(true);
        try {
            // Using getAllStores instead of search for now
            const response = await getAllStores();
            if (response.data.isOk) {
                let data = response.data.data;
                if (filter) {
                    data = data.filter(item => item.isActive === true);
                }
                setStores(data);
            } else {
                setStores([]);
            }
        } catch (error) {
            console.error("Error fetching stores:", error);
            setStores([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = (e) => {
        setFilter(e.target.checked);
    };

    // Filter on search query
    const filteredStores = stores.filter(store =>
        store.storeName.toLowerCase().includes(query.toLowerCase()) ||
        store.storeCode.toLowerCase().includes(query.toLowerCase())
    );

    const col = [
        {
            name: "Sr No",
            selector: (row, index) => index + 1,
            sortable: true,
            maxWidth: "20px",
        },
        {
            name: "Store Name",
            selector: (row) => row.storeName,
            sortable: true,
            sortField: "storeName",
            minWidth: "150px",
        },
        {
            name: "Store Code",
            selector: (row) => row.storeCode,
            sortable: true,
            sortField: "storeCode",
            minWidth: "100px",
        },
        {
            name: "Contact",
            selector: (row) => row.contactNumber || "-",
            minWidth: "120px",
        },
        {
            name: "Status",
            selector: (row) => (row.isActive ? "Active" : "Inactive"),
            minWidth: "100px",
        },
        {
            name: "Action",
            selector: (row) => {
                return (
                    <React.Fragment>
                        <div className="d-flex gap-2">
                            <div className="view">
                                <Link to={`/store-dashboard/${row._id}`} className="btn btn-sm btn-info">
                                    <i className="ri-eye-line me-1"></i> View
                                </Link>
                            </div>
                            <div className="edit">
                                {(currentPagePermissions.edit || isAdmin) && (
                                    <button
                                        className="btn btn-sm btn-success edit-item-btn "
                                        data-bs-toggle="modal"
                                        data-bs-target="#showModal"
                                        onClick={() => handleTog_edit(row._id)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>

                            <div className="remove">
                                {(currentPagePermissions.delete || isAdmin) && (
                                    <button
                                        className="btn btn-sm btn-danger remove-item-btn"
                                        data-bs-toggle="modal"
                                        data-bs-target="#deleteRecordModal"
                                        onClick={() => tog_delete(row._id)}
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                            {(!currentPagePermissions.edit && !isAdmin &&
                                !currentPagePermissions.delete && !isAdmin) && (
                                    <span className="text-muted">
                                        No actions
                                    </span>
                                )}
                        </div>
                    </React.Fragment>
                );
            },
            sortable: false,
            minWidth: "150px",
        },
    ];



    if (isLoadingAuth) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </Container>
            </div>
        );
    }

    document.title = `Store Master | ${adminData?.companyName || "Portfolio Admin"}`;

    return (
        <React.Fragment>
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb
                        maintitle="Setup"
                        title="Store Master"
                        pageTitle="Setup"
                    />
                    <Row>
                        <Col lg={12}>
                            <Card>
                                <CardHeader>
                                    <FormsHeader
                                        formName="Store"
                                        filter={filter}
                                        handleFilter={handleFilter}
                                        tog_list={handleList}
                                        setQuery={setQuery}
                                        showAddButton={currentPagePermissions.write || isAdmin}
                                    >
                                        {!showForm && !updateForm && (
                                            <div className="ms-2">
                                                {role !== "EMPLOYEE" && (
                                                    <Button color="success" className="me-1 d-flex align-items-center" onClick={toggleBulkModal}>
                                                        <i className="ri-upload-cloud-line align-bottom me-1"></i> Upload
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </FormsHeader>
                                </CardHeader>

                                <CardBody>
                                    {(showForm || updateForm) ? (
                                        <div className="form-content">
                                            <form>
                                                <Row>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="text"
                                                                required
                                                                name="storeName"
                                                                value={values.storeName}
                                                                onChange={handleChange}
                                                            />
                                                            <Label>
                                                                Store Name <span className="text-danger">*</span>
                                                            </Label>
                                                            {isSubmit && <p className="text-danger">{formErrors.storeName}</p>}
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="text"
                                                                required
                                                                name="storeCode"
                                                                value={values.storeCode}
                                                                onChange={handleChange}
                                                            />
                                                            <Label>
                                                                Store Code <span className="text-danger">*</span>
                                                            </Label>
                                                            {isSubmit && <p className="text-danger">{formErrors.storeCode}</p>}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="form-floating mb-3">
                                                    <Input
                                                        type="textarea"
                                                        required
                                                        name="address"
                                                        value={values.address}
                                                        onChange={handleChange}
                                                        style={{ height: "80px" }}
                                                    />
                                                    <Label>
                                                        Address <span className="text-danger">*</span>
                                                    </Label>
                                                    {isSubmit && <p className="text-danger">{formErrors.address}</p>}
                                                </div>

                                                <Row>
                                                    <Col md={4}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="select"
                                                                name="countryId"
                                                                value={values.countryId}
                                                                onChange={handleChange}
                                                            >
                                                                <option value="">Select Country</option>
                                                                {countryList.map((country) => (
                                                                    <option key={country._id} value={country._id}>{country.countryName}</option>
                                                                ))}
                                                            </Input>
                                                            <Label>Country <span className="text-danger">*</span></Label>
                                                            {isSubmit && <p className="text-danger">{formErrors.countryId}</p>}
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="select"
                                                                name="stateId"
                                                                value={values.stateId}
                                                                onChange={handleChange}
                                                                disabled={!values.countryId || isStatesLoading}
                                                            >
                                                                <option value="">Select State</option>
                                                                {stateList.map((state) => (
                                                                    <option key={state._id} value={state._id}>{state.stateName}</option>
                                                                ))}
                                                            </Input>
                                                            <Label>State <span className="text-danger">*</span></Label>
                                                            {isSubmit && <p className="text-danger">{formErrors.stateId}</p>}
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="select"
                                                                name="cityId"
                                                                value={values.cityId}
                                                                onChange={handleChange}
                                                                disabled={!values.stateId || isCitiesLoading}
                                                            >
                                                                <option value="">Select City</option>
                                                                {cityList.map((city) => (
                                                                    <option key={city._id} value={city._id}>{city.cityName}</option>
                                                                ))}
                                                            </Input>
                                                            <Label>City <span className="text-danger">*</span></Label>
                                                            {isSubmit && <p className="text-danger">{formErrors.cityId}</p>}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="text"
                                                                name="gstNumber"
                                                                value={values.gstNumber}
                                                                onChange={handleChange}
                                                            />
                                                            <Label>GST Number</Label>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="text"
                                                                required
                                                                name="contactNumber"
                                                                value={values.contactNumber}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;
                                                                    if (value === "" || /^[0-9]+$/.test(value)) {
                                                                        handleChange({ target: { name: "contactNumber", value } });
                                                                    }
                                                                }}
                                                                maxLength={10}
                                                            />
                                                            <Label>Contact Number <span className="text-danger">*</span></Label>
                                                            {isSubmit && formErrors.contactNumber && <p className="text-danger">{formErrors.contactNumber}</p>}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* Store Image */}
                                                <Row>
                                                    <Col md={12}>
                                                        <div className="mb-3">
                                                            <Label>Store Image (Max 2MB)</Label>
                                                            <Input
                                                                type="file"
                                                                accept="image/*"
                                                                innerRef={imageInputRef}
                                                                onChange={(e) => setImageFile(e.target.files?.[0])}
                                                            />
                                                            {values.imageUrl && !imageFile && (
                                                                <small className="text-muted d-block mt-1">
                                                                    Current: {values.imageUrl.split('/').pop()}
                                                                </small>
                                                            )}
                                                            {imageFile && (
                                                                <small className="text-success d-block mt-1">
                                                                    New image selected: {imageFile.name}
                                                                </small>
                                                            )}
                                                        </div>
                                                    </Col>
                                                </Row>

                                                {/* Location Section */}
                                                <Row className="mt-3">
                                                    <Col md={12}>
                                                        <h5 className="mb-3">Store Location & Orders</h5>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={12}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="text"
                                                                name="googleMapsLink"
                                                                value={values.googleMapsLink}
                                                                onChange={handleGoogleMapsLinkChange}
                                                                placeholder="Paste Google Maps link here"
                                                            />
                                                            <Label>Google Maps Link</Label>
                                                            <small className="text-muted">
                                                                Open Google Maps, search for the store location, click Share → Copy link, and paste here
                                                            </small>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={5}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="number"
                                                                name="latitude"
                                                                value={values.latitude}
                                                                onChange={handleChange}
                                                                step="0.000001"
                                                                placeholder="Latitude"
                                                            />
                                                            <Label>Latitude</Label>
                                                        </div>
                                                    </Col>
                                                    <Col md={5}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="number"
                                                                name="longitude"
                                                                value={values.longitude}
                                                                onChange={handleChange}
                                                                step="0.000001"
                                                                placeholder="Longitude"
                                                            />
                                                            <Label>Longitude</Label>
                                                        </div>
                                                    </Col>
                                                    <Col md={2}>
                                                        <Button
                                                            color="success"
                                                            outline
                                                            onClick={handleGetLocation}
                                                            type="button"
                                                            className="w-100"
                                                            title="Use only if you are physically at the store location"
                                                        >
                                                            <i className="ri-map-pin-line"></i> Current
                                                        </Button>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={4}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="number"
                                                                name="minOrderAmount"
                                                                value={values.minOrderAmount}
                                                                onChange={handleChange}
                                                                min="0"
                                                            />
                                                            <Label>Minimum Order Amount (₹)</Label>
                                                        </div>
                                                    </Col>
                                                    <Col md={4}>
                                                        <div className="mb-3 pt-2">
                                                            <div className="form-check form-switch">
                                                                <Input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    role="switch"
                                                                    id="isAcceptingOrdersSwitch"
                                                                    name="isAcceptingOrders"
                                                                    checked={values.isAcceptingOrders}
                                                                    onChange={(e) => setValues({ ...values, isAcceptingOrders: e.target.checked })}
                                                                />
                                                                <Label className="form-check-label" htmlFor="isAcceptingOrdersSwitch">
                                                                    Accepting Orders
                                                                </Label>
                                                            </div>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <Row>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="time"
                                                                name="openingTime"
                                                                value={values.openingTime}
                                                                onChange={handleChange}
                                                            />
                                                            <Label>Opening Time</Label>
                                                        </div>
                                                    </Col>
                                                    <Col md={6}>
                                                        <div className="form-floating mb-3">
                                                            <Input
                                                                type="time"
                                                                name="closingTime"
                                                                value={values.closingTime}
                                                                onChange={handleChange}
                                                            />
                                                            <Label>Closing Time</Label>
                                                        </div>
                                                    </Col>
                                                </Row>

                                                <div className="mb-3">
                                                    <div className="form-check form-switch">
                                                        <Input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            role="switch"
                                                            id="isActiveSwitch"
                                                            checked={values.isActive}
                                                            onChange={handleCheck}
                                                        />
                                                        <Label className="form-check-label" htmlFor="isActiveSwitch">
                                                            Is Active
                                                        </Label>
                                                    </div>
                                                </div>

                                                <div className="mt-4">
                                                    {showForm && !updateForm ? (
                                                        <FormsFooter
                                                            handleSubmit={handleClick}
                                                            handleSubmitCancel={handleSubmitCancel}
                                                            isLoading={isLoading}
                                                        />
                                                    ) : (
                                                        <FormUpdateFooter
                                                            handleUpdate={handleUpdate}
                                                            handleUpdateCancel={handleUpdateCancel}
                                                            isLoading={isLoading}
                                                        />
                                                    )}
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div id="customerList">
                                            <div className="table-responsive table-card mt-1 mb-1 text-right">
                                                <DataTable
                                                    columns={col}
                                                    data={filteredStores}
                                                    progressPending={loading}
                                                    pagination
                                                    paginationPerPage={10}
                                                    paginationRowsPerPageOptions={[10, 50, 100]}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>

            <DeleteModal
                show={modal_delete}
                handleDelete={handleDelete}
                toggle={handleDeleteClose}
                setmodal_delete={setmodal_delete}
                disabled={isDeleteLoading}
            />

            <ReferenceErrorModal
                isOpen={referenceModal}
                toggle={handleReferenceModalClose}
                title="Cannot Delete Store"
                referenceData={referenceData}
            />

            <BulkUploadModal
                isOpen={bulkModalOpen}
                toggle={toggleBulkModal}
                onSave={handleBulkSave}
                columns={['Store Name', 'Store Code', 'Address', 'GST', 'Contact']}
                templateName="Store"
            />
        </React.Fragment>
    );
};

export default StoreMaster;
