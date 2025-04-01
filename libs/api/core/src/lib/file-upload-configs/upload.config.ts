import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

export const uploadConfig = {
  storage: diskStorage({
    destination: './tmp/uploads',
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const fileName = `${uuidv4()}${fileExt}`;
      cb(null, fileName);
    },
  }),
  fileFilter: (req: Request, file: any, cb) => {
    if (!file.originalname.match(/\.(xlsx|csv|xls)$/)) {
      return cb(new Error('Only Excel files are allowed!'), false);
    }
    cb(null, true);
  },
};
