
import { Filter, User } from '../types';
import { dataUrlToFile } from '../utils/fileUtils';
import { uploadImageToStorage, saveShareMetadata } from './firebaseService';

/**
 * Shares an image using the best method available for the user's device.
 * - On mobile, uses the native Web Share API to share the image file directly.
 * - On desktop, uploads the image to Firebase Storage, creates a shareable link,
 *   and copies it to the clipboard.
 * @returns A promise that resolves to 'shared' or 'copied' on success.
 */
export const shareImage = async (
  base64ImageDataUrl: string,
  filter: Filter,
  user: User | null
): Promise<'shared' | 'copied'> => {
  const appUrl = window.location.origin;
  const shareText = `Check out this image I created with the '${filter.name}' filter on Genie! Create your own here: ${appUrl}`;
  const filename = `filtered-${filter.name.toLowerCase().replace(/\s/g, '-')}.png`;
  
  // Try native file sharing first (for mobile)
  const imageFile = await dataUrlToFile(base64ImageDataUrl, filename);
  if (imageFile && navigator.canShare && navigator.canShare({ files: [imageFile] })) {
    try {
      await navigator.share({
        files: [imageFile],
        title: filter.name,
        text: shareText,
      });
      return 'shared';
    } catch (error) {
      // User might have cancelled the share, so we don't throw an error
      console.log('Native share was cancelled or failed', error);
      // Fall through to the desktop method if native sharing fails for any reason
    }
  }

  // Fallback to desktop sharing (upload and copy link)
  if (!user) {
    throw new Error('You must be signed in to share images from a desktop browser.');
  }

  try {
    const imageUrl = await uploadImageToStorage(base64ImageDataUrl, user.uid);
    const shareMetadata = {
        imageUrl,
        userId: user.uid,
        username: user.email,
        filterId: filter.id,
        filterName: filter.name,
        createdAt: new Date().toISOString()
    };
    const savedShare = await saveShareMetadata(shareMetadata);
    
    const shareLink = `${appUrl}?share=${savedShare.id}`;
    
    await navigator.clipboard.writeText(shareLink);
    
    return 'copied';

  } catch (error) {
    console.error('Desktop share process failed:', error);
    if (error instanceof Error) {
        throw new Error(`Could not create share link: ${error.message}`);
    }
    throw new Error('An unknown error occurred while creating the share link.');
  }
};