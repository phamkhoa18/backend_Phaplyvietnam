const SettingsController = require('../controllers/SettingsController');
const router = require('express').Router();
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extname = path.extname(file.originalname);
      cb(null, uniqueSuffix + extname);
    }
  });
  
  const upload = multer({ storage: storage });

// router (đường dẫn)
router.post('/addsettings' , upload.single('image'), SettingsController.Add_Settings);

router.post('/editsettings' , upload.single('image'), SettingsController.Edit_Settings);

router.get('/getsettings/:posision' ,SettingsController.Get_Settings) ;
// del
router.post('/delsettings' , SettingsController.Del_Settings);

router.get('/api_nation' , SettingsController.get_nation);
module.exports = router ;