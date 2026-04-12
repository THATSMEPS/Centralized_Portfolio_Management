import React from 'react';
import SettingsSection from '../SettingsSection';

const EnquirePageSettings = () => (
  <SettingsSection
    title="Enquire Page"
    fields={[
      { key: 'enquireTitle', label: 'Title', col: 6 },
      { key: 'enquireButtonText', label: 'Button Text', col: 6 },
      { key: 'enquireDescription', label: 'Description', col: 12, type: 'textarea', rows: 3 },
    ]}
  />
);

export default EnquirePageSettings;
