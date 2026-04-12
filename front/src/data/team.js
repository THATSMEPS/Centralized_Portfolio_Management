/**
 * Team Members Data
 * -----------------------------------------------
 * Each member object drives the HomePage hero grid
 * and the full MemberPage dossier.
 *
 * In the future an admin panel can CRUD these via API;
 * until then this static export is the single source.
 */

const TEAM = [
  {
    id: 1,
    name: 'Alex Rivera',
    role: 'System Architect',
    accent: 'from-blue-600 to-cyan-400',
    glow: 'rgba(6, 182, 212, 0.4)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Engineering the foundational layers of decentralized intelligence and high-concurrency systems.',
    personal: {
      location: 'San Francisco, CA',
      email: 'alex@nebula.core',
      languages: ['English (Native)', 'Japanese (Fluent)'],
    },
    education: [
      { degree: 'M.Sc. Computer Science', school: 'Stanford University', year: '2016' },
      { degree: 'B.Sc. Software Engineering', school: 'MIT', year: '2014' },
    ],
    experience: [
      {
        company: 'Google Cloud',
        role: 'Senior L6 Engineer',
        period: '2018 - 2023',
        desc: 'Led the scalability initiative for Firestore multi-region clusters.',
      },
      {
        company: 'OpenAI',
        role: 'Distributed Systems Research',
        period: '2016 - 2018',
        desc: 'Optimized training pipelines for GPT-2 large-scale deployments.',
      },
    ],
    skills: [
      { name: 'Rust / C++', level: 95 },
      { name: 'Distributed Systems', level: 98 },
      { name: 'Kubernetes/K8s', level: 90 },
      { name: 'LLM Orchestration', level: 85 },
    ],
    projects: [
      { title: 'NeuralFlow 2.0', type: 'AI Engine', link: '#', tags: ['Python', 'Cuda'] },
      { title: 'Quantum Ledger', type: 'Blockchain', link: '#', tags: ['Rust', 'Wasm'] },
    ],
    certificates: ['AWS Solutions Architect Professional', 'CKAD - Kubernetes Developer'],
  },
  {
    id: 2,
    name: 'Sarah Chen',
    role: 'Interface Visionary',
    accent: 'from-purple-600 to-pink-500',
    glow: 'rgba(217, 70, 239, 0.4)',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: 'Bridging the gap between cognitive psychology and spatial computing through fluid digital environments.',
    personal: {
      location: 'London, UK',
      email: 'sarah@nebula.core',
      languages: ['English', 'Mandarin', 'French'],
    },
    education: [
      { degree: 'MA Interaction Design', school: 'Royal College of Art', year: '2018' },
      { degree: 'BA Digital Media', school: 'UCL', year: '2015' },
    ],
    experience: [
      {
        company: 'Meta',
        role: 'Product Designer (Quest)',
        period: '2019 - 2024',
        desc: 'Designed the spatial OS multitasking framework for Quest 3.',
      },
      {
        company: 'Stripe',
        role: 'UX Engineer',
        period: '2018 - 2019',
        desc: 'Developed the Checkout flow utilized by 2M+ businesses.',
      },
    ],
    skills: [
      { name: 'Three.js / WebGL', level: 98 },
      { name: 'Figma Mastery', level: 95 },
      { name: 'React / Framer', level: 92 },
      { name: 'Spatial UX', level: 99 },
    ],
    projects: [
      { title: 'Liquid Design', type: 'Design System', link: '#', tags: ['React', 'GLSL'] },
      { title: 'Nebula Glass', type: 'AR App', link: '#', tags: ['Unity', 'Swift'] },
    ],
    certificates: ['Interaction Design Excellence 2022', 'Awwwards Jury Member'],
  },
];

export default TEAM;
