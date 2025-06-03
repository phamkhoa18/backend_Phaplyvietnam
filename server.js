const express = require('express');
const mongoose = require('mongoose');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const dotenv = require('dotenv');
var bodyParser = require('body-parser');
const MenusRouter = require('./routers/MenusRouter');
const CategoriesRouter = require('./routers/CategoriesRouter');
const NewsRouter = require('./routers/NewsRouter');
const TypesRouter = require('./routers/TypesRouter');
const SlidersRouter = require('./routers/SlidersRouter');
const SettingsRouter = require('./routers/SettingsRouter');
const PartnersRouter = require('./routers/PartnersRouter');
const UsersRouter = require('./routers/UsersRouter');
const FormsRouter = require('./routers/FormsRouter');
const PdfsRouter = require('./routers/PdfsRouter');
const Utils = require('./Utils');

const app = express() ;
const PORT = 4000 || process.env.PORT ;

dotenv.config();
app.use(cors());
app.use(compression());
app.use(bodyParser.urlencoded({ limit : '50mb',extended: false }))
app.use(bodyParser.json({limit : '50mb'}));
app.use(morgan('common'));

const multer = require('multer');
const path = require('path'); // Thêm dòng này
const Util = require('./Utils');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/document' , express.static(path.join(__dirname, 'document')));
app.use('/output_pdf' , express.static(path.join(__dirname , 'output_pdf')));
app.use('/output_docx' , express.static(path.join(__dirname , 'output_docx')));

// CONNECT DATABASE 
mongoose.connect('mongodb://localhost:27017/PHAPLYVIETNAM').then(() => {
    console.log('Connect thành công');
}) 
.catch((err) => {
        console.log('Connect thất bại');
});

// router
app.use('/' , SettingsRouter);
app.use('/' , Util.validateRequest , PdfsRouter);
app.use('/' ,Utils.validateRequest , MenusRouter);
app.use('/' ,Utils.validateRequest , CategoriesRouter);
app.use('/' ,Utils.validateRequest , NewsRouter);
app.use('/' ,Utils.validateRequest, TypesRouter);
app.use('/' ,Utils.validateRequest, SlidersRouter);
app.use('/' ,Utils.validateRequest, PartnersRouter);
app.use('/' ,Utils.validateRequest, FormsRouter);
app.use('/' ,Utils.validateRequest, UsersRouter);

app.listen(PORT , () => {
    console.log('Server run Port : 4000');
})