import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Input, Label, Button, Spinner
} from 'reactstrap';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getSiteSettings, updateSiteSettings } from '../../api/siteSettings.api';

/**
 * Reusable settings section page.
 *
 * Props:
 *   title       — page title shown in breadcrumb and card header
 *   fields      — array of field configs (see FIELD_TYPES below)
 *   arrayFields — array of array field configs (for liveFeedEntries, navItems, socialLinks)
 */

const SettingsSection = ({ title, fields = [], arrayFields = [] }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = `${title} | Admin`;
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await getSiteSettings();
      if (res.data?.isOk) setForm(res.data.data || {});
    } catch {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleArrayChange = (key, index, field, value) => {
    const arr = [...(form[key] || [])];
    arr[index] = { ...arr[index], [field]: value };
    setForm(prev => ({ ...prev, [key]: arr }));
  };

  const addArrayItem = (key, template) => {
    setForm(prev => ({ ...prev, [key]: [...(prev[key] || []), template] }));
  };

  const removeArrayItem = (key, index) => {
    setForm(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateSiteSettings(form);
      if (res.data?.isOk) {
        toast.success('Settings saved');
        setForm(res.data.data);
      }
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-content text-center"><Spinner /></div>;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title={title} pageTitle="Site Settings" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">{title}</h5>
                <Button color="success" onClick={handleSave} disabled={saving}>
                  {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save'}
                </Button>
              </CardHeader>
              <CardBody>
                {/* Simple fields */}
                <Row className="g-3">
                  {fields.map(f => (
                    <Col md={f.col || 6} key={f.key}>
                      <Label>{f.label}</Label>
                      <Input
                        type={f.type || 'text'}
                        rows={f.rows}
                        value={form[f.key] || ''}
                        onChange={e => handleChange(f.key, e.target.value)}
                      />
                    </Col>
                  ))}
                </Row>

                {/* Array fields */}
                {arrayFields.map(af => (
                  <div key={af.key} className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Label className="mb-0 fw-semibold">{af.label}</Label>
                      <Button size="sm" color="primary" onClick={() => addArrayItem(af.key, af.template)}>+ Add</Button>
                    </div>
                    {(form[af.key] || []).map((item, i) => (
                      <Row key={i} className="g-2 mb-2 align-items-end">
                        {af.columns.map(col => (
                          <Col md={col.col || 3} key={col.field}>
                            {col.type === 'select' ? (
                              <Input type="select" value={item[col.field] || col.default || ''} onChange={e => handleArrayChange(af.key, i, col.field, e.target.value)}>
                                {col.options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                              </Input>
                            ) : (
                              <Input
                                type={col.type || 'text'}
                                placeholder={col.placeholder}
                                value={col.type === 'number' ? (item[col.field] ?? 0) : (item[col.field] || '')}
                                onChange={e => handleArrayChange(af.key, i, col.field, col.type === 'number' ? (parseInt(e.target.value) || 0) : e.target.value)}
                              />
                            )}
                          </Col>
                        ))}
                        <Col md={1}>
                          <Button size="sm" color="danger" outline onClick={() => removeArrayItem(af.key, i)}>X</Button>
                        </Col>
                      </Row>
                    ))}
                  </div>
                ))}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SettingsSection;
