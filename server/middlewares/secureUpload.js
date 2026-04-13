const multer = require("multer");
const { randomBytes, randomUUID } = require('crypto');
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const path = require("path");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Synchronous UUID v4 generator
 */
function uuidv4() {
    if (typeof randomUUID === 'function') return randomUUID();
    const bytes = randomBytes(16);
    bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
    bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10
    const hex = bytes.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

// Lazy load sharp
let sharp = null;
let sharpAvailable = false;
try {
    sharp = require("sharp");
    sharpAvailable = true;
    console.log('[UPLOAD] Sharp loaded - image compression enabled');
} catch (err) {
    console.warn('[UPLOAD] Sharp not available - image compression disabled');
    sharpAvailable = false;
}

// ============ SECURITY CONFIGURATION ============
const DANGEROUS_EXTENSIONS_REGEX = /\.(php|php\d|phtml|exe|sh|bash|pl|py|js|jsp|asp|aspx|bat|cmd|vbs|wsf|cgi|com|dll|msi|scr)(\.|$)/i;

const ALLOWED_MIMES = {
    images: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    documents: ['application/pdf'],
    all: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
};

const ALLOWED_EXTENSIONS = {
    images: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    documents: ['.pdf'],
    all: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
};

const FILE_SIZE_LIMITS = {
    image: 2 * 1024 * 1024,      // 2 MB
    document: 10 * 1024 * 1024,  // 10 MB
    default: 5 * 1024 * 1024,    // 5 MB
};

// ============ CLOUDINARY HELPER ============

/**
 * Upload buffer to Cloudinary
 */
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: resourceType,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
};

// ============ VALIDATION HELPERS ============

async function validateBufferMagicBytes(buffer, allowedMimes) {
    try {
        const { fileTypeFromBuffer } = await import('file-type');
        const typeInfo = await fileTypeFromBuffer(buffer);
        if (!typeInfo) return { valid: false, detected: null, error: 'Could not determine file signature' };
        if (!allowedMimes.includes(typeInfo.mime)) {
            return { valid: false, detected: typeInfo.mime, error: `File type mismatch. Detected: ${typeInfo.mime}` };
        }
        return { valid: true, detected: typeInfo.mime };
    } catch (error) {
        return { valid: false, detected: null, error: error.message };
    }
}

// ============ IMAGE PROCESSING ============

async function compressToWebP(input, options = {}) {
    if (!sharpAvailable || !sharp) return input;
    const { quality = 85, maxWidth = 1920, maxHeight = 1080 } = options;
    try {
        let sharpInstance = sharp(input);
        const metadata = await sharpInstance.metadata();
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            sharpInstance = sharpInstance.resize(maxWidth, maxHeight, { fit: 'inside', withoutEnlargement: true });
        }
        return await sharpInstance.webp({ quality: Math.max(10, Math.min(100, quality)) }).toBuffer();
    } catch (error) {
        throw new Error(`Image compression failed: ${error.message}`);
    }
}

// ============ MIDDLEWARE FACTORIES ============

function createFileFilter(allowedMimes, allowedExts) {
    return (req, file, cb) => {
        const originalName = file.originalname.toLowerCase();
        const ext = path.extname(originalName);
        if (DANGEROUS_EXTENSIONS_REGEX.test(originalName)) return cb(new Error('Potentially dangerous file type.'));
        if (!allowedExts.includes(ext)) return cb(new Error(`Invalid extension. Allowed: ${allowedExts.join(', ')}`));
        if (!allowedMimes.includes(file.mimetype)) return cb(new Error(`Invalid type. Allowed: ${allowedMimes.join(', ')}`));
        cb(null, true);
    };
}

const cloudUploadHandler = async (req, res, next, uploader, isMulti = false, options = {}) => {
    uploader(req, res, async (err) => {
        if (err) return res.status(400).json({ isOk: false, message: err.message });
        
        const filesToProcess = isMulti ? [] : (req.file ? [req.file] : []);
        if (isMulti && req.files) {
            Object.keys(req.files).forEach(key => filesToProcess.push(...req.files[key]));
        }

        if (filesToProcess.length === 0) return next();

        try {
            for (const file of filesToProcess) {
                const validation = await validateBufferMagicBytes(file.buffer, options.allowedMimes || ALLOWED_MIMES.all);
                if (!validation.valid) throw new Error(validation.error);

                let buffer = file.buffer;
                if (options.isImage && sharpAvailable) {
                    buffer = await compressToWebP(file.buffer, { quality: options.quality || 85 });
                    file.mimetype = 'image/webp';
                }

                // Cloudinary Folder (uses destination if provided, or project name)
                const folderName = options.destination || "portfolio_uploads";
                const cloudResult = await uploadToCloudinary(buffer, folderName);
                
                file.path = cloudResult.secure_url; // Controllers use .path for URL
                file.filename = cloudResult.public_id;
                file.size = cloudResult.bytes;
            }
            next();
        } catch (error) {
            console.error('[UPLOAD ERROR]', error);
            res.status(500).json({ isOk: false, message: error.message });
        }
    });
};

function createSecureImageUpload(options = {}) {
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: createFileFilter(ALLOWED_MIMES.images, ALLOWED_EXTENSIONS.images),
        limits: { fileSize: options.maxSize || FILE_SIZE_LIMITS.image },
    });
    return (req, res, next) => cloudUploadHandler(req, res, next, upload.single(options.fieldName || 'file'), false, { ...options, isImage: true, allowedMimes: ALLOWED_MIMES.images });
}

function createSecureDocumentUpload(options = {}) {
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: createFileFilter(ALLOWED_MIMES.documents, ALLOWED_EXTENSIONS.documents),
        limits: { fileSize: options.maxSize || FILE_SIZE_LIMITS.document },
    });
    return (req, res, next) => cloudUploadHandler(req, res, next, upload.single(options.fieldName || 'file'), false, { ...options, isImage: false, allowedMimes: ALLOWED_MIMES.documents });
}

function createSecureMultiUpload(options = {}) {
    const upload = multer({
        storage: multer.memoryStorage(),
        fileFilter: createFileFilter(ALLOWED_MIMES.images, ALLOWED_EXTENSIONS.images),
        limits: { fileSize: options.maxSize || FILE_SIZE_LIMITS.default },
    });
    const fields = options.fields || [{ name: 'files', maxCount: 5 }];
    return (req, res, next) => cloudUploadHandler(req, res, next, upload.fields(fields), true, { ...options, isImage: true, allowedMimes: ALLOWED_MIMES.images });
}

module.exports = {
    createSecureImageUpload,
    createSecureDocumentUpload,
    createSecureMultiUpload,
    validateBufferMagicBytes,
    ALLOWED_MIMES,
    ALLOWED_EXTENSIONS,
    FILE_SIZE_LIMITS,
};
