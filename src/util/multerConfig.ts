import multer from "multer"
const storage = multer.memoryStorage()

// Add filters, and size limits

export const upload = multer({ storage: storage })