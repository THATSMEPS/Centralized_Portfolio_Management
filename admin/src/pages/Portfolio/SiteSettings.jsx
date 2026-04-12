import React, { useEffect, useState } from 'react';
import {
  Container, Row, Col, Card, CardBody, CardHeader,
  Nav, NavItem, NavLink, TabContent, TabPane,
  Input, Label, Button, Spinner
} from 'reactstrap';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { getSiteSettings, updateSiteSettings } from '../../api/siteSettings.api';

const TABS = [
  { id: '1', label: 'Hero' },
  { id: '2', label: 'Capabilities' },
  { id: '3', label: 'CTA Banner' },
  { id: '4', label: 'Origin Story' },
  { id: '5', label: 'Live Feed' },
  { id: '6', label: 'Footer' },
  { id: '7', label: 'Enquire Page' },
  { id: '8', label: 'Navigation' },
  { id: '9', label: 'Social Links' },
  { id: '10', label: 'SEO' },
];

const SiteSettings = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    document.title = 'Site Settings | Admin';
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await getSiteSettings();
      if (res.data?.isOk) setForm(res.data.data || {});
    } catch (err) {
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
    } catch (err) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="page-content text-center"><Spinner /></div>;

  return (
    <div className="page-content">
      <Container fluid>
        <BreadCrumb title="Site Settings" pageTitle="Portfolio" />
        <Row>
          <Col lg={12}>
            <Card>
              <CardHeader className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Portfolio Site Settings</h5>
                <Button color="success" onClick={handleSave} disabled={saving}>
                  {saving ? <><Spinner size="sm" className="me-1" />Saving...</> : 'Save All Settings'}
                </Button>
              </CardHeader>
              <CardBody>
                <Nav tabs className="nav-tabs-custom">
                  {TABS.map(tab => (
                    <NavItem key={tab.id}>
                      <NavLink className={classnames({ active: activeTab === tab.id })} onClick={() => setActiveTab(tab.id)} style={{ cursor: 'pointer' }}>
                        {tab.label}
                      </NavLink>
                    </NavItem>
                  ))}
                </Nav>
                <TabContent activeTab={activeTab} className="pt-4">
                  {/* Hero */}
                  <TabPane tabId="1">
                    <Row className="g-3">
                      <Col md={6}><Label>Hero Title</Label><Input value={form.heroTitle || ''} onChange={e => handleChange('heroTitle', e.target.value)} /></Col>
                      <Col md={6}><Label>Brand Name</Label><Input value={form.brandName || ''} onChange={e => handleChange('brandName', e.target.value)} /></Col>
                      <Col md={12}><Label>Hero Subtitle</Label><Input value={form.heroSubtitle || ''} onChange={e => handleChange('heroSubtitle', e.target.value)} /></Col>
                      <Col md={6}><Label>Tagline 1</Label><Input value={form.heroTagline1 || ''} onChange={e => handleChange('heroTagline1', e.target.value)} /></Col>
                      <Col md={6}><Label>Tagline 2</Label><Input value={form.heroTagline2 || ''} onChange={e => handleChange('heroTagline2', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* Capabilities */}
                  <TabPane tabId="2">
                    <Row className="g-3">
                      <Col md={6}><Label>Section Label</Label><Input value={form.capabilitiesLabel || ''} onChange={e => handleChange('capabilitiesLabel', e.target.value)} /></Col>
                      <Col md={6}><Label>Section Title</Label><Input value={form.capabilitiesTitle || ''} onChange={e => handleChange('capabilitiesTitle', e.target.value)} /></Col>
                      <Col md={12}><Label>Description</Label><Input type="textarea" rows={3} value={form.capabilitiesDescription || ''} onChange={e => handleChange('capabilitiesDescription', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* CTA Banner */}
                  <TabPane tabId="3">
                    <Row className="g-3">
                      <Col md={6}><Label>Banner Title</Label><Input value={form.ctaBannerTitle || ''} onChange={e => handleChange('ctaBannerTitle', e.target.value)} /></Col>
                      <Col md={6}><Label>Button Text</Label><Input value={form.ctaButtonText || ''} onChange={e => handleChange('ctaButtonText', e.target.value)} /></Col>
                      <Col md={12}><Label>Banner Description</Label><Input type="textarea" rows={2} value={form.ctaBannerDescription || ''} onChange={e => handleChange('ctaBannerDescription', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* Origin Story */}
                  <TabPane tabId="4">
                    <Row className="g-3">
                      <Col md={6}><Label>Label</Label><Input value={form.originLabel || ''} onChange={e => handleChange('originLabel', e.target.value)} /></Col>
                      <Col md={6}><Label>Title</Label><Input value={form.originTitle || ''} onChange={e => handleChange('originTitle', e.target.value)} /></Col>
                      <Col md={12}><Label>Origin Text</Label><Input type="textarea" rows={5} value={form.originText || ''} onChange={e => handleChange('originText', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* Live Feed */}
                  <TabPane tabId="5">
                    <Label>Feed Title</Label>
                    <Input className="mb-3" value={form.liveFeedTitle || ''} onChange={e => handleChange('liveFeedTitle', e.target.value)} />
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Label className="mb-0">Feed Entries</Label>
                      <Button size="sm" color="primary" onClick={() => addArrayItem('liveFeedEntries', { text: '', color: 'text-gray-500', timestamp: '' })}>+ Add Entry</Button>
                    </div>
                    {(form.liveFeedEntries || []).map((entry, i) => (
                      <Row key={i} className="g-2 mb-2 align-items-end">
                        <Col md={6}><Input placeholder="Text" value={entry.text || ''} onChange={e => handleArrayChange('liveFeedEntries', i, 'text', e.target.value)} /></Col>
                        <Col md={2}><Input placeholder="Color class" value={entry.color || ''} onChange={e => handleArrayChange('liveFeedEntries', i, 'color', e.target.value)} /></Col>
                        <Col md={3}><Input placeholder="Timestamp" value={entry.timestamp || ''} onChange={e => handleArrayChange('liveFeedEntries', i, 'timestamp', e.target.value)} /></Col>
                        <Col md={1}><Button size="sm" color="danger" outline onClick={() => removeArrayItem('liveFeedEntries', i)}>X</Button></Col>
                      </Row>
                    ))}
                  </TabPane>

                  {/* Footer */}
                  <TabPane tabId="6">
                    <Row className="g-3">
                      <Col md={6}><Label>Footer Text</Label><Input value={form.footerText || ''} onChange={e => handleChange('footerText', e.target.value)} /></Col>
                      <Col md={6}><Label>Status Text</Label><Input value={form.footerStatusText || ''} onChange={e => handleChange('footerStatusText', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* Enquire Page */}
                  <TabPane tabId="7">
                    <Row className="g-3">
                      <Col md={6}><Label>Title</Label><Input value={form.enquireTitle || ''} onChange={e => handleChange('enquireTitle', e.target.value)} /></Col>
                      <Col md={6}><Label>Button Text</Label><Input value={form.enquireButtonText || ''} onChange={e => handleChange('enquireButtonText', e.target.value)} /></Col>
                      <Col md={12}><Label>Description</Label><Input type="textarea" rows={3} value={form.enquireDescription || ''} onChange={e => handleChange('enquireDescription', e.target.value)} /></Col>
                    </Row>
                  </TabPane>

                  {/* Navigation */}
                  <TabPane tabId="8">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Label className="mb-0">Nav Items</Label>
                      <Button size="sm" color="primary" onClick={() => addArrayItem('navItems', { key: '', label: '', type: 'link', order: 0 })}>+ Add Item</Button>
                    </div>
                    {(form.navItems || []).map((item, i) => (
                      <Row key={i} className="g-2 mb-2 align-items-end">
                        <Col md={3}><Input placeholder="Key" value={item.key || ''} onChange={e => handleArrayChange('navItems', i, 'key', e.target.value)} /></Col>
                        <Col md={3}><Input placeholder="Label" value={item.label || ''} onChange={e => handleArrayChange('navItems', i, 'label', e.target.value)} /></Col>
                        <Col md={2}><Input type="select" value={item.type || 'link'} onChange={e => handleArrayChange('navItems', i, 'type', e.target.value)}><option value="link">Link</option><option value="button">Button</option></Input></Col>
                        <Col md={2}><Input type="number" placeholder="Order" value={item.order || 0} onChange={e => handleArrayChange('navItems', i, 'order', parseInt(e.target.value) || 0)} /></Col>
                        <Col md={2}><Button size="sm" color="danger" outline onClick={() => removeArrayItem('navItems', i)}>Remove</Button></Col>
                      </Row>
                    ))}
                  </TabPane>

                  {/* Social Links */}
                  <TabPane tabId="9">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Label className="mb-0">Social Links</Label>
                      <Button size="sm" color="primary" onClick={() => addArrayItem('socialLinks', { platform: '', url: '', icon: '' })}>+ Add Link</Button>
                    </div>
                    {(form.socialLinks || []).map((link, i) => (
                      <Row key={i} className="g-2 mb-2 align-items-end">
                        <Col md={3}><Input placeholder="Platform" value={link.platform || ''} onChange={e => handleArrayChange('socialLinks', i, 'platform', e.target.value)} /></Col>
                        <Col md={5}><Input placeholder="URL" value={link.url || ''} onChange={e => handleArrayChange('socialLinks', i, 'url', e.target.value)} /></Col>
                        <Col md={3}><Input placeholder="Icon class" value={link.icon || ''} onChange={e => handleArrayChange('socialLinks', i, 'icon', e.target.value)} /></Col>
                        <Col md={1}><Button size="sm" color="danger" outline onClick={() => removeArrayItem('socialLinks', i)}>X</Button></Col>
                      </Row>
                    ))}
                  </TabPane>

                  {/* SEO */}
                  <TabPane tabId="10">
                    <Row className="g-3">
                      <Col md={6}><Label>Meta Title</Label><Input value={form.metaTitle || ''} onChange={e => handleChange('metaTitle', e.target.value)} /></Col>
                      <Col md={6}><Label>Favicon URL</Label><Input value={form.favicon || ''} onChange={e => handleChange('favicon', e.target.value)} /></Col>
                      <Col md={12}><Label>Meta Description</Label><Input type="textarea" rows={3} value={form.metaDescription || ''} onChange={e => handleChange('metaDescription', e.target.value)} /></Col>
                    </Row>
                  </TabPane>
                </TabContent>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SiteSettings;
