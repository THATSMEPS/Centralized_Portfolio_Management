import React, { useMemo, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardHeader,
  Input,
  Label,
} from "reactstrap";
import DataTable from "react-data-table-component";
import BreadCrumb from "../../Components/Common/BreadCrumb";
import { MOCK_PRODUCTS } from "../../common/data/mockData";
import { Badge } from "reactstrap";

const Products = () => {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  // Normalize initial data: sold-out cannot be true when item is unavailable
  const [products, setProducts] = useState(
    MOCK_PRODUCTS.map((p) => ({ ...p, isSoldOut: p.isAvailable ? p.isSoldOut : false }))
  );

  const toggleAvailability = (id) => {
    setProducts((prev) => {
      return prev.map((p) => {
        if (p.id !== id) return p;
        const newAvailable = !p.isAvailable;
        // If marking unavailable, also clear sold-out flag because it doesn't make sense
        return { ...p, isAvailable: newAvailable, isSoldOut: newAvailable ? p.isSoldOut : false };
      });
    });
    // Optional: toast feedback
    // toast.success('Availability updated');
  };

  const toggleSoldOut = (id) => {
    setProducts((prev) => {
      return prev.map((p) => (p.id === id ? { ...p, isSoldOut: !p.isSoldOut } : p));
    });
    // toast.success('Sold-out status updated');
  };

  const data = useMemo(() => {
    let items = [...products];
    if (typeFilter && typeFilter !== "all") {
      items = items.filter((p) => p.type === typeFilter);
    }
    if (search && search.trim() !== "") {
      const s = search.trim().toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(s) || p.category.toLowerCase().includes(s)
      );
    }
    return items;
  }, [search, typeFilter, products]);

  const columns = [
    {
      name: "",
      selector: (row) => row.thumbnail,
      cell: (row) => (
        <div style={{ width: 70 }}>
          <img
            src={row.thumbnail}
            alt={row.name}
            style={{ width: 60, height: 40, objectFit: "cover", borderRadius: 6 }}
          />
        </div>
      ),
      width: "80px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      cell: (row) => <strong>{row.name}</strong>,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      cell: (row) => (
        <Badge color={row.type === "food" ? "warning" : "secondary"}>
          {row.type}
        </Badge>
      ),
      width: "120px",
    },
    {
      name: "Category",
      selector: (row) => row.category,
      sortable: true,
      width: "180px",
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => <span>₹ {row.price}</span>,
      width: "100px",
    },
    {
      name: "Availability",
      selector: (row) => row.isAvailable,
      cell: (row) => (
        <div>
          {row.isAvailable ? (
            <Badge color="success">Available</Badge>
          ) : (
            <Badge color="dark">Unavailable</Badge>
          )}
          {" "}
          {(row.isAvailable && row.isSoldOut) ? <Badge color="danger">Sold Out</Badge> : null}
        </div>
      ),
      width: "200px",
    },
    {
      name: "Veg/NonVeg",
      selector: (row) => row.vegNonVeg,
      cell: (row) => (
        <div>
          {row.type === "food" ? (
            <Badge color={row.vegNonVeg === "veg" ? "success" : "danger"}>
              {row.vegNonVeg || "N/A"}
            </Badge>
          ) : (
            <Badge color="secondary">—</Badge>
          )}
        </div>
      ),
      width: "120px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div>
            <Label check>
              <Input
                type="checkbox"
                checked={row.isAvailable}
                onChange={() => toggleAvailability(row.id)}
              />{' '}
              <small>Available</small>
            </Label>
          </div>
                {row.isAvailable ? (
            <div>
              <Label check>
                <Input
                  type="checkbox"
                  checked={row.isSoldOut}
                  onChange={() => toggleSoldOut(row.id)}
                />{' '}
                <small>Sold Out</small>
              </Label>
            </div>
          ) : null}
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: '220px'
    }
  ];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Products" pageTitle="Products" />

          <Row>
            <Col lg={12}>
              <Card>
                <CardHeader>
                  <div className="d-flex align-items-center justify-content-between">
                    <div>
                      <Label className="me-2">Filter</Label>
                      <Input
                        type="select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        style={{ width: 160, display: "inline-block" }}
                      >
                        <option value="all">All types</option>
                        <option value="food">Food</option>
                        <option value="merchandise">Merchandise</option>
                      </Input>
                    </div>

                    <div>
                      <Input
                        placeholder="Search by name or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 280, display: "inline-block" }}
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardBody>
                  <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    responsive
                    highlightOnHover
                    striped
                    noHeader
                  />
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Products;