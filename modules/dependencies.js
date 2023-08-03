import { exec } from 'child_process';
import { promisify } from 'util';
import npmlog from 'npmlog';
import fs from "fs-extra";

npmlog.heading = 'Auto-Plex';

const execPromise = promisify(exec);

export async function installDependencies(projectDir) {
  npmlog.info('install', 'Starting installation of required packages...');

  const loadingChars = ['|', '/', '-', '\\'];
  let loadingCounter = 0;

  const loadingInterval = setInterval(() => {
    process.stdout.write(`\rInstalling packages... ${loadingChars[loadingCounter]}`);
    loadingCounter = (loadingCounter + 1) % loadingChars.length;
  }, 200);

  try {
    await execPromise(`npm install`, { cwd: projectDir, shell: true });

    clearInterval(loadingInterval);
    console.log();
    npmlog.info('install', 'Modules successfully installed!');

    // Run the command "npx tsc --init"
    await execPromise(`npx tsc --init`, { cwd: projectDir, shell: true });
    console.log();
    npmlog.info('install', 'TypeScript configuration initialized successfully!');

    // Update the tsconfig.json file
    await updateTsConfig(projectDir);
    console.log();
    npmlog.info('install', 'tsconfig.json file updated successfully!');

    // Run the command "npx prisma init"
    await execPromise(`npx prisma init`, { cwd: projectDir, shell: true });
    console.log();
    npmlog.info('install', 'Prisma initialized successfully!');

    // Create the prism/index.ts file
    await createPrismaIndexFile(projectDir);
    console.log();
    npmlog.info('install', 'PrismaClient configuration completed successfully!');

    console.log();
    npmlog.info('install', 'Your backend has been created successfully!');
    
  } catch (error) {
    clearInterval(loadingInterval);

    npmlog.error('install', 'Error installing modules:', error.message);
  }
}

async function updateTsConfig(projectDir) {
  const tsConfigPath = `${projectDir}/tsconfig.json`;

  try {
    const tsConfigContent = await fs.readFile(tsConfigPath, 'utf-8');
    const updatedTsConfigContent = tsConfigContent
      .replace('// "typeRoots": [],', '"typeRoots": [\n      "./src/@types"\n    ],')
      .replace('"strict": false /* Enable all strict type-checking options. */', '"strict": true, /* Enable all strict type-checking options. */');

    await fs.writeFile(tsConfigPath, updatedTsConfigContent, 'utf-8');
  } catch (error) {
    npmlog.error('install', 'Error updating tsconfig.json file:', error.message);
  }
}

async function createPrismaIndexFile(projectDir) {
  const prismaIndexPath = `${projectDir}/prisma/index.ts`;
  const prismaIndexContent = `import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

export default prismaClient;
`;

  await fs.writeFile(prismaIndexPath, prismaIndexContent, 'utf-8');
}

