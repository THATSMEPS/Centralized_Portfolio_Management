require('dotenv').config();
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Models
const CompanyMaster = require('../models/CompanyMaster');
const Project = require('../models/Project');
const TeamMember = require('../models/TeamMember');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadFile = async (localPath, folder) => {
    try {
        // Resolve path relative to server root
        const absolutePath = path.resolve(__dirname, '..', localPath);
        if (!fs.existsSync(absolutePath)) {
            console.warn(`[SKIP] File not found: ${absolutePath}`);
            return null;
        }

        console.log(`[UPLOADING] ${localPath} ...`);
        const result = await cloudinary.uploader.upload(absolutePath, {
            folder: folder,
        });
        return result.secure_url;
    } catch (error) {
        console.error(`[ERROR] Failed to upload ${localPath}:`, error.message);
        return null;
    }
};

const migrate = async () => {
    try {
        console.log('--- Starting Migration to Cloudinary ---');
        await mongoose.connect(process.env.DATABASE);
        console.log('Connected to MongoDB.');

        // 1. Migrate Company Master (Logos)
        const companies = await CompanyMaster.find({});
        for (const company of companies) {
            let updated = false;
            if (company.logo && company.logo.startsWith('uploads/')) {
                const url = await uploadFile(company.logo, 'company_logos');
                if (url) { company.logo = url; updated = true; }
            }
            if (company.favicon && company.favicon.startsWith('uploads/')) {
                const url = await uploadFile(company.favicon, 'company_favicons');
                if (url) { company.favicon = url; updated = true; }
            }
            if (updated) await company.save();
        }
        console.log('✓ Company images migrated.');

        // 2. Migrate Projects
        const projects = await Project.find({});
        for (const project of projects) {
            if (project.image && project.image.startsWith('uploads/')) {
                const url = await uploadFile(project.image, 'projects');
                if (url) {
                    project.image = url;
                    await project.save();
                }
            }
        }
        console.log('✓ Project images migrated.');

        // 3. Migrate Team Members
        const members = await TeamMember.find({});
        for (const member of members) {
            if (member.avatar && member.avatar.startsWith('uploads/')) {
                const url = await uploadFile(member.avatar, 'team_members');
                if (url) {
                    member.avatar = url;
                    await member.save();
                }
            }
        }
        console.log('✓ Team member images migrated.');

        console.log('--- Migration Finished Successfully ---');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migrate();
