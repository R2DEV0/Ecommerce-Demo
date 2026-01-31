import 'dotenv/config';
import { seedDatabase } from '../lib/seed';

async function main() {
  try {
    console.log('Starting database seed...');
    console.log('Make sure your .env file has TURSO_DATABASE_URL and TURSO_AUTH_TOKEN set if using Turso.\n');
    const result = await seedDatabase();
    console.log('\nSeed completed successfully!');
    if (result.summary) {
      console.log('Summary:', result.summary);
    }
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Seed failed with error:');
    console.error(error);
    if (error.message) {
      console.error('\nError message:', error.message);
    }
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
    process.exit(1);
  }
}

main();

