import { google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly', 'https://www.googleapis.com/auth/drive'];

// Note: Ensure GOOGLE_CLIENT_EMAIL and GOOGLE_PRIVATE_KEY (with \n replaced) are in .env
const auth = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL,
  undefined,
  process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  SCOPES
);

const drive = google.drive({ version: 'v3', auth });

/**
 * Extracts Google Drive ID from a URL or returns the string if it's already an ID
 */
export function extractFileId(input: string): string {
  if (!input) return '';
  // Match patterns for folders, files, and open?id=
  const folderMatch = input.match(/\/folders\/([a-zA-Z0-9-_]+)/);
  const fileMatch = input.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
  const idMatch = input.match(/[?&]id=([a-zA-Z0-9-_]+)/);
  
  if (folderMatch) return folderMatch[1];
  if (fileMatch) return fileMatch[1];
  if (idMatch) return idMatch[1];
  
  return input.trim(); // Assume it's an ID if no URL pattern matches
}

/**
 * Grant "Viewer" access to a Google Drive file/folder for a specific email
 * @param fileOrLink Google Drive File ID or full URL
 * @param email User's email address
 */
export async function grantDriveAccess(fileOrLink: string, email: string) {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.warn('[Drive] Missing credentials. Skipping access grant for:', email);
    return null;
  }

  const fileId = extractFileId(fileOrLink);
  if (!fileId) return null;

  try {
    const response = await drive.permissions.create({
      fileId: fileId,
      requestBody: {
        role: 'viewer',
        type: 'user',
        emailAddress: email,
      },
      sendNotificationEmail: true,
    });

    console.log(`[Drive] Granted access to ${email} for file ${fileId}`);
    return response.data;
  } catch (error) {
    console.error('[Drive Error] Failed to grant access:', error);
    throw error;
  }
}

/**
 * Get direct webViewLink for a file (useful for dashboard)
 */
export async function getDriveLink(fileId: string) {
  try {
    const file = await drive.files.get({
      fileId: fileId,
      fields: 'webViewLink',
    });
    return file.data.webViewLink;
  } catch (error) {
    console.error('[Drive Error] Failed to fetch link:', error);
    return `https://drive.google.com/file/d/${fileId}/view`;
  }
}
