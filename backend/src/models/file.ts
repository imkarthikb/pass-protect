import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const FileModel = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    default: () => uuidv4(),
  },
  path: {
    type: String,
    required: true,
  },
  originalName: {
    type: String,
    required: true,
  },
  password: String,
  downloadCount: { type: Number, required: true, default: 0 },
});

export default mongoose.model('File', FileModel);
