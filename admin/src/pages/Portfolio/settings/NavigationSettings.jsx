import React from 'react';
import SettingsSection from '../SettingsSection';

const NavigationSettings = () => (
  <SettingsSection
    title="Navigation"
    arrayFields={[
      {
        key: 'navItems',
        label: 'Nav Items',
        template: { key: '', label: '', type: 'link', order: 0 },
        columns: [
          { field: 'key', placeholder: 'Key', col: 3 },
          { field: 'label', placeholder: 'Label', col: 3 },
          { field: 'type', type: 'select', col: 2, default: 'link', options: [
            { value: 'link', label: 'Link' },
            { value: 'button', label: 'Button' },
          ]},
          { field: 'order', placeholder: 'Order', type: 'number', col: 2 },
        ],
      },
    ]}
  />
);

export default NavigationSettings;
