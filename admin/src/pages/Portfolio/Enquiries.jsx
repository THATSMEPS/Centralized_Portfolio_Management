import React, { useEffect, useState } from 'react';
import { Container, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Input, Label, Badge, Row, Col, Nav, NavItem, NavLink } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import classnames from 'classnames';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import DeleteModal from '../../Components/Common/DeleteModal';
import { getEnquiries, updateEnquiry, deleteEnquiry } from '../../api/enquiries.api';

const STATUS_COLORS = { NEW: 'info', READ: 'warning', REPLIED: 'success', ARCHIVED: 'secondary' };
const STATUS_TABS = ['ALL', 'NEW', 'READ', 'REPLIED', 'ARCHIVED'];

const Enquiries = () => {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notes, setNotes] = useState('');
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => { document.title = 'Enquiries | Admin'; }, []);
  useEffect(() => { fetchData(); }, [page, perPage, statusFilter, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, limit: perPage };
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (search) params.search = search;
      const res = await getEnquiries(params);
      if (res.data?.isOk) {
        setList(res.data.data.items || []);
        setTotal(res.data.data.total || 0);
      }
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openDetail = (row) => {
    setSelected(row);
    setEditStatus(row.status);
    setNotes(row.notes || '');
    setModalOpen(true);
  };

  const handleUpdate = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      const res = await updateEnquiry(selected._id, { status: editStatus, notes });
      if (res.data?.isOk) { toast.success('Updated'); setModalOpen(false); fetchData(); }
    } catch { toast.error('Update failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteEnquiry(deleteId);
      if (res.data?.isOk) { toast.success('Deleted'); setDeleteModal(false); fetchData(); }
    } catch { toast.error('Delete failed'); }
    finally { setSubmitting(false); }
  };

  const columns = [
    { name: '#', selector: (_, i) => (page - 1) * perPage + i + 1, width: '50px' },
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Email', selector: row => row.email, sortable: true },
    { name: 'Message', selector: row => (row.message || '').substring(0, 60) + '...', minWidth: '200px' },
    { name: 'Status', cell: row => <Badge color={STATUS_COLORS[row.status] || 'secondary'}>{row.status}</Badge>, width: '100px' },
    { name: 'Date', selector: row => new Date(row.createdAt).toLocaleDateString(), width: '110px', sortable: true },
    { name: 'Actions', cell: row => (
      <div className="d-flex gap-1">
        <Button size="sm" color="info" outline onClick={() => openDetail(row)}>View</Button>
        <Button size="sm" color="danger" outline onClick={() => { setDeleteId(row._id); setDeleteModal(true); }}>Del</Button>
      </div>
    ), width: '140px' },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Enquiries" pageTitle="Portfolio" />
        <Card>
          <CardBody>
            <Nav tabs className="mb-3">
              {STATUS_TABS.map(tab => (
                <NavItem key={tab}>
                  <NavLink className={classnames({ active: statusFilter === tab })} onClick={() => { setStatusFilter(tab); setPage(1); }} style={{ cursor: 'pointer' }}>
                    {tab}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <Input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="mb-3" style={{ maxWidth: 300 }} />
            <DataTable
              columns={columns}
              data={list}
              pagination
              paginationServer
              paginationTotalRows={total}
              paginationPerPage={perPage}
              onChangePage={p => setPage(p)}
              onChangeRowsPerPage={(pp, p) => { setPerPage(pp); setPage(p); }}
              progressPending={loading}
              highlightOnHover
              onRowClicked={openDetail}
              pointerOnHover
            />
          </CardBody>
        </Card>

        {/* Detail Modal */}
        <Modal isOpen={modalOpen} toggle={() => !submitting && setModalOpen(false)} size="lg">
          <ModalHeader toggle={() => !submitting && setModalOpen(false)}>Enquiry Details</ModalHeader>
          <ModalBody>
            {selected && (
              <>
                <Row className="g-3 mb-4">
                  <Col md={6}><Label className="text-muted">Name</Label><p className="fw-bold">{selected.name}</p></Col>
                  <Col md={6}><Label className="text-muted">Email</Label><p className="fw-bold">{selected.email}</p></Col>
                  <Col md={12}><Label className="text-muted">Message</Label><p style={{ whiteSpace: 'pre-wrap' }}>{selected.message}</p></Col>
                  <Col md={6}><Label className="text-muted">Submitted</Label><p>{new Date(selected.createdAt).toLocaleString()}</p></Col>
                  <Col md={6}><Label className="text-muted">IP Address</Label><p>{selected.ipAddress || 'N/A'}</p></Col>
                </Row>
                <hr />
                <Row className="g-3">
                  <Col md={4}>
                    <Label>Status</Label>
                    <Input type="select" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                      {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                    </Input>
                  </Col>
                  <Col md={8}>
                    <Label>Admin Notes</Label>
                    <Input type="textarea" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
                  </Col>
                </Row>
                <div className="mt-3 d-flex justify-content-end gap-2">
                  <Button color="light" onClick={() => setModalOpen(false)} disabled={submitting}>Cancel</Button>
                  <Button color="success" onClick={handleUpdate} disabled={submitting}>
                    {submitting ? 'Saving...' : 'Update'}
                  </Button>
                </div>
              </>
            )}
          </ModalBody>
        </Modal>

        <DeleteModal show={deleteModal} handleDelete={handleDelete} handleDeleteClose={() => setDeleteModal(false)} setmodal_delete={setDeleteModal} disabled={submitting} />
      </Container>
    </div>
  );
};

export default Enquiries;
