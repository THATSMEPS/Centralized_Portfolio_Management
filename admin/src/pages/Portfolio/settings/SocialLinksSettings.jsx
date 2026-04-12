import React from 'react';
import SettingsSection from '../SettingsSection';

const SocialLinksSettings = () => (
  <SettingsSection
    title="Social Links"
    arrayFields={[
      {
        key: 'socialLinks',
        label: 'Social Links',
        template: { platform: '', url: '', icon: '' },
        columns: [
          { field: 'platform', placeholder: 'Platform', col: 3 },
          { field: 'url', placeholder: 'URL', col: 5 },
          { field: 'icon', placeholder: 'Icon class', col: 3 },
        ],
      },
    ]}
  />
);

export default SocialLinksSettings;
