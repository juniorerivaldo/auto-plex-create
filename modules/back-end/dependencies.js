import { exec } from "child_process";
import { promisify } from "util";
import npmlog from "npmlog";
import fs from "fs-extra";

npmlog.heading = "Auto-Plex";

const execPromise = promisify(exec);

export async function installDependencies(projectDir) {
  npmlog.info("install", "Starting installation of required packages...");

  const loadingChars = ["|", "/", "-", "\\"];
  let loadingCounter = 0;

  const loadingInterval = setInterval(() => {
    process.stdout.write(`\rInstalling packages... ${loadingChars[loadingCounter]}`);
    loadingCounter = (loadingCounter + 1) % loadingChars.length;
  }, 200);

  try {
    await execPromise(`npm install`, { cwd: projectDir, shell: true });

    clearInterval(loadingInterval);
    console.log();
    npmlog.info("install", "Modules successfully installed!");

    // Run the command "npx tsc --init"
    await execPromise(`npx tsc --init`, { cwd: projectDir, shell: true });
    console.log();
    npmlog.info("install", "TypeScript configuration initialized successfully!");

    // Update the tsconfig.json file
    await updateTsConfig(projectDir);
    console.log();
    npmlog.info("install", "tsconfig.json file updated successfully!");

    // Run the command "npx prisma init"
    await execPromise(`npx prisma init`, { cwd: projectDir, shell: true });
    console.log();
    npmlog.info("install", "Prisma initialized successfully!");

    // Create the prism/index.ts file
    await createPrismaIndexFile(projectDir);
    console.log();
    npmlog.info("install", "PrismaClient configuration completed successfully!");

    // Create dotEnv template
    const dotEnvContent = `
  DATABASE_URL="mysql://user:password@yourserver.com:port/db_name?schema=public"
  SHADOW_DATABASE_URL="mysql://user:password@youtserver.com:port/db_name_shadow?schema=public"
  JWT_SECRET_KEY="your_secret_key"
  JWT_EXPIRED_TIME='30d' #30 days
  APP_URL="http://localhost:8080"
  ACTIVATE_URL="http://localhost:8080/active?token="
  RESET_URL="http://localhost:8080/reset"
  
  SMTP_USER_FROM="user_email_to_send@youremail.com"
  SMTP_HOST="smtp.yourserver.com"
  SMTP_PORT="465"
  SMTP_USER="user_email_to_send@youremail.com"
  SMTP_PASSWORD="password_from_email"
      `;
    const filePath = `${projectDir}/.env`;

    // Write the content of 'dotEnv' to the .env file
    fs.writeFileSync(filePath, dotEnvContent);

    console.log();
    npmlog.info("install", "update dot env template!");

    console.log();
    npmlog.info("install", "Your backend has been created successfully!");
  } catch (error) {
    clearInterval(loadingInterval);

    npmlog.error("install", "Error installing modules:", error.message);
  }
}

async function updateTsConfig(projectDir) {
  const tsConfigPath = `${projectDir}/tsconfig.json`;

  try {
    const tsConfigContent = await fs.readFile(tsConfigPath, "utf-8");
    const updatedTsConfigContent = tsConfigContent
      .replace('// "typeRoots": [],', '"typeRoots": [\n      "./src/@types"\n    ],')
      .replace('"strict": false /* Enable all strict type-checking options. */', '"strict": true, /* Enable all strict type-checking options. */');

    await fs.writeFile(tsConfigPath, updatedTsConfigContent, "utf-8");
  } catch (error) {
    npmlog.error("install", "Error updating tsconfig.json file:", error.message);
  }
}

async function createPrismaIndexFile(projectDir) {
  const prismaIndexPath = `${projectDir}/prisma/index.ts`;
  const prismaIndexContent = `import { PrismaClient } from "@prisma/client";

const prismaClient = new PrismaClient();

export default prismaClient;
`;

  await fs.writeFile(prismaIndexPath, prismaIndexContent, "utf-8");
}
