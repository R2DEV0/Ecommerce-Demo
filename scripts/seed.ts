import { seedDatabase } from '../lib/seed';

async function main() {
  try {
    console.log('Starting database seed...');
    const result = await seedDatabase();
    console.log('Seed completed:', result);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

main();

