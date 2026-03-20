import { execSync } from 'child_process';

const keyId = process.argv[2];

if (!keyId) {
    console.error('Usage: npx ts-node scripts/remove-key.ts [id]');
    process.exit(1);
}

try {
    console.log(`Deactivating/Removing key with ID: ${keyId}`);
    // You can choose to either DELETE or just set active = 0.
    // Setting active = 0 is safer for history, but DELETE keeps DB clean.
    execSync(`npx wrangler d1 execute resume-db --remote --command="DELETE FROM api_keys WHERE id = ${keyId};" --yes`, { stdio: 'inherit' });
    console.log('Successfully removed key.');
} catch (error) {
    console.error('Failed to remove key:', error);
}
