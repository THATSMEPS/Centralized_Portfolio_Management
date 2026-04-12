import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardHeader, Button, Input, Label, Spinner, Badge } from 'reactstrap';
import { toast } from 'react-toastify';
import BreadCrumb from '../../../Components/Common/BreadCrumb';
import { getTeamMembers, getTeamMemberById, updateTeamMember } from '../../../api/teamMembers.api';

const MemberExperience = () => {
  const [members, setMembers] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { document.title = 'Experience & Education | Admin'; fetchMembers(); }, []);

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
        setExperience(res.data.data.experience || []);
        setEducation(res.data.data.education || []);
      }
    } catch { toast.error('Failed to load member'); }
    finally { setLoading(false); }
  };

  const handleMemberChange = (id) => { setSelectedId(id); loadMember(id); };

  const updateExp = (idx, field, val) => {
    const arr = [...experience]; arr[idx] = { ...arr[idx], [field]: val }; setExperience(arr);
  };
  const updateEdu = (idx, field, val) => {
    const arr = [...education]; arr[idx] = { ...arr[idx], [field]: val }; setEducation(arr);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('experience', JSON.stringify(experience));
      fd.append('education', JSON.stringify(education));
      const res = await updateTeamMember(selectedId, fd);
      if (res.data?.isOk) toast.success('Saved');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  if (loading && members.length === 0) return <div className="page-content text-center"><Spinner /></div>;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Experience & Education" pageTitle="Team" />
        <p className="text-muted mb-3">Add work experience and education history for each team member. This data appears on their profile dossier in the portfolio frontend.</p>

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

        {/* Experience */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Work Experience</h5>
            <Button size="sm" color="primary" onClick={() => setExperience([...experience, { company: '', role: '', period: '', desc: '', location: '' }])}>+ Add Experience</Button>
          </CardHeader>
          <CardBody>
            {experience.length === 0 && <p className="text-muted">No experience added yet</p>}
            {experience.map((exp, i) => (
              <Card key={i} className="border mb-3">
                <CardBody>
                  <div className="d-flex justify-content-between mb-2">
                    <Badge color="primary">#{i + 1}</Badge>
                    <Button size="sm" color="danger" outline onClick={() => setExperience(experience.filter((_, idx) => idx !== i))}>Remove</Button>
                  </div>
                  <Row className="g-3">
                    <Col md={4}><Label>Company</Label><Input value={exp.company || ''} onChange={e => updateExp(i, 'company', e.target.value)} /></Col>
                    <Col md={4}><Label>Role / Position</Label><Input value={exp.role || ''} onChange={e => updateExp(i, 'role', e.target.value)} /></Col>
                    <Col md={4}><Label>Period</Label><Input placeholder="e.g. 2020 - 2024" value={exp.period || ''} onChange={e => updateExp(i, 'period', e.target.value)} /></Col>
                    <Col md={12}><Label>Description</Label><Input type="textarea" rows={2} value={exp.desc || ''} onChange={e => updateExp(i, 'desc', e.target.value)} /></Col>
                  </Row>
                </CardBody>
              </Card>
            ))}
          </CardBody>
        </Card>

        {/* Education */}
        <Card>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Education</h5>
            <Button size="sm" color="primary" onClick={() => setEducation([...education, { degree: '', school: '', year: '' }])}>+ Add Education</Button>
          </CardHeader>
          <CardBody>
            {education.length === 0 && <p className="text-muted">No education added yet</p>}
            {education.map((edu, i) => (
              <Row key={i} className="g-2 mb-3 align-items-end">
                <Col md={4}><Label>Degree / Title</Label><Input value={edu.degree || ''} onChange={e => updateEdu(i, 'degree', e.target.value)} /></Col>
                <Col md={4}><Label>School / Institution</Label><Input value={edu.school || ''} onChange={e => updateEdu(i, 'school', e.target.value)} /></Col>
                <Col md={2}><Label>Year</Label><Input value={edu.year || ''} onChange={e => updateEdu(i, 'year', e.target.value)} /></Col>
                <Col md={2}><Button size="sm" color="danger" outline onClick={() => setEducation(education.filter((_, idx) => idx !== i))}>Remove</Button></Col>
              </Row>
            ))}
          </CardBody>
        </Card>
      </Container>
    </div>
  );
};

export default MemberExperience;
