import { execSync } from 'child_process';
import * as fs from 'fs';

interface Resume {
    profile: { name: string; email: string; summary: string };
    skills: { category: string; name: string }[];
    experience: { company: string; role: string; location?: string; start_date: string; end_date?: string; description: string }[];
    education: { institution: string; degree: string; graduation_year: number }[];
    projects?: { name: string; tech_stack: string; description: string; link?: string }[];
}

const resumePath = process.argv[2] || 'resume.json';

if (!fs.existsSync(resumePath)) {
    console.error(`Resume file not found: ${resumePath}`);
    process.exit(1);
}

const resume: Resume = JSON.parse(fs.readFileSync(resumePath, 'utf-8'));
const sqlCommands: string[] = [];

sqlCommands.push('DELETE FROM profile;');
sqlCommands.push('DELETE FROM skills;');
sqlCommands.push('DELETE FROM experience;');
sqlCommands.push('DELETE FROM education;');
sqlCommands.push('DELETE FROM projects;');

sqlCommands.push(`INSERT INTO profile (id, name, email, summary) VALUES (1, '${resume.profile.name.replace(/'/g, "''")}', '${resume.profile.email.replace(/'/g, "''")}', '${resume.profile.summary.replace(/'/g, "''")}');`);

resume.skills.forEach(skill => {
    sqlCommands.push(`INSERT INTO skills (category, name) VALUES ('${skill.category.replace(/'/g, "''")}', '${skill.name.replace(/'/g, "''")}');`);
});

resume.experience.forEach(exp => {
    sqlCommands.push(`INSERT INTO experience (company, role, location, start_date, end_date, description) VALUES ('${exp.company.replace(/'/g, "''")}', '${exp.role.replace(/'/g, "''")}', '${(exp.location || '').replace(/'/g, "''")}', '${exp.start_date}', '${(exp.end_date || '').replace(/'/g, "''")}', '${exp.description.replace(/'/g, "''")}');`);
});

resume.education.forEach(edu => {
    sqlCommands.push(`INSERT INTO education (institution, degree, graduation_year) VALUES ('${edu.institution.replace(/'/g, "''")}', '${edu.degree.replace(/'/g, "''")}', ${edu.graduation_year});`);
});

if (resume.projects) {
    resume.projects.forEach(proj => {
        sqlCommands.push(`INSERT INTO projects (name, tech_stack, description, link) VALUES ('${proj.name.replace(/'/g, "''")}', '${proj.tech_stack.replace(/'/g, "''")}', '${proj.description.replace(/'/g, "''")}', '${(proj.link || '').replace(/'/g, "''")}');`);
    });
}

const tempSqlFile = 'temp_update.sql';
fs.writeFileSync(tempSqlFile, sqlCommands.join('\n'));

try {
    console.log('Syncing resume data to remote database...');
    execSync(`npx wrangler d1 execute resume-db --remote --file=${tempSqlFile} --yes`, { stdio: 'inherit' });
    console.log('Successfully synced resume.');
} catch (error) {
    console.error('Failed to sync resume:', error);
} finally {
    fs.unlinkSync(tempSqlFile);
}
