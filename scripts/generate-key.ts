import { randomBytes, createHash } from 'crypto';
import { execSync } from 'child_process';

const recruiterName = process.argv[2];
const daysToExpire = parseInt(process.argv[3]) || 90;

if (!recruiterName) {
    console.error('Usage: npx ts-node scripts/generate-key.ts "Recruiter Name" [days_to_expire]');
    process.exit(1);
}

const apiKey = `resume_live_${randomBytes(16).toString('hex')}`;
const keyHash = createHash('sha256').update(apiKey).digest('hex');

console.log(`Generating key for: ${recruiterName}`);
console.log(`API Key: ${apiKey}`);
console.log(`Expires in: ${daysToExpire} days`);
console.log('Keep this key safe! It will not be shown again.');

const sql = `INSERT INTO api_keys (key_hash, recruiter_name, expires_at) VALUES ('${keyHash}', '${recruiterName}', datetime('now', '+${daysToExpire} days'));`;

try {
    console.log('Updating remote database...');
    execSync(`npx wrangler d1 execute resume-db --remote --command="${sql}" --yes`, { stdio: 'inherit' });
    console.log('Successfully added key to remote database.');
} catch (error) {
    console.error('Failed to update remote database:', error);
}
