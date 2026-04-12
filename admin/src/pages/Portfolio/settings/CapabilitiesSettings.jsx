import React from 'react';
import SettingsSection from '../SettingsSection';

const CapabilitiesSettings = () => (
  <SettingsSection
    title="Capabilities Section"
    fields={[
      { key: 'capabilitiesLabel', label: 'Section Label', col: 6 },
      { key: 'capabilitiesTitle', label: 'Section Title', col: 6 },
      { key: 'capabilitiesDescription', label: 'Description', col: 12, type: 'textarea', rows: 3 },
    ]}
  />
);

export default CapabilitiesSettings;
