import { databases } from './client';
import { ID, Query } from 'appwrite';

// Database and collection IDs from environment variables
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';

// Collection IDs - these would be created in Appwrite console
const COLLECTIONS = {
  USERS: 'users',
  INVESTIGATIONS: 'investigations',
  FINDINGS: 'findings',
  SOURCES: 'sources',
  LEADS: 'leads',
};

// User-related functions
export const createUser = async (userId: string, data: any) => {
  return await databases.createDocument(
    databaseId,
    COLLECTIONS.USERS,
    ID.unique(),
    {
      user_id: userId,
      ...data,
    }
  );
};

export const getUserByAppwriteId = async (userId: string) => {
  try {
    const users = await databases.listDocuments(
      databaseId,
      COLLECTIONS.USERS,
      [Query.equal('user_id', userId)]
    );
    
    return users.documents[0] || null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (documentId: string, data: any) => {
  return await databases.updateDocument(
    databaseId,
    COLLECTIONS.USERS,
    documentId,
    data
  );
};