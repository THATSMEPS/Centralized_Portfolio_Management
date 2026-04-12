/**
 * Archive / Projects Data
 * -----------------------------------------------
 * Drives the ArchivePage filterable project list.
 */

const ARCHIVE_PROJECTS = [
  {
    id: '01',
    title: 'SYNAPSE-V4',
    tech: 'PyTorch / CUDA',
    type: 'AI/ML',
    impact: '98%',
    status: 'DEPLOYED',
    desc: 'Neural routing engine for autonomous drone swarms utilizing real-time edge processing.',
  },
  {
    id: '02',
    title: 'VOID-OS',
    tech: 'Rust / WASM',
    type: 'Systems',
    impact: '92%',
    status: 'ARCHIVED',
    desc: 'Low-latency operating environment designed for high-concurrency edge computing nodes.',
  },
  {
    id: '03',
    title: 'AETHER-UI',
    tech: 'WebGL / GLSL',
    type: 'Interface',
    impact: '85%',
    status: 'STABLE',
    desc: 'Volumetric data visualization layer for monitoring global climate sensor nodes.',
  },
  {
    id: '04',
    title: 'QUANTUM-L1',
    tech: 'Go / Solidity',
    type: 'Blockchain',
    impact: '99%',
    status: 'ACTIVE',
    desc: 'Custom Layer 1 protocol optimized for sub-second settlement and instant finality.',
  },
  {
    id: '05',
    title: 'NEBULA-X',
    tech: 'C++ / Vulkan',
    type: 'Graphics',
    impact: '94%',
    status: 'INTERNAL',
    desc: 'Proprietary rendering engine used for large-scale 4D spatial simulations.',
  },
  {
    id: '06',
    title: 'GHOST-DB',
    tech: 'Zig / Raft',
    type: 'Database',
    impact: '89%',
    status: 'BETA',
    desc: 'Distributed, self-healing database architecture with zero-knowledge persistence.',
  },
];

/** Filter tags shown in the UI */
export const PROJECT_FILTER_TAGS = ['ALL', 'AI', 'SYSTEMS', 'INTERFACE', 'BLOCKCHAIN'];

export default ARCHIVE_PROJECTS;
