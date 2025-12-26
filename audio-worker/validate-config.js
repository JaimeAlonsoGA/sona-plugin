#!/usr/bin/env node

/**
 * Configuration validation script
 * Run this to check if your .env file is properly configured
 */

import { loadConfig } from './dist/config.js';
import { logger } from './dist/logger.js';
import { createClient } from '@supabase/supabase-js';

async function validateConfiguration() {
  console.log('=== Configuration Validation ===\n');

  try {
    // Load configuration
    console.log('✓ Loading configuration from .env file...');
    const config = loadConfig();
    console.log('✓ Configuration loaded successfully\n');

    // Display configuration (without secrets)
    console.log('Configuration:');
    console.log(`  - Supabase URL: ${config.supabaseUrl}`);
    console.log(`  - Service Role Key: ${config.supabaseServiceRoleKey.substring(0, 20)}...`);
    console.log(`  - Stable Audio API Key: ${config.stableAudioApiKey.substring(0, 20)}...`);
    console.log(`  - Stable Audio API URL: ${config.stableAudioApiUrl}`);
    console.log(`  - Max Concurrent Jobs: ${config.maxConcurrentJobs}`);
    console.log(`  - Poll Interval: ${config.pollIntervalMs}ms`);
    console.log(`  - Job Timeout: ${config.jobTimeoutMs}ms`);
    console.log(`  - Storage Bucket: ${config.storageBucket}`);
    console.log(`  - Storage Path Prefix: ${config.storagePathPrefix}`);
    console.log(`  - Max Retries: ${config.maxRetries}`);
    console.log(`  - Retry Delay: ${config.retryDelayMs}ms`);
    console.log(`  - Log Level: ${config.logLevel}\n`);

    // Test Supabase connection
    console.log('✓ Testing Supabase connection...');
    const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);
    
    // Try to query the jobs table
    const { data, error } = await supabase
      .from('jobs')
      .select('id')
      .limit(1);

    if (error) {
      console.error('✗ Supabase connection test failed:', error.message);
      console.error('\nPlease check:');
      console.error('  1. SUPABASE_URL is correct');
      console.error('  2. SUPABASE_SERVICE_ROLE_KEY is valid');
      console.error('  3. The jobs table exists in your database');
      console.error('  4. Run the database migrations: supabase db push\n');
      process.exit(1);
    }

    console.log('✓ Supabase connection successful\n');

    // Test storage bucket
    console.log('✓ Testing storage bucket...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.error('✗ Storage bucket check failed:', bucketError.message);
      process.exit(1);
    }

    const bucketExists = buckets?.some(b => b.name === config.storageBucket);
    
    if (bucketExists) {
      console.log(`✓ Storage bucket "${config.storageBucket}" exists\n`);
    } else {
      console.log(`⚠ Storage bucket "${config.storageBucket}" does not exist`);
      console.log('  The worker will create it automatically on first run\n');
    }

    // Summary
    console.log('=== Validation Complete ===');
    console.log('✓ All checks passed!');
    console.log('\nYour worker is ready to run. Start it with:');
    console.log('  npm run dev   (development mode)');
    console.log('  npm start     (production mode)\n');

  } catch (error) {
    console.error('\n✗ Configuration validation failed:', error instanceof Error ? error.message : error);
    console.error('\nPlease check your .env file and ensure all required variables are set.');
    console.error('See .env.example for reference.\n');
    process.exit(1);
  }
}

validateConfiguration();
