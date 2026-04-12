import React from 'react';
import SettingsSection from '../SettingsSection';

const CtaBannerSettings = () => (
  <SettingsSection
    title="CTA Banner"
    fields={[
      { key: 'ctaBannerTitle', label: 'Banner Title', col: 6 },
      { key: 'ctaButtonText', label: 'Button Text', col: 6 },
      { key: 'ctaBannerDescription', label: 'Banner Description', col: 12, type: 'textarea', rows: 2 },
    ]}
  />
);

export default CtaBannerSettings;
