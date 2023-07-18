const PartnersController = require('../controllers/PartnersController');
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
router.post('/addpartner' , upload.single('background'), PartnersController.Add_partner);

router.get('/getpartner/:id' , PartnersController.getOnePartner);

router.get('/listpartner' , PartnersController.List_partner);
// edit 
router.post('/edit_partner' ,  upload.single('background'), PartnersController.editPartner);
// del
router.post('/del_partner' , PartnersController.delPartner);

module.exports = router ;