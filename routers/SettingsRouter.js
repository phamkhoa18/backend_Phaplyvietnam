const SettingsController = require('../controllers/SettingsController');
const Utils = require('../Utils');
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


router.post('/submitemail' , SettingsController.Submit_Emails);

router.post('/editsettings' , upload.single('image'), SettingsController.Edit_Settings);

router.get('/getsettings/:posision' ,SettingsController.Get_Settings) ;
// del
router.post('/delsettings' , SettingsController.Del_Settings);

router.get('/download/ly-lich-tu-phap' , SettingsController.Download) ;

router.get('/download/ho-chieu' , SettingsController.Download) ;

router.get('/api_nation' , SettingsController.get_nation);

router.get('/api_tp_vn' , SettingsController.get_tp_vn);

router.get('/api_currency' , SettingsController.get_Currency);

router.get('/api_skill' , SettingsController.getskill);

router.get('/pdf2', async (req, res) => {
  try {
    const fieldValues = {
      'ap.sex': 'true',
      'ap.dob': '30',
      'ap.birth': '180 cm',
    };
    await Utils.readPdfContent('80_unlocked', fieldValues);
    res.status(200).send('PDF content updated successfully');
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
module.exports = router ;