import { Client, Account, Databases, Storage, Functions, Avatars, Teams } from 'node-appwrite';
import { cookies } from 'next/headers';

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const appwriteApiKey = process.env.APPWRITE_API_KEY || '';

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  const session = (await cookies()).get(`a_session_${projectId}`);

  if (!session || !session.value) {
    throw new Error('No session found');
  }

  client.setSession(session.value);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get functions() {
      return new Functions(client);
    },
    get avatars() {
      return new Avatars(client);
    },
    get teams() {
      return new Teams(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(appwriteApiKey);

  return {
    get account() {
      return new Account(client);
    },
    get databases() {
      return new Databases(client);
    },
    get storage() {
      return new Storage(client);
    },
    get functions() {
      return new Functions(client);
    },
    get avatars() {
      return new Avatars(client);
    },
    get teams() {
      return new Teams(client);
    },
  };
}