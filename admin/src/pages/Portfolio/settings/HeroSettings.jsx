import React from 'react';
import SettingsSection from '../SettingsSection';

const HeroSettings = () => (
  <SettingsSection
    title="Hero Section"
    fields={[
      { key: 'heroTitle', label: 'Hero Title', col: 6 },
      { key: 'brandName', label: 'Brand Name', col: 6 },
      { key: 'heroSubtitle', label: 'Hero Subtitle', col: 12 },
      { key: 'heroTagline1', label: 'Tagline 1', col: 6 },
      { key: 'heroTagline2', label: 'Tagline 2', col: 6 },
    ]}
  />
);

export default HeroSettings;
