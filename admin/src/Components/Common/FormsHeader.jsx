import React, { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  Label,
  Input,
  Row,
} from "reactstrap";

const FormsHeader = ({
  formName,
  filter,
  handleFilter,
  setQuery,
  initialState,
  setValues,
  updateForm,
  showForm,
  setShowForm,
  setUpdateForm,
  openAddForm,
  tog_list,
  showAddButton = true,
  children
}) => {
  return (
    <React.Fragment>
      <React.Fragment>
        <Row className="g-3 mb-1 align-items-center">
          <Col lg={4} md={6} sm={12}>
            <h2 className="card-title mb-0 fs-4">{formName}</h2>
          </Col>

          <Col lg={8} md={6} sm={12}>
            <div className="d-flex align-items-center justify-content-end flex-wrap gap-2">
              <div className={`d-flex align-items-center me-2 ${showForm || updateForm ? "d-none" : ""}`}>
                <Input
                  type="checkbox"
                  className="form-check-input mt-0"
                  name="filter"
                  checked={filter}
                  onChange={handleFilter}
                />
                <Label className="form-check-label ms-2 mb-0">Active</Label>
              </div>

              <div className="d-flex align-items-center gap-2">
                {children}

                {!showForm && !updateForm && showAddButton && (
                  <Button
                    color="success"
                    className="add-btn btn-fixed-width d-flex align-items-center justify-content-center"
                    onClick={() => {
                      openAddForm ? openAddForm() : setShowForm(!showForm);
                    }}
                  >
                    <i className="ri-add-line align-bottom me-1"></i>
                    Add
                  </Button>
                )}

                {(showForm || updateForm) && (
                  <Button
                    color="success"
                    className="btn-fixed-width d-flex align-items-center justify-content-center"
                    onClick={() => {
                      if (tog_list) {
                        tog_list();
                      } else {
                        setValues(initialState);
                        setUpdateForm(false);
                        setShowForm(false);
                      }
                    }}
                  >
                    <i className="ri-list-check align-bottom me-1"></i> List
                  </Button>
                )}

                {!showForm && !updateForm && (
                  <div className="search-box position-relative" style={{ minWidth: '200px' }}>
                    <Input
                      type="text"
                      className="form-control search"
                      placeholder="Search..."
                      onChange={(e) => setQuery(e.target.value)}
                    />
                    <i className="ri-search-line search-icon position-absolute top-50 translate-middle-y ms-2"></i>
                  </div>
                )}
              </div>
            </div>
          </Col>
        </Row>
      </React.Fragment>
    </React.Fragment>
  );
};

export default FormsHeader;
