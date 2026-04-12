import React, { useEffect, useState, useRef } from 'react';
import { Container, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Input, Label, Badge, Row, Col } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import DeleteModal from '../../Components/Common/DeleteModal';
import FormsFooter from '../../Components/Common/FormAddFooter';
import FormUpdateFooter from '../../Components/Common/FormUpdateFooter';
import { getProjects, createProject, updateProject, deleteProject } from '../../api/projects.api';

const STATUS_OPTIONS = ['DEPLOYED', 'ARCHIVED', 'STABLE', 'ACTIVE', 'INTERNAL', 'BETA'];
const STATUS_COLORS = { DEPLOYED: 'success', ACTIVE: 'primary', STABLE: 'info', BETA: 'warning', INTERNAL: 'secondary', ARCHIVED: 'dark' };
const initialForm = { title: '', tech: '', type: '', impact: '', status: 'ACTIVE', desc: '', link: '', displayOrder: 0, isActive: true, filterTags: [] };

const Projects = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => { document.title = 'Projects | Admin'; fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getProjects();
      if (res.data?.isOk) setList(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const openCreate = () => { setEditingId(null); setForm(initialForm); setFile(null); if (fileRef.current) fileRef.current.value = ''; setModalOpen(true); };
  const openEdit = (row) => { setEditingId(row._id); setForm({ ...initialForm, ...row }); setFile(null); if (fileRef.current) fileRef.current.value = ''; setModalOpen(true); };

  const handleSubmit = async () => {
    if (!form.title) return toast.warn('Title is required');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'filterTags') fd.append(k, JSON.stringify(v));
        else if (k !== '_id' && k !== '__v' && k !== 'createdAt' && k !== 'updatedAt' && k !== 'companyId') fd.append(k, v);
      });
      if (file) fd.append('image', file);
      const res = editingId ? await updateProject(editingId, fd) : await createProject(fd);
      if (res.data?.isOk) { toast.success(editingId ? 'Updated' : 'Created'); setModalOpen(false); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteProject(deleteId);
      if (res.data?.isOk) { toast.success('Deleted'); setDeleteModal(false); fetchData(); }
    } catch { toast.error('Delete failed'); }
    finally { setSubmitting(false); }
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const columns = [
    { name: '#', selector: (_, i) => i + 1, width: '50px' },
    { name: 'Title', selector: row => row.title, sortable: true },
    { name: 'Tech', selector: row => row.tech, width: '140px' },
    { name: 'Type', selector: row => row.type, width: '100px' },
    { name: 'Impact', selector: row => row.impact, width: '80px' },
    { name: 'Status', cell: row => <Badge color={STATUS_COLORS[row.status] || 'secondary'}>{row.status}</Badge>, width: '100px' },
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
        <BreadCrumb title="Projects" pageTitle="Portfolio" />
        <Card>
          <CardBody>
            <div className="d-flex justify-content-end mb-3">
              <Button color="success" onClick={openCreate}>+ Add Project</Button>
            </div>
            <DataTable columns={columns} data={list} pagination progressPending={loading} highlightOnHover />
          </CardBody>
        </Card>

        <Modal isOpen={modalOpen} toggle={() => !submitting && setModalOpen(false)} size="lg">
          <ModalHeader toggle={() => !submitting && setModalOpen(false)}>{editingId ? 'Edit Project' : 'Add Project'}</ModalHeader>
          <ModalBody>
            <Row className="g-3">
              <Col md={6}><Label>Title *</Label><Input value={form.title} onChange={e => updateField('title', e.target.value)} /></Col>
              <Col md={3}><Label>Tech</Label><Input value={form.tech} onChange={e => updateField('tech', e.target.value)} placeholder="PyTorch / CUDA" /></Col>
              <Col md={3}><Label>Type</Label><Input value={form.type} onChange={e => updateField('type', e.target.value)} placeholder="AI/ML" /></Col>
              <Col md={3}><Label>Impact</Label><Input value={form.impact} onChange={e => updateField('impact', e.target.value)} placeholder="98%" /></Col>
              <Col md={3}><Label>Status</Label><Input type="select" value={form.status} onChange={e => updateField('status', e.target.value)}>{STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}</Input></Col>
              <Col md={2}><Label>Order</Label><Input type="number" value={form.displayOrder} onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)} /></Col>
              <Col md={2}><Label>Active</Label><Input type="select" value={form.isActive ? 'true' : 'false'} onChange={e => updateField('isActive', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></Input></Col>
              <Col md={2}><Label>Image</Label><Input type="file" innerRef={fileRef} accept="image/*" onChange={e => setFile(e.target.files[0])} /></Col>
              <Col md={12}><Label>Description</Label><Input type="textarea" rows={3} value={form.desc} onChange={e => updateField('desc', e.target.value)} /></Col>
              <Col md={6}><Label>Link</Label><Input value={form.link} onChange={e => updateField('link', e.target.value)} /></Col>
              <Col md={6}><Label>Filter Tags (comma separated)</Label><Input value={(form.filterTags || []).join(', ')} onChange={e => updateField('filterTags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Col>
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

export default Projects;
