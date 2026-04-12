import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Label,
  Input,
  Row,
} from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import DeleteModal from "../../Components/Common/DeleteModal";
import FormsHeader from "../../Components/Common/FormsModalHeader";
import FormsFooter from "../../Components/Common/FormAddFooter";
import FormUpdateFooter from "../../Components/Common/FormUpdateFooter";
import { toast } from "react-toastify";
import { createMenuGroup, deleteMenuGroup, getMenuGroupById, updateMenuGroup, searchMenuGroups, reorderMenuGroups } from "../../api/menus.api";
import { MenuContext } from "../../context/MenuContext";
import IconPicker from "../../Components/Common/IconPicker";
import DraggableTable from "../../Components/Common/DraggableTable";

const initialState = {
  menuGroupName: "",
  sequence: "",
  isActive: false,
  isLink: false,
  menuUrl: "",
  icon: "",
};

const MenuGroup = () => {
  const { currentPagePermissions } = useContext(MenuContext);
  const { role, isSuperAdmin } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (role && role !== "ADMIN") {
      navigate("/dashboard");
    }
    if (role === "ADMIN" && !isSuperAdmin) {
      navigate("/dashboard");
    }
  }, [role, isSuperAdmin, navigate]);

  const [values, setValues] = useState(initialState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmit, setIsSubmit] = useState(false);
  const [filter, setFilter] = useState(true);

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const [departments, setDepartments] = useState([]);

  const [query, setQuery] = useState("");

  const [_id, set_Id] = useState("");
  const [remove_id, setRemove_id] = useState("");

  useEffect(() => {
    if (Object.keys(formErrors).length === 0 && isSubmit) {
      console.log("no errors");
    }
  }, [formErrors, isSubmit]);

  const [modal_list, setmodal_list] = useState(false);
  const tog_list = () => {
    setmodal_list(!modal_list);
    setValues(initialState);
    setIsSubmit(false);
  };

  const [modal_delete, setmodal_delete] = useState(false);
  const tog_delete = (_id) => {
    setmodal_delete(!modal_delete);
    setRemove_id(_id);
  };

  const [modal_edit, setmodal_edit] = useState(false);

  const handleTog_edit = (_id) => {
    setmodal_edit(!modal_edit);
    setIsSubmit(false);
    set_Id(_id);
    setIsLoading(true);
    getMenuGroupById(_id)
      .then((res) => {
        setValues({
          ...values,
          menuGroupName: res.data.data.menuGroupName,
          sequence: res.data.data.sequence,
          isActive: res.data.data.isActive,
          isLink: res.data.data.isLink,
          menuUrl: res.data.data.menuUrl,
          icon: res.data.data.icon || "",
        });
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to fetch menu group details");
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCheck = (e) => {
    setValues({ ...values, [e.target.name]: e.target.checked });
  };

  const handleSubmitCancel = () => {
    setmodal_list(false);
    setValues(initialState);
    setIsSubmit(false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    setFormErrors({});
    let errors = validate(values);
    setFormErrors(errors);
    setIsSubmit(true);
    const dataToSend = {
      ...values,
    }
    if (
      Object.keys(errors).length === 0
    ) {
      setIsLoading(true);
      createMenuGroup(dataToSend)
        .then((res) => {
          if (res.data.isOk) {
            toast.success("Menu Group Added Successfully!");
            setmodal_list(!modal_list);
            setValues(initialState);
            fetchDepartments();
          }
        })
        .catch((error) => {
          console.log("Error creating menu group:", error);
          toast.error("Failed to add menu group. Please try again.");
        }).finally(() => {
          setIsLoading(false);
        });
    }
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setIsDeleteLoading(true);
    deleteMenuGroup(remove_id)
      .then((res) => {
        setmodal_delete(!modal_delete);
        toast.success("Menu Group Removed Successfully!");
        fetchDepartments();
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to remove menu group. Please try again.");
      }).finally(() => {
        setIsDeleteLoading(false);
      });
  };

  const handleDeleteClose = (e) => {
    e.preventDefault();
    setmodal_delete(false);
  };

  const handleUpdateCancel = (e) => {
    setmodal_edit(false);
    setIsSubmit(false);
    setFormErrors({});
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    let erros = validate(values);
    setFormErrors(erros);
    setIsSubmit(true);

    if (Object.keys(erros).length === 0) {
      setIsLoading(true);
      updateMenuGroup(_id, values)
        .then((res) => {
          setmodal_edit(!modal_edit);
          fetchDepartments();
          toast.success("Menu Group Updated Successfully!");
        })
        .catch((err) => {
          console.log(err);
          toast.error("Failed to update menu group. Please try again.");
        }).finally(() => {
          setIsLoading(false);
        });
    }
  };

  const validate = (values) => {
    const errors = {};

    if (values.menuGroupName === "") {
      errors.menuGroupName = "Menu Group Name is required!";
    }

    if (values.sequence === "") {
      errors.sequence = "Sequence is required!";
    }

    if (values.isLink && values.menuUrl === "") {
      errors.menuUrl = "Menu URL is required for direct link menu groups!";
    }

    return errors;
  };


  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [perPage, setPerPage] = useState(100);
  const [pageNo, setPageNo] = useState(0);
  const [column, setcolumn] = useState("sequence");
  const [sortDirection, setsortDirection] = useState("asc");

  const handleSort = (column, sortDirection) => {
    setcolumn(column.sortField);
    setsortDirection(sortDirection);
  };

  useEffect(() => {
    fetchDepartments();
  }, [pageNo, perPage, column, sortDirection, query, filter]);

  const fetchDepartments = async () => {
    setLoading(true);
    let skip = (pageNo - 1) * perPage;
    if (skip < 0) {
      skip = 0;
    }

    await searchMenuGroups({
      skip: skip,
      per_page: perPage,
      sorton: column,
      sortdir: sortDirection,
      match: query,
      isActive: filter,
    })
      .then((response) => {
        if (response.data.data.length > 0) {
          let res = response.data.data[0];
          setLoading(false);
          setTotalRows(res.count);
          setDepartments(res.data);
        } else {
          setDepartments([]);
        }
      });

    setLoading(false);
  };

  const handlePageChange = (page) => {
    setPageNo(page);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
  };
  const handleFilter = (e) => {
    setPageNo(1)
    setFilter(e.target.checked);
  };

  const handleReorder = async (newOrder) => {
    // Optimistically update
    setDepartments(newOrder);

    // Prepare data
    // Protect against pageNo being 0 on first render
    const validPageNo = Math.max(1, pageNo);
    let startSequence = (validPageNo - 1) * perPage + 1;

    // If the list was sorted by sequence Ascending:
    if (column === "sequence" && sortDirection === "asc") {
      // Instead of forcing strict 1,2,3 we can extract all existing sequences, sort them, and re-apply them to the new array order. This preserves sequence gaps.
      const existingSequences = newOrder.map(item => item.sequence).sort((a, b) => a - b);

      const sequences = newOrder.map((item, index) => ({
        id: item._id,
        sequence: existingSequences[index] || (startSequence + index) // Fallback to index if undefined
      }));

      try {
        const res = await reorderMenuGroups(sequences);
        if (res.data.isOk) {
          toast.success("Sequence updated successfully!");
          // No need to fetch immediately if optimistic update looks good
          // fetchDepartments();
        }
      } catch (error) {
        toast.error("Failed to update sequence");
        fetchDepartments(); // Refetch on error
      }
    } else {
      toast.info("Please sort by Sequence (Ascending) to reorder items.");
      fetchDepartments(); // Cancel the visual reorder since it won't be saved
    }
  };

  const col = [
    {
      name: "Sr No",
      selector: (row, index) => index + 1,
      sortable: true,
    },
    {
      name: "Menu Group Name",
      selector: (row) => row.menuGroupName,
      sortable: true,
      sortField: "menuGroupName",
    },
    {
      name: "Sequence",
      selector: (row, index) => index + 1,
      sortable: true,
      sortField: "sequence",
    },
    {
      name: "Status",
      selector: (row) => (row.isActive ? "Active" : "Inactive"),
    },
    {
      name: "Action",
      selector: (row) => {
        return (
          <React.Fragment>
            <div className="d-flex gap-2">
              {currentPagePermissions.edit && (
                <div className="edit">
                  <button
                    className="btn btn-sm btn-success edit-item-btn "
                    data-bs-toggle="modal"
                    data-bs-target="#showModal"
                    onClick={() => handleTog_edit(row._id)}
                  >
                    Edit
                  </button>
                </div>
              )}
              {currentPagePermissions.delete && (
                <div className="remove">
                  <button
                    className="btn btn-sm btn-danger remove-item-btn"
                    data-bs-toggle="modal"
                    data-bs-target="#deleteRecordModal"
                    onClick={() => tog_delete(row._id)}
                  >
                    Remove
                  </button>
                </div>
              )}
              {!currentPagePermissions.edit && !currentPagePermissions.delete && (
                <span className="text-muted">No actions available</span>
              )}
            </div>
          </React.Fragment>
        );
      },
      sortable: false,
    },
  ];

  document.title = `Menu Group Master | Portfolio Admin`;

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb
            maintitle="Master"
            title="Menu Group"
            pageTitle="Master"
          />
          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <FormsHeader
                    formName="Menu Group"
                    filter={filter}
                    handleFilter={handleFilter}
                    tog_list={tog_list}
                    setQuery={setQuery}
                    showAddButton={currentPagePermissions.write}
                  />
                </CardHeader>

                <CardBody>
                  <div id="customerList">
                    <div className="table-responsive table-card mt-1 mb-1 text-right">
                      <DraggableTable
                        columns={col}
                        data={departments}
                        progressPending={loading}
                        onReorder={handleReorder}
                      />

                      {/* Basic Pagination fallback since DraggableTable doesn't have it built-in yet */}
                      {departments.length > 0 && (
                        <div className="d-flex justify-content-end mt-3 p-2">
                          <span className="me-3 align-self-center text-muted">
                            Total Rows: {totalRows}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={modal_list}
        toggle={() => {
          tog_list();
        }}
        centered
      >
        <ModalHeader
          className="bg-light p-3"
          toggle={() => {
            setmodal_list(false);
            setIsSubmit(false);
          }}
        >
          Add Menu Group
        </ModalHeader>
        <form>
          <ModalBody>
            <div className="form-floating mb-3">
              <Input
                type="text"
                required
                name="menuGroupName"
                value={values.menuGroupName}
                onChange={handleChange}
              />
              <Label>
                Menu Group Name <span className="text-danger">*</span>{" "}
              </Label>
              {isSubmit && (
                <p className="text-danger">{formErrors.menuGroupName}</p>
              )}
            </div>
            <div className="form-floating mb-3">
              <Input
                type="number"
                required
                name="sequence"
                value={values.sequence}
                onChange={handleChange}
                min={1}
              />
              <Label>
                Sequence<span className="text-danger">*</span>{" "}
              </Label>
              {isSubmit && (
                <p className="text-danger">{formErrors.sequence}</p>
              )}
            </div>
            <IconPicker
              value={values.icon}
              onChange={(icon) => setValues({ ...values, icon })}
              label="Menu Group Icon"
            />
            <div className="mb-3">
              <Input
                type="checkbox"
                className="form-check-input"
                name="isLink"
                checked={values.isLink}
                onChange={handleCheck}
                id="isLinkCheckbox"
              />
              <Label className="form-check-label ms-1" htmlFor="isLinkCheckbox">
                Is Direct Link (no submenus)
              </Label>
            </div>
            {values.isLink && (
              <div className="form-floating mb-3">
                <Input
                  type="text"
                  required
                  name="menuUrl"
                  value={values.menuUrl}
                  onChange={handleChange}
                />
                <Label>
                  Menu URL <span className="text-danger">*</span>{" "}
                </Label>
                {isSubmit && (
                  <p className="text-danger">{formErrors.menuUrl}</p>
                )}
              </div>
            )}
            <div className=" mb-3">
              <Input
                type="checkbox"
                className="form-check-input"
                name="isActive"
                value={values.isActive}
                onChange={handleCheck}
              />
              <Label className="form-check-label ms-1">Is Active</Label>
            </div>
          </ModalBody>
          <ModalFooter>
            <FormsFooter
              handleSubmit={handleClick}
              handleSubmitCancel={handleSubmitCancel}
              isLoading={isLoading}
            />
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={modal_edit}
        toggle={() => {
          handleTog_edit();
        }}
        centered
      >
        <ModalHeader
          className="bg-light p-3"
          toggle={() => {
            setmodal_edit(false);
            setIsSubmit(false);
          }}
        >
          Edit Menu Group
        </ModalHeader>
        <form>
          <ModalBody>
            <div className="form-floating mb-3">
              <Input
                type="text"
                required
                name="menuGroupName"
                value={values.menuGroupName}
                onChange={handleChange}
              />
              <Label>
                Menu Group Name <span className="text-danger">*</span>{" "}
              </Label>
              {isSubmit && (
                <p className="text-danger">{formErrors.menuGroupName}</p>
              )}
            </div>
            <div className="form-floating mb-3">
              <Input
                type="number"
                required
                name="sequence"
                value={values.sequence}
                onChange={handleChange}
                min={1}
              />
              <Label>
                Sequence<span className="text-danger">*</span>{" "}
              </Label>
              {isSubmit && (
                <p className="text-danger">{formErrors.sequence}</p>
              )}
            </div>
            <IconPicker
              value={values.icon}
              onChange={(icon) => setValues({ ...values, icon })}
              label="Menu Group Icon"
            />
            <div className="mb-3">
              <Input
                type="checkbox"
                className="form-check-input"
                name="isLink"
                checked={values.isLink}
                onChange={handleCheck}
                id="isLinkCheckboxEdit"
              />
              <Label className="form-check-label ms-1" htmlFor="isLinkCheckboxEdit">
                Is Direct Link (no submenus)
              </Label>
            </div>
            {values.isLink && (
              <div className="form-floating mb-3">
                <Input
                  type="text"
                  required
                  name="menuUrl"
                  value={values.menuUrl}
                  onChange={handleChange}
                />
                <Label>
                  Menu URL <span className="text-danger">*</span>{" "}
                </Label>
                {isSubmit && (
                  <p className="text-danger">{formErrors.menuUrl}</p>
                )}
              </div>
            )}
            <div className=" mb-3">
              <Input
                type="checkbox"
                className="form-check-input"
                name="isActive"
                checked={values.isActive}
                onChange={handleCheck}
              />
              <Label className="form-check-label ms-1">Is Active</Label>
            </div>
          </ModalBody>

          <ModalFooter>
            <FormUpdateFooter
              handleUpdate={handleUpdate}
              handleUpdateCancel={handleUpdateCancel}
              isLoading={isLoading}
            />
          </ModalFooter>
        </form>
      </Modal>

      <DeleteModal
        show={modal_delete}
        handleDelete={handleDelete}
        toggle={handleDeleteClose}
        setmodal_delete={setmodal_delete}
        disabled={isDeleteLoading}
      />
    </React.Fragment>
  );
};

export default MenuGroup;
