
/**
 * Utility to perform native media uploads to the ex_supabase backend.
 * This bypasses Supabase Storage and uses the native /supabase/media/upload endpoint.
 */

export const EX_SUPABASE_ENDPOINT = import.meta.env.VITE_EX_SUPABASE_API_URL || import.meta.env.VITE_EX_SUPABASE_ENDPOINT || "https://ex_supabase.jimatbiz.com";

interface NativeUploadResponse {
  data: {
    path: string;
    publicUrl: string;
  } | null;
  error: {
    message: string;
    code?: string;
  } | null;
}

/**
 * Uploads a file to the native backend.
 * 
 * @param file The file object to upload
 * @param folder The target folder (bucket replacement), e.g., 'promotion-images'
 * @param path Optional specific path/filename within the folder
 * @returns The public URL of the uploaded file
 */
export async function uploadToNativeBackend(
  file: File, 
  folder: string, 
  path?: string
): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);
  if (path) {
    formData.append('path', path);
  }

  try {
    const response = await fetch(`${EX_SUPABASE_ENDPOINT}/supabase/media/upload`, {
      method: 'POST',
      body: formData,
    });

    const result: NativeUploadResponse = await response.json();

    if (!response.ok || result.error) {
      throw new Error(result.error?.message || `Upload failed with status ${response.status}`);
    }

    if (!result.data?.publicUrl) {
      throw new Error('Upload succeeded but no public URL was returned');
    }

    return result.data.publicUrl;
  } catch (error) {
    console.error('Native upload error:', error);
    throw error;
  }
}
