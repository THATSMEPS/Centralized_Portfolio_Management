import React from 'react';
import SettingsSection from '../SettingsSection';

const SeoSettings = () => (
  <SettingsSection
    title="SEO"
    fields={[
      { key: 'metaTitle', label: 'Meta Title', col: 6 },
      { key: 'favicon', label: 'Favicon URL', col: 6 },
      { key: 'metaDescription', label: 'Meta Description', col: 12, type: 'textarea', rows: 3 },
    ]}
  />
);

export default SeoSettings;
