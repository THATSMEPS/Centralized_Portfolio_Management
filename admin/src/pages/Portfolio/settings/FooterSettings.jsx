import React from 'react';
import SettingsSection from '../SettingsSection';

const FooterSettings = () => (
  <SettingsSection
    title="Footer"
    fields={[
      { key: 'footerText', label: 'Footer Text', col: 6 },
      { key: 'footerStatusText', label: 'Status Text', col: 6 },
    ]}
  />
);

export default FooterSettings;
