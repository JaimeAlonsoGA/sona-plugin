/**
 * Main entry point for the Audio Worker Service
 */

import { loadConfig } from './config.js';
import { logger } from './logger.js';
import { AudioWorker } from './worker.js';

/**
 * Main function to start the worker
 */
async function main() {
  try {
    logger.info('=== Sona Audio Worker Service ===');
    logger.info('Loading configuration...');

    // Load and validate configuration
    const config = loadConfig();
    logger.info('Configuration loaded successfully');

    // Create and start worker
    const worker = new AudioWorker(config);
    await worker.start();

    // Handle graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`);
      worker.stop();
      
      // Give ongoing jobs a chance to finish
      setTimeout(() => {
        logger.info('Shutdown complete');
        process.exit(0);
      }, 5000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    logger.error('Fatal error starting worker:', error);
    process.exit(1);
  }
}

// Start the worker
main();
