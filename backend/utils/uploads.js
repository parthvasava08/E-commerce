import { cloudinary } from "../config/cloudinary.js";

const uploadedFiles = (req) => {
  const files = [];
  if (req.file) files.push(req.file);
  if (Array.isArray(req.files)) {
    files.push(...req.files);
  } else if (req.files && typeof req.files === "object") {
    for (const list of Object.values(req.files)) files.push(...list);
  }
  return files;
};

export const discardUploads = async (req) => {
  const ids = uploadedFiles(req)
    .map((file) => file.filename)
    .filter(Boolean);
  await Promise.allSettled(ids.map((id) => cloudinary.uploader.destroy(id)));
};

export const reject = async (req, res, status, message) => {
  await discardUploads(req);
  return res.status(status).json({ message });
};
