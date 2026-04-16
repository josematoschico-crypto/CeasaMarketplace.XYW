
/**
 * Converts a File object to a Base64 string.
 * @param file The file to convert
 * @returns A promise that resolves to the Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Resizes an image to a maximum width/height while maintaining aspect ratio.
 * This helps keep Base64 strings small enough for Firestore.
 * @param base64 The original Base64 string
 * @param maxWidth Maximum width
 * @param maxHeight Maximum height
 * @returns A promise that resolves to the resized Base64 string
 */
export const resizeImage = (base64: string, maxWidth = 800, maxHeight = 600): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7)); // Use JPEG with 70% quality
    };
    img.onerror = (error) => reject(error);
  });
};

/**
 * Combined function to process a file: convert to Base64 and resize.
 */
export const processImageFile = async (file: File): Promise<string> => {
  const base64 = await fileToBase64(file);
  return await resizeImage(base64);
};
