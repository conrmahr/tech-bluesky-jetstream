import "dotenv/config";

function checkEnvVars(requiredVars: string[]): boolean {
  for (const varName of requiredVars) {
    const value = process.env[varName];
    
    if (value === undefined || value.trim() === '') {
      console.error(`Missing or empty .env variable: ${varName}`);
      return false;
    }
  }
  
  return true;
}

const envVarsToCheck = ['BLUESKY_SERVER', 'FEED_NAME', 'KEYWORDS'];
const allVarsSet = checkEnvVars(envVarsToCheck);

if (!allVarsSet) {
  // Handle missing environment variables
  process.exit(1);
}

// Starts the firehose subscription
import "./stream.js";

// Starts the API server
import "./api.js";

// Starts the cron job
import "./cron.js";
