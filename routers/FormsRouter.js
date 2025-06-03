const FormsController = require('../controllers/FormsController');
const Util = require('../Utils');
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

// THÊM 
router.post('/addform' , upload.array('images') ,FormsController.Add_Forms);

router.post('/add_pdf' , FormsController.Add_Pdf)

router.get('/listform' , FormsController.List_Forms);

router.get('/delform/:id' ,FormsController.Del_Forms);

router.post('/handleupdate' , FormsController.Handle_Update);

router.get('/soluongcanxuly' , FormsController.Xuly_contact);

// router.get('/sendemail' , Util.guiEmailChoBan);

router.post('/sendemail' , FormsController.Send_Mail);


module.exports = router ;