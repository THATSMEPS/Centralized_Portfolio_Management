require('dotenv').config();
const mongoose = require('mongoose');
const CompanyMaster = require('./models/CompanyMaster');
const Project = require('./models/Project');
const TeamMember = require('./models/TeamMember');

const check = async () => {
    await mongoose.connect(process.env.DATABASE);
    const companyCount = await CompanyMaster.countDocuments({ logo: { $regex: 'uploads' } });
    const projectCount = await Project.countDocuments({ image: { $regex: 'uploads' } });
    const memberCount = await TeamMember.countDocuments({ avatar: { $regex: 'uploads' } });
    
    console.log('Results:');
    console.log('Companies with uploads:', companyCount);
    console.log('Projects with uploads:', projectCount);
    console.log('Members with uploads:', memberCount);
    
    process.exit(0);
};
check();
