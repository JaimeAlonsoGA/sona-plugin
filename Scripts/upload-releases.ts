/**
 * Script to upload plugin releases to Supabase Storage
 * Run with: npx tsx scripts/upload-releases.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = 'https://ucxhzpxyjxuhlqmbomrv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_SERVICE_KEY) {
    console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const BUCKET_NAME = 'releases';
const RELEASES_DIR = path.join(__dirname, '..', 'releases');

interface ReleaseFile {
    localPath: string;
    storagePath: string;
}

const releaseFiles: ReleaseFile[] = [
    {
        localPath: path.join(RELEASES_DIR, 'Sona-Windows-Bundle.zip'),
        storagePath: 'windows/Sona-Windows-Bundle.zip'
    },
    {
        localPath: path.join(RELEASES_DIR, 'Sona-Windows-VST3.zip'),
        storagePath: 'windows/Sona-Windows-VST3.zip'
    },
    {
        localPath: path.join(RELEASES_DIR, 'Sona-Windows-Standalone.zip'),
        storagePath: 'windows/Sona-Windows-Standalone.zip'
    }
];

async function ensureBucketExists() {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(b => b.name === BUCKET_NAME);

    if (!bucketExists) {
        console.log(`Creating bucket: ${BUCKET_NAME}`);
        const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
            public: true,
            fileSizeLimit: 100 * 1024 * 1024 // 100MB
        });
        if (error) {
            console.error('Error creating bucket:', error);
            throw error;
        }
    }
}

async function uploadFile(file: ReleaseFile) {
    console.log(`Uploading ${file.localPath} to ${file.storagePath}...`);

    const fileBuffer = fs.readFileSync(file.localPath);
    const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(file.storagePath, fileBuffer, {
            contentType: 'application/zip',
            upsert: true
        });

    if (error) {
        console.error(`Error uploading ${file.storagePath}:`, error);
        throw error;
    }

    const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(file.storagePath);

    console.log(`✓ Uploaded: ${urlData.publicUrl}`);
    return urlData.publicUrl;
}

async function main() {
    try {
        console.log('=== Uploading SONA Plugin Releases ===\n');

        await ensureBucketExists();

        const uploadedUrls: Record<string, string> = {};

        for (const file of releaseFiles) {
            if (fs.existsSync(file.localPath)) {
                const url = await uploadFile(file);
                uploadedUrls[path.basename(file.localPath)] = url;
            } else {
                console.warn(`⚠ File not found: ${file.localPath}`);
            }
        }

        console.log('\n=== Upload Complete ===');
        console.log('URLs:', JSON.stringify(uploadedUrls, null, 2));

    } catch (error) {
        console.error('Upload failed:', error);
        process.exit(1);
    }
}

main();
