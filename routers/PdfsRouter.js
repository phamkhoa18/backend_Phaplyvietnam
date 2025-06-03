const PdfsController = require('../controllers/PdfsController');
const Util = require('../Utils');
const router = require('express').Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'document/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalname = file.originalname ;
    const extname = path.extname(file.originalname);
    cb(null, originalname + '-' + uniqueSuffix + extname);
  }
});

const upload = multer({ storage: storage });
// router (đường dẫn)

// THÊM 
router.post('/addpdf' , upload.fields([
  { name: 'pdfvi', maxCount: 1 },
  { name: 'pdfen', maxCount: 1 }
]) ,PdfsController.Add_Pdfs);


router.get('/listpdf', PdfsController.List_Pdfs);

router.get('/getpdf/:id' , PdfsController.getOne_Pdfs);

router.post('/editpdf' , upload.fields([
  { name: 'pdfvi', maxCount: 1 },
  { name: 'pdfen', maxCount: 1 }
])  ,  PdfsController.Edit_Pdfs);

router.get('/getpdfslug/:name' , PdfsController.getOne_Pdf_slug);

router.get('/delpdf/:id' , PdfsController.Del_Pdfs);
// edit 
// router.post('/edit_partner' ,  upload.single('background'), PartnersController.editPartner);
// // del
// router.post('/del_partner' , PartnersController.delPartner);



module.exports = router ;