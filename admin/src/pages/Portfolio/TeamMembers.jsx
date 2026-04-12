import React, { useEffect, useState, useRef } from 'react';
import { Container, Row, Col, Card, CardBody, Button, Modal, ModalHeader, ModalBody, Input, Label, Spinner, Badge } from 'reactstrap';
import DataTable from 'react-data-table-component';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import DeleteModal from '../../Components/Common/DeleteModal';
import FormsFooter from '../../Components/Common/FormAddFooter';
import FormUpdateFooter from '../../Components/Common/FormUpdateFooter';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../../api/teamMembers.api';

const initialForm = {
  name: '', role: '', bio: '', accent: 'from-blue-600 to-cyan-400', glow: 'rgba(6, 182, 212, 0.4)',
  displayOrder: 0, isActive: true,
  personal: { location: '', email: '', phone: '', website: '', languages: [] },
  skills: [],
};

const TeamMembers = () => {
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
  const [query, setQuery] = useState('');

  useEffect(() => { document.title = 'Team Members | Admin'; fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getTeamMembers();
      if (res.data?.isOk) setList(res.data.data || []);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  };

  const filtered = list.filter(m => !query || m.name?.toLowerCase().includes(query.toLowerCase()) || m.role?.toLowerCase().includes(query.toLowerCase()));

  const openCreate = () => { setEditingId(null); setForm(initialForm); setFile(null); if (fileRef.current) fileRef.current.value = ''; setModalOpen(true); };
  const openEdit = (row) => {
    setEditingId(row._id);
    setForm({
      ...initialForm,
      name: row.name || '',
      role: row.role || '',
      bio: row.bio || '',
      accent: row.accent || 'from-blue-600 to-cyan-400',
      glow: row.glow || 'rgba(6, 182, 212, 0.4)',
      displayOrder: row.displayOrder || 0,
      isActive: row.isActive !== false,
      personal: { ...initialForm.personal, ...(row.personal || {}) },
      skills: row.skills || [],
    });
    setFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setModalOpen(true);
  };

  const buildFormData = () => {
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('role', form.role);
    fd.append('bio', form.bio);
    fd.append('accent', form.accent);
    fd.append('glow', form.glow);
    fd.append('displayOrder', form.displayOrder);
    fd.append('isActive', form.isActive);
    fd.append('personal', JSON.stringify(form.personal || {}));
    fd.append('skills', JSON.stringify(form.skills || []));
    if (file) fd.append('avatar', file);
    return fd;
  };

  const handleSubmit = async () => {
    if (!form.name || !form.role) return toast.warn('Name and Role are required');
    setSubmitting(true);
    try {
      const fd = buildFormData();
      const res = editingId ? await updateTeamMember(editingId, fd) : await createTeamMember(fd);
      if (res.data?.isOk) { toast.success(editingId ? 'Updated' : 'Created'); setModalOpen(false); fetchData(); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const res = await deleteTeamMember(deleteId);
      if (res.data?.isOk) { toast.success('Deleted'); setDeleteModal(false); fetchData(); }
    } catch { toast.error('Delete failed'); }
    finally { setSubmitting(false); }
  };

  const updateField = (key, val) => setForm(prev => ({ ...prev, [key]: val }));
  const updatePersonal = (key, val) => setForm(prev => ({ ...prev, personal: { ...prev.personal, [key]: val } }));
  const addSkill = () => setForm(prev => ({ ...prev, skills: [...(prev.skills || []), { name: '', level: 50 }] }));
  const removeSkill = (idx) => setForm(prev => ({ ...prev, skills: prev.skills.filter((_, i) => i !== idx) }));
  const updateSkill = (idx, field, val) => {
    setForm(prev => {
      const arr = [...(prev.skills || [])];
      arr[idx] = { ...arr[idx], [field]: val };
      return { ...prev, skills: arr };
    });
  };

  const columns = [
    { name: '#', selector: (_, i) => i + 1, width: '50px' },
    { name: 'Avatar', cell: row => row.avatar ? <img src={row.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} /> : <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#eee' }} />, width: '70px' },
    { name: 'Name', selector: row => row.name, sortable: true },
    { name: 'Role', selector: row => row.role, sortable: true },
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
        <BreadCrumb title="Team Members" pageTitle="Team" />
        <p className="text-muted mb-3">Add and manage team members with their basic profile info, personal details, and skill sets. For experience, projects, and achievements use the dedicated pages under the Team menu.</p>
        <Card>
          <CardBody>
            <div className="d-flex justify-content-between mb-3">
              <Input placeholder="Search..." value={query} onChange={e => setQuery(e.target.value)} style={{ maxWidth: 300 }} />
              <Button color="success" onClick={openCreate}>+ Add Member</Button>
            </div>
            <DataTable columns={columns} data={filtered} pagination progressPending={loading} highlightOnHover />
          </CardBody>
        </Card>

        <Modal isOpen={modalOpen} toggle={() => !submitting && setModalOpen(false)} size="xl" scrollable>
          <ModalHeader toggle={() => !submitting && setModalOpen(false)}>
            {editingId ? 'Edit Team Member' : 'Add Team Member'}
          </ModalHeader>
          <ModalBody>
            <h6 className="text-muted mb-3">Basic Info</h6>
            <Row className="g-3 mb-4">
              <Col md={4}><Label>Name *</Label><Input value={form.name} onChange={e => updateField('name', e.target.value)} /></Col>
              <Col md={4}><Label>Role *</Label><Input value={form.role} onChange={e => updateField('role', e.target.value)} /></Col>
              <Col md={2}><Label>Order</Label><Input type="number" value={form.displayOrder} onChange={e => updateField('displayOrder', parseInt(e.target.value) || 0)} /></Col>
              <Col md={2}><Label>Active</Label><Input type="select" value={form.isActive ? 'true' : 'false'} onChange={e => updateField('isActive', e.target.value === 'true')}><option value="true">Yes</option><option value="false">No</option></Input></Col>
              <Col md={12}><Label>Bio</Label><Input type="textarea" rows={3} value={form.bio} onChange={e => updateField('bio', e.target.value)} /></Col>
              <Col md={4}><Label>Accent Gradient</Label><Input value={form.accent} onChange={e => updateField('accent', e.target.value)} placeholder="from-blue-600 to-cyan-400" /></Col>
              <Col md={4}><Label>Glow Color</Label><Input value={form.glow} onChange={e => updateField('glow', e.target.value)} placeholder="rgba(6, 182, 212, 0.4)" /></Col>
              <Col md={4}><Label>Avatar</Label><Input type="file" innerRef={fileRef} accept="image/*" onChange={e => setFile(e.target.files[0])} /></Col>
            </Row>

            <h6 className="text-muted mb-3">Personal Info</h6>
            <Row className="g-3 mb-4">
              <Col md={3}><Label>Location</Label><Input value={form.personal?.location || ''} onChange={e => updatePersonal('location', e.target.value)} /></Col>
              <Col md={3}><Label>Email</Label><Input value={form.personal?.email || ''} onChange={e => updatePersonal('email', e.target.value)} /></Col>
              <Col md={3}><Label>Phone</Label><Input value={form.personal?.phone || ''} onChange={e => updatePersonal('phone', e.target.value)} /></Col>
              <Col md={3}><Label>Website</Label><Input value={form.personal?.website || ''} onChange={e => updatePersonal('website', e.target.value)} /></Col>
              <Col md={12}><Label>Languages (comma separated)</Label><Input value={(form.personal?.languages || []).join(', ')} onChange={e => updatePersonal('languages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></Col>
            </Row>

            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="text-muted mb-0">Skills</h6>
              <Button size="sm" color="primary" outline onClick={addSkill}>+ Add Skill</Button>
            </div>
            {(form.skills || []).map((skill, i) => (
              <Row key={i} className="g-2 mb-2 align-items-center">
                <Col md={5}><Input placeholder="Skill name" value={skill.name || ''} onChange={e => updateSkill(i, 'name', e.target.value)} /></Col>
                <Col md={3}><Input type="range" min={0} max={100} value={skill.level || 0} onChange={e => updateSkill(i, 'level', parseInt(e.target.value))} /></Col>
                <Col md={2}><span className="text-muted">{skill.level}%</span></Col>
                <Col md={2}><Button size="sm" color="danger" outline onClick={() => removeSkill(i)}>Remove</Button></Col>
              </Row>
            ))}

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

export default TeamMembers;
