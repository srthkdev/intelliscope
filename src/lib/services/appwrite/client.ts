import { Client, Account, Databases, Storage, Functions, Avatars, Teams } from 'appwrite';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

// Initialize the Appwrite client
export const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

// Initialize Appwrite services
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const functions = new Functions(client);
export const avatars = new Avatars(client);
export const teams = new Teams(client); 