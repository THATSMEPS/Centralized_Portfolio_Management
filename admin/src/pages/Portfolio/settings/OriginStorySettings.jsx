import React from 'react';
import SettingsSection from '../SettingsSection';

const OriginStorySettings = () => (
  <SettingsSection
    title="Origin Story"
    fields={[
      { key: 'originLabel', label: 'Label', col: 6 },
      { key: 'originTitle', label: 'Title', col: 6 },
      { key: 'originText', label: 'Origin Text', col: 12, type: 'textarea', rows: 5 },
    ]}
  />
);

export default OriginStorySettings;
