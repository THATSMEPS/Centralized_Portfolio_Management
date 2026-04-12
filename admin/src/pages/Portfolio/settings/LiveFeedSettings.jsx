import React from 'react';
import SettingsSection from '../SettingsSection';

const LiveFeedSettings = () => (
  <SettingsSection
    title="Live Feed"
    fields={[
      { key: 'liveFeedTitle', label: 'Feed Title', col: 12 },
    ]}
    arrayFields={[
      {
        key: 'liveFeedEntries',
        label: 'Feed Entries',
        template: { text: '', color: 'text-gray-500', timestamp: '' },
        columns: [
          { field: 'text', placeholder: 'Text', col: 5 },
          { field: 'color', placeholder: 'Color class', col: 3 },
          { field: 'timestamp', placeholder: 'Timestamp', col: 3 },
        ],
      },
    ]}
  />
);

export default LiveFeedSettings;
