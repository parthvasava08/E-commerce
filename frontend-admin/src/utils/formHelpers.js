export const MAX_IMAGE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_ACCEPT = ALLOWED_IMAGE_TYPES.join(",");

export const validateImage = (file) => {
  if (!file) return "";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" cannot be uploaded. Only JPG, PNG or WEBP images are allowed (videos and other files are not supported).`;
  }
  if (file.size === 0) {
    return `"${file.name}" is empty. Choose a different image.`;
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    const mb = (file.size / (1024 * 1024)).toFixed(1);
    return `"${file.name}" is ${mb} MB. The maximum is ${MAX_IMAGE_MB} MB, so choose a smaller image.`;
  }
  return "";
};

export const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error?.response) {
    return "Cannot reach the server. Check your connection and try again.";
  }
  const { status, data } = error.response;

  if (status >= 500 && status !== 502) {
    return "The server had a problem. Please try again in a moment.";
  }
  if (data?.message) return data.message;

  if (status === 401) return "Your session has expired. Please sign in again.";
  if (status === 403) return "You do not have permission to do this.";
  if (status === 404)
    return "That item could not be found. It may have been deleted.";
  if (status === 413) {
    return `The file is too large. The maximum is ${MAX_IMAGE_MB} MB per image.`;
  }
  if (status === 429)
    return "Too many requests. Please wait a moment and try again.";
  return fallback;
};
