import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Input, Label, Spinner, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { getTeamMembers, getTeamMemberById, updateTeamMember } from '../../../api/teamMembers.api';

const MemberAchievements = () => {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [certificates, setCertificates] = useState([]);
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Achievements & Social | Admin'; fetchMembers(); }, []);

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
      if (res.data?.isOk) {
        // Handle both old string format and new object format
        const rawCerts = res.data.data.certificates || [];
        const normalizedCerts = rawCerts.map(c =>
          typeof c === 'string' ? { title: c, issuer: '', date: '', credentialUrl: '', image: '' } : c
        );
        setCertificates(normalizedCerts);
        setSocialLinks(res.data.data.socialLinks || []);
      }
    } catch { toast.error('Failed to load member'); }
    finally { setLoading(false); }
  };

  const handleMemberChange = (id) => { setSelectedId(id); loadMember(id); };

  const updateCert = (idx, field, val) => {
    const arr = [...certificates]; arr[idx] = { ...arr[idx], [field]: val }; setCertificates(arr);
  };
  const updateSocial = (idx, field, val) => {
    const arr = [...socialLinks]; arr[idx] = { ...arr[idx], [field]: val }; setSocialLinks(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('certificates', JSON.stringify(certificates));
      fd.append('socialLinks', JSON.stringify(socialLinks));
      const res = await updateTeamMember(selectedId, fd);
      if (res.data?.isOk) toast.success('Saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading && members.length === 0) return <div className="page-content text-center"><Spinner /></div>;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Achievements & Social" pageTitle="Team" />
        <p className="text-muted mb-3">Manage certificates, awards, and social media links for each member. Credentials and social profiles are displayed on their portfolio dossier.</p>

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

        {/* Certificates & Awards */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Certificates & Awards</h5>
            <Button size="sm" color="primary" onClick={() => setCertificates([...certificates, { title: '', issuer: '', date: '', credentialUrl: '', image: '' }])}>+ Add</Button>
          </CardHeader>
          <CardBody>
            {certificates.length === 0 && <p className="text-muted">No certificates yet</p>}
            {certificates.map((cert, i) => (
              <Card key={i} className="border mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge color="info">#{i + 1}</Badge>
                    <Button size="sm" color="danger" outline onClick={() => setCertificates(certificates.filter((_, idx) => idx !== i))}>Remove</Button>
                  </div>
                  <Row className="g-3">
                    <Col md={6}><Label>Title *</Label><Input value={cert.title || ''} onChange={e => updateCert(i, 'title', e.target.value)} placeholder="AWS Solutions Architect Professional" /></Col>
                    <Col md={3}><Label>Issuer</Label><Input value={cert.issuer || ''} onChange={e => updateCert(i, 'issuer', e.target.value)} placeholder="Amazon Web Services" /></Col>
                    <Col md={3}><Label>Date</Label><Input value={cert.date || ''} onChange={e => updateCert(i, 'date', e.target.value)} placeholder="2024" /></Col>
                    <Col md={6}><Label><i className="ri-links-line me-1"></i>Credential URL</Label><Input value={cert.credentialUrl || ''} onChange={e => updateCert(i, 'credentialUrl', e.target.value)} placeholder="https://verify.cert.com/..." /></Col>
                    <Col md={6}><Label><i className="ri-image-line me-1"></i>Certificate Image URL</Label><Input value={cert.image || ''} onChange={e => updateCert(i, 'image', e.target.value)} placeholder="https://..." /></Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </CardBody>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Social Links</h5>
            <Button size="sm" color="primary" onClick={() => setSocialLinks([...socialLinks, { platform: '', url: '', icon: '' }])}>+ Add</Button>
          </CardHeader>
          <CardBody>
            {socialLinks.length === 0 && <p className="text-muted">No social links yet</p>}
            {socialLinks.map((link, i) => (
              <Row key={i} className="g-2 mb-2 align-items-end">
                <Col md={3}>
                  <Label>Platform</Label>
                  <Input type="select" value={link.platform || ''} onChange={e => updateSocial(i, 'platform', e.target.value)}>
                    <option value="">Select...</option>
                    <option value="GitHub">GitHub</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Twitter">Twitter / X</option>
                    <option value="Portfolio">Portfolio</option>
                    <option value="Dribbble">Dribbble</option>
                    <option value="Behance">Behance</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Instagram">Instagram</option>
                    <option value="Other">Other</option>
                  </Input>
                </Col>
                <Col md={5}><Label>URL</Label><Input value={link.url || ''} onChange={e => updateSocial(i, 'url', e.target.value)} placeholder="https://..." /></Col>
                <Col md={3}><Label>Icon Class</Label><Input value={link.icon || ''} onChange={e => updateSocial(i, 'icon', e.target.value)} placeholder="ri-github-line" /></Col>
                <Col md={1}><Button size="sm" color="danger" outline onClick={() => setSocialLinks(socialLinks.filter((_, idx) => idx !== i))}>X</Button></Col>
              </Row>
            ))}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default MemberAchievements;
