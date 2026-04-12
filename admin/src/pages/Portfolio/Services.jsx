import React, { useEffect, useState } from 'react';
import { Container, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Input, Label, Badge, Row, Col } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import DeleteModal from '../../Components/Common/DeleteModal';
import FormsFooter from '../../Components/Common/FormAddFooter';
import FormUpdateFooter from '../../Components/Common/FormUpdateFooter';
import { getServices, createService, updateService, deleteService } from '../../api/services.api';

const initialForm = { category: '', title: '', iconName: 'Cpu', iconColor: 'text-blue-500', desc: '', features: [], tech: [], accent: 'blue', displayOrder: 0, isActive: true };

const Services = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Services | Admin'; fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getServices();
      if (res.data?.isOk) setList(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(initialForm); setModalOpen(true); };
  const openEdit = (row) => { setEditingId(row._id); setForm({ ...initialForm, ...row }); setModalOpen(true); };

  const handleSubmit = async () => {
    if (!form.category || !form.title) return toast.warn('Category and Title required');
    setSubmitting(true);
    try {
      const payload = { ...form, features: form.features, tech: form.tech };
      const res = editingId ? await updateService(editingId, payload) : await createService(payload);
      if (res.data?.isOk) { toast.success(editingId ? 'Updated' : 'Created'); setModalOpen(false); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteService(deleteId);
      if (res.data?.isOk) { toast.success('Deleted'); setDeleteModal(false); fetchData(); }
    } catch { toast.error('Delete failed'); }
    finally { setSubmitting(false); }
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const columns = [
    { name: '#', selector: (_, i) => i + 1, width: '50px' },
    { name: 'Category', selector: row => row.category, sortable: true },
    { name: 'Title', selector: row => row.title, sortable: true },
    { name: 'Icon', selector: row => row.iconName, width: '100px' },
    { name: 'Order', selector: row => row.displayOrder, sortable: true, width: '80px' },
    { name: 'Active', cell: row => <Badge color={row.isActive ? 'success' : 'secondary'}>{row.isActive ? 'Yes' : 'No'}</Badge>, width: '80px' },
    { name: 'Actions', cell: row => (
      <div className="d-flex gap-1">
        <Button size="sm" color="info" outline onClick={() => openEdit(row)}>Edit</Button>
        <Button size="sm" color="danger" outline onClick={() => { setDeleteId(row._id); setDeleteModal(true); }}>Del</Button>
      </div>
    ), width: '140px' },
  ];

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Services" pageTitle="Portfolio" />
        <Card>
          <CardBody>
            <div className="d-flex justify-content-end mb-3">
              <Button color="success" onClick={openCreate}>+ Add Service</Button>
            </div>
            <DataTable columns={columns} data={list} pagination progressPending={loading} highlightOnHover />
          </CardBody>
        </Card>

        <Modal isOpen={modalOpen} toggle={() => !submitting && setModalOpen(false)} size="lg">
          <ModalHeader toggle={() => !submitting && setModalOpen(false)}>{editingId ? 'Edit Service' : 'Add Service'}</ModalHeader>
          <ModalBody>
            <Row className="g-3">
              <Col md={4}><Label>Category *</Label><Input value={form.category} onChange={e => updateField('category', e.target.value)} /></Col>
              <Col md={4}><Label>Title *</Label><Input value={form.title} onChange={e => updateField('title', e.target.value)} /></Col>
              <Col md={4}><Label>Accent Color</Label><Input value={form.accent} onChange={e => updateField('accent', e.target.value)} placeholder="blue" /></Col>
              <Col md={4}><Label>Icon Name</Label><Input value={form.iconName} onChange={e => updateField('iconName', e.target.value)} placeholder="Cpu" /></Col>
              <Col md={4}><Label>Icon Color</Label><Input value={form.iconColor} onChange={e => updateField('iconColor', e.target.value)} placeholder="text-blue-500" /></Col>
              <Col md={2}><Label>Order</Label><Input type="number" value={form.displayOrder} onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)} /></Col>
              <Col md={2}><Label>Active</Label><Input type="select" value={form.isActive ? 'true' : 'false'} onChange={e => updateField('isActive', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></Input></Col>
              <Col md={12}><Label>Description</Label><Input type="textarea" rows={3} value={form.desc} onChange={e => updateField('desc', e.target.value)} /></Col>
              <Col md={6}><Label>Features (comma separated)</Label><Input value={(form.features || []).join(', ')} onChange={e => updateField('features', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Col>
              <Col md={6}><Label>Tech Stack (comma separated)</Label><Input value={(form.tech || []).join(', ')} onChange={e => updateField('tech', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Col>
            </Row>
            <div className="mt-4">
              {editingId
                ? <FormUpdateFooter handleSubmit={handleSubmit} handleSubmitCancel={() => setModalOpen(false)} isLoading={submitting} />
                : <FormsFooter handleSubmit={handleSubmit} handleSubmitCancel={() => setModalOpen(false)} isLoading={submitting} />
              }
            </div>
          </ModalBody>
        </Modal>

        <DeleteModal show={deleteModal} handleDelete={handleDelete} handleDeleteClose={() => setDeleteModal(false)} setmodal_delete={setDeleteModal} disabled={submitting} />
      </Container>
    </div>
  );
};

export default Services;
