
import { cert, initializeApp, getApps, getApp } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

// Simplified version of the logic in lib/firebase-admin.ts without 'server-only'

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  console.error("Error: Missing Firebase Admin credentials in environment variables.");
  console.error("Ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY are set.");
  process.exit(1);
}

function formatPrivateKey(key: string) {
  return key.replace(/\\n/g, "\n");
}

const appName = "cors-fix-script";
let app;

if (getApps().length > 0) {
    app = getApp();
} else {
    app = initializeApp({
        credential: cert({
            projectId,
            clientEmail,
            privateKey: formatPrivateKey(privateKey),
        }),
    }, appName);
}

const storage = getStorage(app);
const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`;
const bucket = storage.bucket(bucketName);

const corsConfiguration = [
  {
    origin: ["*"],
    method: ["GET", "HEAD", "PUT", "POST", "DELETE", "OPTIONS"],
    responseHeader: ["Content-Type", "Authorization", "Content-Length", "User-Agent", "x-goog-resumable"],
    maxAgeSeconds: 3600,
  },
];

async function setCors() {
  try {
    console.log(`Setting CORS for bucket: ${bucketName}...`);
    await bucket.setCorsConfiguration(corsConfiguration);
    console.log("CORS configuration updated successfully!");
    
    const [metadata] = await bucket.getMetadata();
    console.log("Current CORS config:", JSON.stringify(metadata.cors, null, 2));
    
  } catch (error) {
    console.error("Error setting CORS:", error);
    process.exit(1);
  }
}

setCors();
