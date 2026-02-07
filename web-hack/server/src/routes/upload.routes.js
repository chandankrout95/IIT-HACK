import express from "express";
import multer from "multer";
import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js"; // <-- use config

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/v1/upload
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).send("No file uploaded");

    const streamUpload = (reqFile) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "chat_images" },
          (error, result) => {
            if (error) {
              console.error("CLOUDINARY ERROR:", error);
              reject(error);
            } else resolve(result);
          }
        );
        streamifier.createReadStream(reqFile.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req.file);
    // console.log(result)
    res.json({ imageUrl: result.secure_url });
  } catch (err) {
    console.error("UPLOAD_ROUTE_ERROR:", err);
    res.status(500).send(err.message);
  }
});

export default router;
