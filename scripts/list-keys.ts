import { execSync } from 'child_process';

try {
    console.log('Fetching API keys from remote database...');
    execSync('npx wrangler d1 execute resume-db --remote --command="SELECT id, recruiter_name, expires_at, active FROM api_keys ORDER BY created_at DESC;" --yes', { stdio: 'inherit' });
} catch (error) {
    console.error('Failed to fetch API keys:', error);
}
