import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Input, Label, Spinner, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { getTeamMembers, getTeamMemberById, updateTeamMember } from '../../../api/teamMembers.api';

const MemberProjects = () => {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Member Projects | Admin'; fetchMembers(); }, []);

  const fetchMembers = async () => {
    try {
      const res = await getTeamMembers();
      if (res.data?.isOk) {
        setMembers(res.data.data || []);
        if (res.data.data?.length > 0) {
          setSelectedId(res.data.data[0]._id);
          loadMember(res.data.data[0]._id);
        }
      }
    } catch { toast.error('Failed to load members'); }
    finally { setLoading(false); }
  };

  const loadMember = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await getTeamMemberById(id);
      if (res.data?.isOk) setProjects(res.data.data.projects || []);
    } catch { toast.error('Failed to load member'); }
    finally { setLoading(false); }
  };

  const handleMemberChange = (id) => { setSelectedId(id); loadMember(id); };

  const updateProj = (idx, field, val) => {
    const arr = [...projects]; arr[idx] = { ...arr[idx], [field]: val }; setProjects(arr);
  };

  const newProject = () => setProjects([...projects, {
    title: '', type: '', description: '', thumbnail: '', images: [],
    videoUrl: '', liveUrl: '', githubUrl: '', link: '', tags: [], featured: false,
  }]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('projects', JSON.stringify(projects));
      const res = await updateTeamMember(selectedId, fd);
      if (res.data?.isOk) toast.success('Saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading && members.length === 0) return <div className="page-content text-center"><Spinner /></div>;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Member Projects" pageTitle="Team" />
        <p className="text-muted mb-3">Showcase each member's personal projects with descriptions, links, tags, and gallery images. These appear in the Projects grid on their profile page.</p>

        <Row className="mb-3">
          <Col md={4}>
            <Label className="fw-semibold">Select Member</Label>
            <Input type="select" value={selectedId} onChange={e => handleMemberChange(e.target.value)}>
              {members.map(m => <option key={m._id} value={m._id}>{m.name} — {m.role}</option>)}
            </Input>
          </Col>
          <Col md={8} className="d-flex align-items-end justify-content-end">
            <Button color="success" onClick={handleSave} disabled={saving}>
              {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save Changes'}
            </Button>
          </Col>
        </Row>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0">Projects ({projects.length})</h5>
          <Button color="primary" onClick={newProject}>+ Add Project</Button>
        </div>

        {projects.length === 0 && <Card><CardBody><p className="text-muted mb-0">No projects yet. Click "+ Add Project" to start.</p></CardBody></Card>}

        {projects.map((proj, i) => (
          <Card key={i} className="border mb-3">
            <CardHeader className="d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center gap-2">
                <Badge color="primary">#{i + 1}</Badge>
                <strong>{proj.title || 'Untitled Project'}</strong>
                {proj.featured && <Badge color="warning">Featured</Badge>}
              </div>
              <Button size="sm" color="danger" outline onClick={() => setProjects(projects.filter((_, idx) => idx !== i))}>Remove</Button>
            </CardHeader>
            <CardBody>
              <Row className="g-3">
                <Col md={4}><Label>Title *</Label><Input value={proj.title || ''} onChange={e => updateProj(i, 'title', e.target.value)} /></Col>
                <Col md={4}><Label>Type / Category</Label><Input placeholder="e.g. Web App, Mobile, AI" value={proj.type || ''} onChange={e => updateProj(i, 'type', e.target.value)} /></Col>
                <Col md={4}>
                  <Label>Featured</Label>
                  <Input type="select" value={proj.featured ? 'true' : 'false'} onChange={e => updateProj(i, 'featured', e.target.value === 'true')}>
                    <option value="false">No</option><option value="true">Yes</option>
                  </Input>
                </Col>
                <Col md={12}><Label>Description</Label><Input type="textarea" rows={3} value={proj.description || ''} onChange={e => updateProj(i, 'description', e.target.value)} /></Col>
              </Row>

              <h6 className="text-muted mt-4 mb-3">Links & Media</h6>
              <Row className="g-3">
                <Col md={6}><Label><i className="ri-links-line me-1"></i>Live / Demo URL</Label><Input placeholder="https://..." value={proj.liveUrl || ''} onChange={e => updateProj(i, 'liveUrl', e.target.value)} /></Col>
                <Col md={6}><Label><i className="ri-github-line me-1"></i>GitHub URL</Label><Input placeholder="https://github.com/..." value={proj.githubUrl || ''} onChange={e => updateProj(i, 'githubUrl', e.target.value)} /></Col>
                <Col md={6}><Label><i className="ri-video-line me-1"></i>Video URL</Label><Input placeholder="YouTube / Vimeo link" value={proj.videoUrl || ''} onChange={e => updateProj(i, 'videoUrl', e.target.value)} /></Col>
                <Col md={6}><Label><i className="ri-image-line me-1"></i>Thumbnail URL</Label><Input placeholder="Cover image URL" value={proj.thumbnail || ''} onChange={e => updateProj(i, 'thumbnail', e.target.value)} /></Col>
                <Col md={6}><Label><i className="ri-external-link-line me-1"></i>Other Link</Label><Input value={proj.link || ''} onChange={e => updateProj(i, 'link', e.target.value)} /></Col>
              </Row>

              <h6 className="text-muted mt-4 mb-3">Tags</h6>
              <Input
                placeholder="React, Node.js, MongoDB (comma separated)"
                value={(proj.tags || []).join(', ')}
                onChange={e => updateProj(i, 'tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />

              <h6 className="text-muted mt-4 mb-3">Gallery Images</h6>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {(proj.images || []).map((img, j) => (
                  <div key={j} className="d-flex align-items-center gap-1 border rounded p-1 pe-2" style={{ maxWidth: '400px' }}>
                    <Input
                      bsSize="sm"
                      placeholder="Image URL"
                      value={img}
                      onChange={e => {
                        const imgs = [...(proj.images || [])];
                        imgs[j] = e.target.value;
                        updateProj(i, 'images', imgs);
                      }}
                      style={{ minWidth: '250px' }}
                    />
                    <Button size="sm" color="danger" outline onClick={() => updateProj(i, 'images', (proj.images || []).filter((_, idx) => idx !== j))}>X</Button>
                  </div>
                ))}
              </div>
              <Button size="sm" color="soft-primary" onClick={() => updateProj(i, 'images', [...(proj.images || []), ''])}>+ Add Image URL</Button>
            </CardBody>
          </Card>
        ))}
      </Container>
    </div>
  );
};

export default MemberProjects;
