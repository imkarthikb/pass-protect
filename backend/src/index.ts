import express, { Request, Response } from 'express';
import Multer from 'multer';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import FileModel from './models/file';
import { readFile } from 'fs';

dotenv.config();
const app = express();
const upload = Multer({
  dest: 'uploads',
});
mongoose.connect(process.env.DATABASE_URL || '');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));

app.use(express.urlencoded({ extended: true }));

app.get('/', (req: Request, res: Response) => {
  res.render('index');
});

app.post(
  '/upload',
  upload.single('file'),
  async (req: Request, res: Response) => {
    const fileData = {
      path: req.file?.path,
      originalName: req.file?.originalname,
      password: '',
    };
    if (req.body.password && req.body.password.trim().length > 0) {
      fileData.password = await bcrypt.hash(req.body.password, 10);
    }

    const file = await FileModel.create(fileData);
    res.render('index', { fileLink: `${req.headers.origin}/file/${file.id}` });
  }
);

const handleFileDownload = async (req: Request, res: Response) => {
  const file = await FileModel.findOne({ id: req.params.id });
  if (file) {
    if (file.password) {
      if (!req.body.password) {
        res.render('password');
        return;
      } else {
        if (!(await bcrypt.compare(req.body.password, file.password))) {
          res.render('password', { error: true });
          return;
        }
      }
    }

    file.downloadCount++;
    await file.save();
    res.download(file.path, file.originalName);
  } else {
    res.send('File does not exist');
  }
};

app.route('/file/:id').get(handleFileDownload).post(handleFileDownload);

app.listen(process.env.PORT, () => {
  console.log(`Listening on ${process.env.PORT}`);
});
