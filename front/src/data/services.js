/**
 * Services / Capabilities Data
 * -----------------------------------------------
 * Defines the three service pillars shown on the
 * HomePage capabilities section.
 *
 * NOTE: Icons are NOT stored here because they are
 * React elements. Instead we store the icon name as
 * a string and resolve to the component at render
 * time via the ServiceCard component.
 */

const DETAILED_SERVICES = [
  {
    id: 'S1',
    category: 'Intelligence',
    title: 'Neural Infrastructure',
    iconName: 'Cpu',
    iconColor: 'text-blue-500',
    desc: 'We build the nervous systems for modern AI. From custom LLM orchestration to high-speed inference engines.',
    features: ['LLM Fine-tuning', 'Vector Database RAG', 'Autonomous Agent Logic'],
    tech: ['PyTorch', 'LangChain', 'Pinecone'],
    accent: 'blue',
  },
  {
    id: 'S2',
    category: 'Infrastructure',
    title: 'High-Load Backends',
    iconName: 'Network',
    iconColor: 'text-emerald-500',
    desc: 'Engineering mission-critical systems that handle millions of concurrent requests with zero downtime.',
    features: ['Microservices (Go/Rust)', 'Distributed Consensus', 'Cloud-Native Scaling'],
    tech: ['Kubernetes', 'gRPC', 'Redis'],
    accent: 'emerald',
  },
  {
    id: 'S3',
    category: 'Interface',
    title: 'Spatial Experiences',
    iconName: 'Orbit',
    iconColor: 'text-purple-500',
    desc: 'Redefining how humans interact with data through 3D, AR, and high-fidelity WebGL environments.',
    features: ['WebGL/Three.js', 'Immersive Dashboards', 'Interaction Design'],
    tech: ['Three.js', 'GLSL', 'React Native'],
    accent: 'purple',
  },
];

export default DETAILED_SERVICES;
