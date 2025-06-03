const SlidersController = require('../controllers/SlidersController');
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



router.post('/addslider', upload.single('image'), SlidersController.Add_slider);
router.post('/editslider', SlidersController.Edit_slider);
router.post('/editsliderimage' ,upload.single('image') , SlidersController.Edit_slider_image);
router.get('/listslider', SlidersController.List_slider);
router.get('/listslider/:id' , SlidersController.get_one_slider);
router.get('/delslider/:id', SlidersController.Del_slider);
router.get('/oneslider/:position', SlidersController.One_slider);

module.exports = router;
