const Categories = require("./models/Categories");
const multer = require('multer');
const fs = require('fs');
const Docxtemplater = require('docxtemplater');
const path = require('path');
const nodemailer = require('nodemailer');
const PizZip = require('pizzip');
const { v4: uuidv4 } = require('uuid');
const md5 = require('md5') ;
const {PDFDocument } = require('pdf-lib');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI("AIzaSyDik2HbmRsyn7IE-ve7CIHzmvru7yXDLwk");
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash", systemInstruction: "Không cần trả lời lịch sử, trả lời thẳng vấn đề "});
const openai = new OpenAI({apiKey : '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'});
const Anthropic  = require('@anthropic-ai/sdk');
const anthropic = new Anthropic({apiKey : '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'})
const mammoth = require("mammoth");
const cheerio = require('cheerio');
const { type } = require("os");
process.env.GOOGLE_GEMINI_API
const { Document, Packer, Paragraph, TextRun, AlignmentType } = require("docx");

const Util = {
    getChildCategories : async (categoryId) => {
       const categories = await Categories.find({ parent_id: categoryId });
       if (categories.length === 0) {
         return [];
       }
       const childIds = categories.map(category => category._id);
       const nestedChildren = await Promise.all(childIds.map(Util.getChildCategories));
       console.log(nestedChildren);
       return categories.concat(...nestedChildren);
     },
     slug :(title) => {
      var slug ;
      //Đổi chữ hoa thành chữ thường
      slug = title.toLowerCase();

      //Đổi ký tự có dấu thành không dấu
      slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
      slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
      slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
      slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
      slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
      slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
      slug = slug.replace(/đ/gi, 'd');
      //Xóa các ký tự đặt biệt
      slug = slug.replace(/\`|\~|\!|\@|\#|\||\$|\%|\^|\&|\*|\(|\)|\+|\=|\,|\.|\/|\?|\>|\<|'|\"|\:|\;|_/gi, '');
      //Đổi khoảng trắng thành ký tự gạch ngang
      slug = slug.replace(/ /gi, "-");
      //Đổi nhiều ký tự gạch ngang liên tiếp thành 1 ký tự gạch ngang
      //Phòng trường hợp người nhập vào quá nhiều ký tự trắng
      slug = slug.replace(/\-\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-\-/gi, '-');
      slug = slug.replace(/\-\-\-/gi, '-');
      slug = slug.replace(/\-\-/gi, '-');
      //Xóa các ký tự gạch ngang ở đầu và cuối
      slug = '@' + slug + '@';
      slug = slug.replace(/\@\-|\-\@|\@/gi, '');
      return slug ;
    },

     removeimage_uploads: (image_curren) => {
        const uploadDir = path.join(__dirname, 'uploads');
        
        const filePath = path.join(uploadDir, image_curren);
        fs.unlink(filePath, (error) => {
          if (error) {
            console.error(`Không thể xóa tệp tin ${image_curren}:`);
          } else {
            console.log(`Đã xóa tệp tin ${image_curren} thành công.`);
          }
        });
     },

     removepdf_document: (pdf_curren) => {
      fs.unlink(pdf_curren.path, (error) => {
        if (error) {
          console.error(`Không thể xóa tệp tin ${pdf_curren.path}:`);
        } else {
          console.log(`Đã xóa tệp tin ${pdf_curren.path} thành công.`);
        }
      });
     },

     // Hàm gửi email cho bạn
  async guiEmailChoBan(mailOptions) {
  // Cấu hình transporter (SMTP)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // Thay thế bằng SMTP server bạn sử dụng
    service : "Gmail" ,
    secure: true,
    auth: {
      user: 'thongtinkhachhangphaply@gmail.com', // Thay thế bằng email của bạn
      pass: 'qrsburtzvxoeykiw', // Thay thế bằng mật khẩu email của bạn
    },
  });
  // Gửi email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log('Email gửi đi: ' + info.response);
    }
  });
  } ,

  async runDevPdf(namePdf) {
      // Đọc nội dung từ tệp PDF có sẵn
      var pdfDoc = await PDFDocument.load(fs.readFileSync(namePdf));
      // Tạo một đối tượng PDFDocument từ nội dung đã đọc
      // Dữ liệu cần đặt cho từng trường
      var form = pdfDoc.getForm() ;
      form.getFields().forEach((field) =>{
        const type = field.constructor.name
        const name = field.getName()
        console.log(`${type}: ${name}`)
      })
      console.log(form);
  },

  async convertJSONToArray(jsonObject) {
    var value1 ;
    for (const key in jsonObject) {
        if (jsonObject.hasOwnProperty(key)) {
            const value = jsonObject[key];
            value1 = value ;
        }
    }

    return value1 ;
},

async convertJSONToArray1(jsonObject) {
  let result = [];
  for (const key in jsonObject) {
      if (jsonObject.hasOwnProperty(key)) {
          const value = jsonObject[key];
          if (Array.isArray(value) && value.length > 0) {
              result.push({ nameField: key, valueField: value[0] ? value[0].toString() : '' });
          } else if (value !== null && typeof value === 'object') {
              result.push({ nameField: key, valueField: JSON.stringify(value) });
          } else if (typeof value === 'string' || typeof value === 'number') {
              result.push({ nameField: key, valueField: await Util.xoaDauChuVaChuyenHoa(value.toString()) });
              
          } else {
              result.push({ nameField: key, valueField: '' });
          }
      }
  }
  console.log(result);
  return result;
},

 async xoaDauChuVaChuyenHoa(s) {
  // Xóa dấu
  let chuoiKhongDau = await s .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D");
  // Chuyển tất cả chữ cái thành chữ in hoa
  return chuoiKhongDau;
},

  async setDataPdf(form , arraydatanew) {
    var title = 'NoName'
    arraydatanew.forEach(async (fieldValue) => {
      const { nameField, valueField } = fieldValue;
      try {
          var formField = form.getField(nameField);
          if (formField) {
              // Kiểm tra nếu là trường checkbox
              if (fieldValue.valueField === 'on') {
                  formField.check(); // hoặc formField.uncheck() nếu muốn bỏ chọn
              } else {
                  if (nameField === 'duongdon') {
                      title = Util.xoaDauChuVaChuyenHoa(valueField);
                  }
                    formField.setText(valueField);
              }
          } else {
              console.warn(`Không tìm thấy trường có tên '${nameField}' trong PDF`);
          }
      } catch (error) {
          console.error(`Đã xảy ra lỗi khi cập nhật trường '${nameField}': ${error.message}`);
      }
  });

  return title ;
  },

  async readFdfContentPdfBig(filePath, fieldValues , information) {
    // console.log('filepath: ' + filePath ,'value: ' + fieldValues ,'form: ' +  information);
    
    try {    
        const  datajson = await Util.convertJSONToArray(fieldValues);
        const arraydatanew = await Util.convertJSONToArray1(datajson) ;
        // Đọc nội dung từ tệp PDF có sẵn
        var pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
        // Tạo một đối tượng PDFDocument từ nội dung đã đọc
        // Dữ liệu cần đặt cho từng trường
        var form = await pdfDoc.getForm();
        var title = await Util.setDataPdf(form , arraydatanew);        
        console.log('ARRAYDATANEW: ' + arraydatanew);
    } catch (error) {
        console.error(`Đã xảy ra lỗi: ${error.message}`);
    }

    const outputDir = 'output_pdf';
    const randomFileName =  title + ' - ' +  information.title + '(GPT)' + ' - ' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` +'.pdf';
    const filePath_out = path.join(outputDir, randomFileName);
    console.log(filePath_out);
    const pdfBytes = await pdfDoc.save() ;
    await fs.writeFileSync(filePath_out, pdfBytes);
    console.log('File created:', randomFileName);

    const mailOptions = {
      from: 'thongtinkhachhangphaply@gmail.com', // Điền email Gmail của bạn
      to: 'phamkhoatailieu@gmail.com, hotro@phaplyvietnam.com, hotro@trogiupphaply.com.au ', // Äiá»n Ä‘á»‹a chá»‰ email cá»§a khĂ¡ch hĂ ng
      subject: title + '- FORM ' + information.title + '(GPT)',
      text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM ',
      html: '<p>Thông tin khách hàng ở file</p>',
      attachments: [
        {
          filename: randomFileName,
          path: filePath_out,
        }
      ],
    };

    return mailOptions;
  },

  async readFdfContentUpdate(filePath, fieldValues, information) {  
    console.log(filePath);
    
    var title = 'KHONG TEN';
    let pdfDoc;
  
    try {
      // Đọc nội dung từ tệp PDF
      pdfDoc = await PDFDocument.load(fs.readFileSync(filePath.path));
    } catch (error) {
      console.error(`Lỗi khi đọc file PDF: ${error.message}`);
      return; // Dừng lại nếu không thể đọc PDF
    }
  
    try {
      // Lấy form từ PDF
      var form = pdfDoc.getForm();
  
      // Cập nhật giá trị cho từng trường
      fieldValues.forEach((fieldValue) => {
        const { nameField, valueField } = fieldValue;
  
        // Tìm trường trong PDF
        try {
          var formField = form.getField(nameField);
  
          if (formField) {
            // Kiểm tra checkbox
            if (valueField === 'on') {
              console.log(nameField);
              formField.check(); // Chọn checkbox
            } else {
              if (nameField === 'ap.name giv') {
                title = valueField;
              }
              formField.setText(valueField);
            }
          } else {
            console.warn(`Không tìm thấy trường '${nameField}' trong PDF.`);
          }
        } catch (err) {
          console.error(`Lỗi khi xử lý trường '${nameField}': ${err.message}`);
          // Vẫn tiếp tục vòng lặp nếu có lỗi trong một trường cụ thể
        }
      });
  
    } catch (error) {
      console.error(`Lỗi khi xử lý nội dung PDF: ${error.message}`);
      return; // Nếu lỗi nghiêm trọng khi xử lý form
    }
  
    try {
      const outputDir = 'output_pdf';
      const randomFileName = title + ' - ' +  information.title + ' - ' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` +'.pdf';
      const filePath_out = path.join(outputDir, randomFileName);
      
      // Lưu file PDF
      const pdfBytes = await pdfDoc.save();
      await fs.writeFileSync(filePath_out, pdfBytes);
      console.log('File created:', randomFileName);
  
      const mailOptions = {
        from: 'thongtinkhachhangphaply@gmail.com', // Điền email
        to: 'phamkhoatailieu@gmail.com, hotro@phaplyvietnam.com, hotro@trogiupphaply.com.au',
        subject: title + '- FORM ' + information.title,
        text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM ',
        html: '<p>Thông tin khách hàng ở file</p>',
        attachments: [
          {
            filename: randomFileName,
            path: filePath_out,
          }
        ],
      };
  
      const informationvalue = {
        title: title,
        posision: information.title,
        content: fieldValues
      };
  
      return { mailOptions, informationvalue };
  
    } catch (error) {
      console.error(`Lỗi khi lưu hoặc gửi file PDF: ${error.message}`);
      return; // Dừng lại nếu lỗi khi lưu file
    }
  },
  



  async readPdfContent(filePath, fieldValues) {
    try {
      const data = {
        title: fieldValues.title.toUpperCase(),
        attach : fieldValues.attach 
      };
  
     await JSON.parse(fieldValues.content).forEach((e) => {
        for (const key in e) {
          if (Array.isArray(e[key]) && (e[key].length === 0 || e[key].every((item) => item === null || item === ''))) {
            data[key] = '';
          } else if (e[key] === '' || e[key] === null) {
            data[key] = '';
          } else if (Array.isArray(e[key]) && e[key].length > 0) {
            data[key] = e[key];
          } else {
            data[key] = e[key];
          }
        }
      });

      console.log(data);
  
      // Đọc nội dung từ tệp PDF có sẵn
      var pdfDoc = await PDFDocument.load(fs.readFileSync(filePath));
      // Tạo một đối tượng PDFDocument từ nội dung đã đọc
      // Dữ liệu cần đặt cho từng trường
      var form = pdfDoc.getForm() ;
      console.log(filePath);
     if(filePath == 'form80.pdf') {
       // PAGE A
        // 1
        form.getField('ap.name fam').setText(data.fullname) ;
        this.getCheckSex(form,'ap.sex' , data.gender);
        form.getField('ap.dob').setText(data.date);
        form.getField('ap.birth suburb').setText(data.noisinh);
        form.getField('ap.birth town').setText(data.thanhphosinh);
        form.getField('ap.birth state').setText(data.khuvucsinh);
        form.getField('ap.birth cntry').setText(data.quocgia);
          // 2
        this.getCheckName(form,'ap.chinese' , data.masotq) ;
        form.getField('ap.ap.chinese code num').setText(data.sotq);
          // 3
        this.getCheckName(form,'ap.russian' , data.gocnga);
        form.getField('ap.russian name').setText(data.tengocnga);
          // 4
        this.getCheckName(form,'ap.known other name' , data.tenkhac);
        form.getField('ap.name type').setText(data.ndtenkhac.loaiten);
        form.getField('ap.name fam other').setText(data.ndtenkhac.tengd);
        form.getField('ap.name giv other').setText(data.ndtenkhac.tenrieng);
          // 5
        this.getCheckName(form,'ap.altbirth' , data.datekhac);
        form.getField('ap.alt dob').setText(this.toDateFormat(data.ngaydatekhac)) ;
          // 6
        this.getCheckName(form,'ap.citizen country' , data.quoctichkhac);
        if(data.quoctichkhac == 'no') {
          form.getField('ap.citizenship country dtl').setText(data.ndquoctich.noidung);
        } else if (data.quoctichkhac == 'yes') {
          form.getField('ap.gain citizenship').setText(data.ndquoctich.noidung);
          form.getField('ap.citgain date').setText(this.toDateFormat(data.ndquoctich.ngaycap));
        } 
          // 7
        this.getCheckName(form,'ap.oth country',data.giuquoctich) ;
        form.getField('ap.oth cntry').setText(data.cogiuqt.quocgiaqt);
        form.getField('ap.gain cit oth cntry').setText(data.cogiuqt.quyen);
        form.getField('ap.gain cit other from').setText(this.toDateFormat(data.cogiuqt.tu));
        form.getField('ap.gain cit other to').setText(this.toDateFormat(data.cogiuqt.den));
          // 8
        this.getCheckName(form,'ap.perm res rights',data.quyentt) ;
        form.getField('ap.perm res rights cntry').setText(data.quocgiatt);
          // 9
        this.getCheckName(form,'ap.curr passport',data.giaytohh);
        form.getField('ap.pass no').setText(data.ndgiaytohh.sohc) ;
        form.getField('ap.pass cntry').setText(data.ndgiaytohh.quocgiahc) ;
        form.getField('ap.pass doi').setText(this.toDateFormat(data.ndgiaytohh.ngayph)) ;
        form.getField('ap.pass doe').setText(this.toDateFormat(data.ndgiaytohh.ngayhh)) ;
        form.getField('ap.pass nationality').setText(data.ndgiaytohh.quoctich) ;
        form.getField('ap.pass place 1').setText(data.ndgiaytohh.noicap) ;
        form.getField('ap.pass name fam').setText(data.ndgiaytohh.tengd) ;
        form.getField('ap.pass name giv').setText(data.ndgiaytohh.tenrieng) ;
          // 10
        this.getCheckName(form,'ap.oth passport',data.giaytohhk);
        form.getField('ap.other pass no').setText(data.ndgiaytohhk.sohc) ;
        form.getField('ap.other pass cntry').setText(data.ndgiaytohhk.quocgiahc) ;
        form.getField('ap.other pass doi').setText(this.toDateFormat(data.ndgiaytohhk.ngayph)) ;
        form.getField('ap.other pass doe').setText(this.toDateFormat(data.ndgiaytohhk.ngayhh)) ;
        form.getField('ap.other national').setText(data.ndgiaytohhk.quoctich) ;
        form.getField('ap.other pass place').setText(data.ndgiaytohhk.noicap) ;
        form.getField('ap.othe pass name fam').setText(data.ndgiaytohhk.tengd) ;
        form.getField('ap.pass name giv').setText(data.ndgiaytohhk.tenrieng) ;
          // 11
        this.getCheckName(form,'ap.oth passport lost',data.hochieutruoc);
          // 12
        if(data.xayratl != '') {
            form.getCheckBox('ap.oth passport lost dtl' + data.xayratl).check() ;
        }
        form.getField('ap.othe pass lost dtl dtl').setText(data.cungcap);
          // 13
        this.getCheckName(form,'ap.lost passport',data.nhotl);
        form.getField('ap.lost pass no').setText(data.ndnhotl.sohc) ;
        form.getField('ap.lost pass cntry').setText(data.ndnhotl.quocgiahc) ;
        form.getField('ap.lsot pass doi').setText(this.toDateFormat(data.ndnhotl.ngayph)) ;
        form.getField('ap.lost pass doe').setText(this.toDateFormat(data.ndnhotl.ngayhh)) ;
        form.getField('ap.lost pass national').setText(data.ndnhotl.quoctich) ;
        form.getField('ap.lost pass place').setText(data.ndnhotl.noicap) ;
        form.getField('ap.lost pass name fam').setText(data.ndnhotl.tengd) ;
        form.getField('ap.lost pass name giv').setText(data.ndnhotl.tenrieng) ;
          // 14 
        this.getCheckName(form,'ap.nat id num',data.bsdantoc);
        this.getFieldArray(form,['ap.nat id num type' , 'ap.cntry issue' , 'ap.id num'],data.ndbsdantoc) ;
          // 15
        this.getCheckName(form,'ap.email',data.email);
        form.getField('ap.email primary').setText(data.ndemail.sd) ;
        form.getField('ap.email other').setText(data.ndemail.khac) ;
          // 16
        this.getCheckName(form,'ap.contact no',data.phone);
        form.getField('ap.work cc').setText(data.ndphone.cv.maqg) ;
        form.getField('ap.work ac').setText(data.ndphone.cv.mavung) ;
        form.getField('ap.work ph').setText(data.ndphone.cv.number) ;
        form.getField('ap.home cc').setText(data.ndphone.giadinh.maqg) ;
        form.getField('ap.home ac').setText(data.ndphone.giadinh.mavung) ;
        form.getField('ap.home ph').setText(data.ndphone.giadinh.number) ;
        form.getField('ap.mobile num').setText( data.ndphone.didong.number);
        form.getField('ap.oth num').setText( data.ndphone.khac.number);
          // 17 
        this.getFieldArray(form,['ap.addr fr','ap.addr to' ,'ap.address live' , 'ap.cntry lived'],data.lsdiachi);
          // 18
        this.getCheckName(form,'ap.visit oth country',data.dulich);
        this.getFieldArray(form,['ap.visit oth doa','ap.visit oth dod' ,'ap.visit oth country reason' , 'ap.visit oth country'],data.lsdiachi);
          // 19
        this.getFieldArray(form,['ap.emp fr' ,'ap.emp to' , 'ap.emp name', 'ap.emp bs' , 'ap.emp duties' , 'ap.emp add' , 'ap.emp cntry'] , data.ndvieclam)
          // 20 
        this.getFieldArrayCheckbox20(form , ['ap.qual fr' , 'ap.qual to' , 'ap.qual name' , 'ap.qual course' , ['ap.qualc' , 'ap.qualp' , 'ap.quale'] , 'ap.qual campus add' , 'ap.qual country'] , data.ndgiaoduc) ; 
          // 21
        this.getCheckName(form,'ap.in aus' , data.ouc);
          // 22
        form.getField('ap.reason for visit').setText(data.dulichuc) ;
          // 23
        this.getCheckName(form,'ap.travel dte' , data.datlichuc);
        form.getField('ap.prop doa').setText(this.toDateFormat(data.nddatlich.ngaytoi));
        form.getField('ap.prop flight num').setText(data.nddatlich.chitiettau);
        form.getField('ap.prop town').setText(data.nddatlich.thanhphoden);
        form.getField('ap.prop visit cntry').setText(data.nddatlich.quocgiaden);
        form.getField('ap.prop visit cities').setText(data.nddatlich.thitranghe);
          // 24
        this.getCheckName(form,'ap.temp visa' , data.xinthithuc);
        form.getField('ap.temp visa doa').setText(this.toDateFormat(data.ndxinthithuc.ngaytoi));
        form.getField('ap.temp visa flight num').setText(data.ndxinthithuc.chitiettau);
        form.getField('ap.temp visa town').setText(data.ndxinthithuc.thanhphoden);
        form.getField('ap.temp visit cities').setText(data.ndxinthithuc.quocgiaden);
          // 25
        form.getField('ap.reason for fs').setText(data.olaiuc);
          // 26
        form.getField('ap.fs cities').setText(data.thanhphoghe);
          // 27
        form.getField('ap.fs doa').setText(this.toDateFormat(data.nddenuc.ngaytoi));
        form.getField('ap.fs town').setText(data.nddenuc.thanhphoden);
          // 28
        this.getCheckName(form,'ap.fs temp visa',data.dangxinthithuc);
          // 29
        this.getCheckName(form,'ap.fs travel dte',data.dexuatuc);
        form.getField('ap.fs prop doa').setText(this.toDateFormat(data.nddexuat.ngaytoi)) ;
        form.getField('ap.fs prop flight num').setText(data.nddexuat.chitiettau) ;
        form.getField('ap.fs prop town').setText(data.nddexuat.thanhphoden) ;
        form.getField('ap.fs prop visit cntry').setText(data.nddexuat.quocgiaden) ;
          // 30
        this.getCheckName(form,'ap.inau' , data.hienouc);
          // 31
        this.getCheckName(form, 'ap.in aus add' , data.banuc);
        form.getField('ap.in aus add line 1').setText(data.ndbanuc.diachi) ;
        form.getField('ap.in aus add suburb').setText(data.ndbanuc.ngoaio) ;
        form.getField('ap.in aus add state').setText(data.ndbanuc.tieubang) ;
        form.getField('ap.in aus add pc').setText(data.ndbanuc.mabuudien) ;
        form.getField('ap.in aus ph 1').setText(data.ndbanuc.phone) ;
        form.getField('ap.in aus mob 1').setText(data.ndbanuc.phonecanhan) ;
          // 32
        this.getCheckName(form, 'ap.in aus oth add' , data.banuckhac);
        form.getField('ap.in aus oth add line 1').setText(data.ndbanuckhac.diachi) ;
        form.getField('ap.in aus oth add suburb').setText(data.ndbanuckhac.ngoaio) ;
        form.getField('ap.in aus oth add state').setText(data.ndbanuckhac.tieubang) ;
        form.getField('ap.in aus oth add pc').setText(data.ndbanuckhac.mabuudien) ;
        form.getField('ap.oth in aus ph 1').setText(data.ndbanuckhac.phone) ;
        form.getField('ap.oth in aus mob 1').setText(data.ndbanuckhac.phonecanhan) ;
          // 33
        this.getCheckName(form, 'ap.cur in aus add' , data.diachinuckhac);
        form.getField('ap.cur in aus add line 1').setText(data.nddiachinuckhac.diachi) ;
        form.getField('ap.cur in aus add suburb').setText(data.nddiachinuckhac.ngoaio) ;
        form.getField('ap.cur in aus add state').setText(data.nddiachinuckhac.tieubang) ;
        form.getField('ap.cur in aus add pc').setText(data.nddiachinuckhac.mabuudien) ;
        form.getField('ap.in aus ph 2').setText(data.nddiachinuckhac.phone) ;
        form.getField('ap.in aus mob 2').setText(data.nddiachinuckhac.phonecanhan) ;
        form.getField('ap.cur in aus add dtl').setText(data.nddiachinuckhac.cutrunao) ;
          // 34
        this.getCheckName(form, 'ap.inaus' , data.hienuc);
        this.getFieldArray(form , ['ap.in aus visa type' , 'ap.in aus reason' , 'ap.in aus noe' , 'ap.in aus poe' , 'ap.in aus visa doa'] , data.ndhienuc) ;
          // 35
        this.getCheckName(form , 'ap.prev in aus' , data.dauc) ;
        this.getFieldArray(form, ['ap.prev in aus visa type', 'ap.prev in aus reason', 'ap.prev in aus noe', 'ap.prev in aus poe' , 'ap.prev in aus visa doa' , 'ap.prev in aus visa dod' ] , data.nddauc );
          // 36
        // getCheckName() all 
        this.getCheckName(form , 'ap.ch offence' , data.nhanvat.buoctoi);
        this.getCheckName(form , 'ap.ch crime' , data.nhanvat.ketan);
        this.getCheckName(form , 'ap.ch charged dv' , data.nhanvat.buoctoigiadinh);
        this.getCheckName(form , 'ap.ch subject dv' , data.nhanvat.chudaogiadinh) ;
        this.getCheckName(form , 'ap.ch interpol' , data.nhanvat.interpol);
        this.getCheckName(form , 'ap.ch sex offence' , data.nhanvat.toiphamtinhduc);
        this.getCheckName(form , 'ap.ch sex reg' , data.nhanvat.tentinhduc);
        this.getCheckName(form , 'ap.ch acq' , data.nhanvat.ketanbatcong) ;
        this.getCheckName(form , 'ap.ch left' , data.nhanvat.tucach) ;
        this.getCheckName(form , 'ap.ch sec' , data.nhanvat.giantiep) ;
        this.getCheckName(form , 'ap.ch war' , data.nhanvat.truyto) ;
        this.getCheckName(form , 'ap.ch crim org' , data.nhanvat.tochucvipham) ;
        this.getCheckName(form , 'ap.ch violent org' , data.nhanvat.tochucbaoluc) ;
        this.getCheckName(form , 'ap.ch mil' , data.nhanvat.chatno) ;
        this.getCheckName(form , 'ap.ch train' , data.nhanvat.phucvucanhsat) ;
        this.getCheckName(form , 'ap.ch smug' , data.nhanvat.buonnguoi) ;
        this.getCheckName(form , 'ap.ch dep' , data.nhanvat.trucxuat) ;
        this.getCheckName(form , 'ap.ch overstay' , data.nhanvat.quahan) ;
        this.getCheckName(form , 'ap.ch debt' , data.nhanvat.notondong) ;
        form.getField('ap.ch dtl').setText(data.nhanvat.noidung) ;
          // 37 
        this.getCheckName(form , 'ap.ms' , data.quansu) ;
        form.getField('ap.ms no reason').setText(data.koquansu) ;
        this.getFieldArray(form,['ap.ms fr' , 'ap.ms to' , 'ap.ms country' , 'ap.ms name' , 'ap.ms rank' , 'ap.ms duties' , 'ap.ms country dev'] , data.ndquansu);
          // 38
        this.getCheckName(form , 'ap.intel agent' , data.tuyendung);
        form.getField('ap.intel agent dtl').setText(data.ndtuyendung) ;
          // 39
        this.getCheckName(form , 'ap.ref visa' , data.visa) ;
        form.getField('ap.ref visa dtl').setText(data.ndvisa) ;
          // 40 
        this.getCheckName(form , 'ap.deport' , data.trucxuat) ;
        form.getField('ap.deport dtl').setText(data.ndtrucxuat) ;
          // 41
        this.getCheckName(form , 'ap.ref citizen' , data.capquoctich);
        form.getField('ap.ref citizen dtl').setText(data.ndcapquoctich);
          // 42
        this.getCheckName(form , 'ap.partner' , data.bandoi) ;
        form.getField('as.rel to you').setText(data.ndbandoi[0].mqh) ;
        form.getField('as.name fam').setText(data.ndbandoi[0].tengd) ;
        form.getField('as.name giv').setText(data.ndbandoi[0].tenrieng) ;
        form.getField('as.name oth').setText(data.ndbandoi[0].tenkhac) ;
        form.getField('as.sex').setText(data.ndbandoi[0].gioitinh) ;
        form.getField('as.dob').setText(data.ndbandoi[0].ngaysinh) ;
        form.getField('as.chinese code').setText(data.ndbandoi[0].matq) ;
        form.getField('as.birth town').setText(data.ndbandoi[0].noisinh.tp) ;
        form.getField('as.birth state').setText(data.ndbandoi[0].noisinh.kv) ;
        form.getField('as.birth cntry').setText(data.ndbandoi[0].noisinh.qg) ;
        form.getField('as.cit ctry yr grant').setText(data.ndbandoi[0].namcap) ;
        form.getField('as.cor').setText(data.ndbandoi[0].dangcutru) ;
        this.getCheckName(form , 'as.migrating' , data.ndbandoi[0].dicu);
          // 43
        this.getCheckName(form , 'ap.children' , data.concai) ;
        this.getFieldArrayCheckbox(form , ['m.rel to you' , 'm.name fam' , 'm.name giv' , 'm.name oth' , 'm.sex' , 'm.dob' , 'm.chinese code' ,
        ['m.birth town' , 'm.birth state' , 'm.birth cntry'] , 'm.cit ctry yr grant' , 'm.cor' , ['m.migrating_1' , 'm.migrating_2' ]] , data.ndconcai)
          // 44
        this.getCheckName(form , 'ap.parents' , data.chame);
        this.getFieldArrayCheckbox(form , ['pt.rel to you' , 'pt.name fam' , 'pt.name giv' , 'pt.name oth' , 'pt.sex' , 'pt.dob' , 'pt.chinese code' ,
        ['pt.birth town' , 'pt.birth state' , 'pt.birth cntry'] , 'pt.cit ctry yr grant' , 'pt.cor' , ['pt.migrating_1' , 'pt.migrating_2']] , data.ndchame) 
          // 45
        this.getCheckName(form , 'ap.siblings' , data.anhem);
        this.getFieldArrayCheckbox(form , ['fm.rel to you' , 'fm.name fam' , 'fm.name giv' , 'fm.name oth' , 'fm.sex' , 'fm.dob' , 'fm.chinese code' ,
        ['fm.birth town' , 'fm.birth state' , 'fm.birth cntry'] , 'fm.cit ctry yr grant' , 'fm.cor' , ['fm.migrating_1' , 'fm.migrating_2']] , data.ndchame) 
          // 46
        this.getCheckName(form , 'ap.familly member', data.thanhvien) ;
        this.getFieldArrayCheckbox(form , ['fm.reltoyou' , 'fm.namefam' , 'fm.namegiv' , 'fm.nameoth' , 'fm.sex' , 'fm.dob' , 'fm.chinesecode' , 
        ['fm.birthtown' , 'fm.birthstate' , 'fm.birthcntry'] ,'fm.citctryyrgrant' , 'fm.cor' , 'fm.s' ] , data.ndthanhvien) 
          // 47
        this.getCheckName(form, 'ap.contact aus' , data.mqhlienhe);
        form.getField('ap.contact aus name fam 1').setText(data.ndmqhlienhe.tengd) ;
        form.getField('ap.contact aus name giv 1').setText(data.ndmqhlienhe.tenrieng) ;
        this.getCheckName(form , 'ap.contact aus sex' , data.ndmqhlienhe.gioitinh);
        form.getField('ap.contact relation 1').setText(data.ndmqhlienhe.mqh) ;
        form.getField('ap.contact aus dob 1').setText(data.ndmqhlienhe.ngaysinh) ;
        form.getField('ap.contact birth town 1').setText(data.ndmqhlienhe.tp) ;
        form.getField('ap.contact birth state 1').setText(data.ndmqhlienhe.khuvuc) ;
        form.getField('ap.contact birth cntry 1').setText(data.ndmqhlienhe.quocgia) ;
        form.getField('ap.contact nationality 1').setText(data.ndmqhlienhe.quoctich) ;
        form.getField('ap.contact add line 1').setText(data.ndmqhlienhe.diachi) ;
        form.getField('ap.contact add suburb 1').setText(data.ndmqhlienhe.ngoaio) ;
        form.getField('ap.contact add state 1').setText(data.ndmqhlienhe.tieubang) ;
        form.getField('ap.contact add pc 1').setText(data.ndmqhlienhe.mabuudien) ;
        form.getField('ap.contact ph 1').setText(data.ndmqhlienhe.sdt_cv) ;
        form.getField('ap.contact mob 1').setText(data.ndmqhlienhe.sdt_canhan) ;
        form.getField('ap.contact email 1').setText(data.ndmqhlienhe.email) ;
          // 48
        this.getCheckName(form, 'ap.oth contact aus' , data.mqhlienhekhac);
        form.getField('ap.contact aus name fam 2').setText(data.ndmqhlienhekhac.tengd) ;
        form.getField('ap.contact aus name giv 2').setText(data.ndmqhlienhekhac.tenrieng) ;
        this.getCheckName(form , 'ap.contact aussex' , data.ndmqhlienhekhac.gioitinh);
        form.getField('ap.contact relation 2').setText(data.ndmqhlienhekhac.mqh) ;
        form.getField('ap.contact aus dob 2').setText(data.ndmqhlienhekhac.ngaysinh) ;
        form.getField('ap.contact birth town 2').setText(data.ndmqhlienhekhac.tp) ;
        form.getField('ap.contact birth state 2').setText(data.ndmqhlienhekhac.khuvuc) ;
        form.getField('ap.contact birth cntry 2').setText(data.ndmqhlienhekhac.quocgia) ;
        form.getField('ap.contact nationality 2').setText(data.ndmqhlienhekhac.quoctich) ;
        form.getField('ap.oth contact add line 1').setText(data.ndmqhlienhekhac.diachi) ;
        form.getField('ap.contact add suburb 2').setText(data.ndmqhlienhekhac.ngoaio) ;
        form.getField('ap.contact add state 2').setText(data.ndmqhlienhekhac.tieubang) ;
        form.getField('ap.contact add pc 2').setText(data.ndmqhlienhekhac.mabuudien) ;
        form.getField('ap.contact ph 2').setText(data.ndmqhlienhekhac.sdt_cv) ;
        form.getField('ap.contact mob 2').setText(data.ndmqhlienhekhac.sdt_canhan) ;
        form.getField('ap.contact email 2').setText(data.ndmqhlienhekhac.email) ;
          // 49
        this.getCheckName(form , 'ap.sponsor' , data.lienket) ;
        form.getField('sp.bus name').setText(data.ndlienket.tendn) ;
        form.getField('ap.bus dtl').setText(data.ndlienket.motadn) ;
        form.getField('sp.add line 1').setText(data.ndlienket.diachi) ;
        form.getField('sp.suburb 1').setText(data.ndlienket.ngoaio) ;
        form.getField('sp.add state 1').setText(data.ndlienket.tieubang) ;
        form.getField('sp.add pc 1').setText(data.ndlienket.mabuudien) ;
        form.getField('sp.contact bus name').setText(data.ndlienket.tenlh) ;
          // 50
        this.getCheckName(form , 'sp.oth add' , data.laodong) ;
        form.getField('sp.oth add type').setText(data.ndlaodong.tendn) ;
        form.getField('sp.oth add line 1').setText(data.ndlaodong.diachi) ;
        form.getField('sp.suburb 2').setText(data.ndlaodong.ngoaio) ;
        form.getField('sp.add state 2').setText(data.ndlaodong.tieubang) ;
        form.getField('sp.add pc 2').setText(data.ndlaodong.mabuudien) ;
          // 51
        this.getCheckName(form , 'sp.email' , data.laodongemail);
        form.getField('sp.email dtl').setText(data.ndlaodongemail) ;
          // 52
        this.getCheckName(form , 'sp.ph no' , data.laodongsdt);
        form.getField('sp.ph no dtl').setText(data.ndlaodongsdt) ;
          // 53
        form.getField('ap.dec').setText(data.date_ngay_now.toString() + '/' + data.date_thang_now.toString() + '/' + data.date_nam_now);
          // 54
        this.getFieldArray(form , ['ap.ad q' , 'ap.ad info'] , data.thongtinthem) ;
        if(data.sign != '') {
          const imageData = data.sign.replace(/^data:image\/\w+;base64,/, '');
  
          // Đặt đường dẫn và tên tệp ảnh
          const imageFileName = 'sign - ' + data.fullname + '-' + uuidv4() + '.png' ;
          const imagePath = path.join('uploads', imageFileName);
  
          // Lưu ảnh vào tệp
          fs.writeFileSync(imagePath, imageData, 'base64');
  
          // Thêm tệp ảnh vào danh sách attachments
          data.attach.push(imageFileName); 
        }
     }

     if(filePath == 'form47a.pdf') {

         // PAGE A
        // 1
      form.getField('ap.name fam').setText(data.fullname) ;
        // 2
      form.getField('ap.dob').setText(data.date);
        // 3
      form.getField('ap.file number').setText(data.numberhoso);
        // 4
      form.getField('fm.name fam').setText(data.tengd);
      form.getField('fm.name giv').setText(data.tenrieng);
        // 5
      form.getField('fm.name givname').setText(data.tenthanhvien);
        // 6
      form.getField('fm.name other fam').setText(data.tengd2);
      form.getField('fm.name other giv').setText(data.tenrieng2);
        // 7
      form.getField('fm.name alias').setText(data.tenkhacgd);
        // 8
      this.getCheckSex(form,'fm.sex' , data.gender) ;
        // 9
      form.getField('fm.dob').setText(data.datefamily);
      form.getField('fm.age').setText(data.dateage);
        // 10
      form.getField('fm.birth town').setText(data.noisinhtp);
      form.getField('fm.birth cntry').setText(data.noisinhqg);
        // 11
      form.getField('fm.cit cntry').setText(data.donvinuoc);
        // 12
      form.getField('fm.resi').setText(data.cutru);
        // 13
      form.getField('fm.pass no').setText(data.ndthongtinhochieu.shc);
      form.getField('fm.pass cntry').setText(data.ndthongtinhochieu.hcqg);
      form.getField('fm.pass doi').setText(data.ndthongtinhochieu.ph);
      form.getField('fm.pass doe').setText(data.ndthongtinhochieu.hh);
      form.getField('fm.pass place 1').setText(data.ndthongtinhochieu.coquancap);
        // 14
      form.getField('fm.id no').setText(data.ndcmnd.shc);
      form.getField('fm.id no cntry').setText(data.ndcmnd.hcqg);
        // 15
      this.getCheckName(form , 'fm.id' , data.sonhandang)
      this.getFieldArray(form , ['fm.id cntry' , 'fm.id type' , 'fm.id no'] , data.ndsonhandang) 
        // 16
      if(data.mqh == 'chuakh') {
          form.getField('m.marital nev').check() ;
      } else if (data.mqh == 'goa') {
          form.getField('m.marital wid').check() ;
      }else if (data.mqh == 'dalyhon') {
          form.getField('m.marital div').check() ;
      }else if (data.mqh == 'lythan') {
          form.getField('m.marital sep').check() ;
      }else if (data.mqh == 'dinhhon') {
          form.getField('m.marital eng').check() ;
          form.getField('m.as name 1').setText(data.ndmqhckh.name);
          form.getField('m.mar dom 1').setText(data.ndmqhckh.date);
      }else if (data.mqh == 'dakethon') {
          form.getField('m.marital mar def').check() ;
          form.getField('m.as name 2').setText(data.ndmqhdkh.name);
          form.getField('m.marital dom 2').setText(data.ndmqhdkh.date);
      }
        // 17
      this.getCheckName(form , 'm.resi ap', data.songdiachi);
      form.getField('m.resi str').setText(data.ndsongdiachi.dc1);
      form.getField('m.resi sub').setText(data.ndsongdiachi.dc2);
      form.getField('m.resi cntry').setText(data.ndsongdiachi.dc3);
      form.getField('m.resi hap').setText(data.ndsongdiachi.mbc3);
        // 18
      form.getField('m.office cc').setText(data.ndphone.ghc.maquocgia);
      form.getField('m.office ac').setText(data.ndphone.ghc.mavung);
      form.getField('m.office pn').setText(data.ndphone.ghc.sodt);
      form.getField('m.after cc').setText(data.ndphone.saugiolam.maquocgia);
      form.getField('m.after ac').setText(data.ndphone.saugiolam.mavung);
      form.getField('m.after pn').setText(data.ndphone.saugiolam.sodt);
      form.getField('m.mobile pn').setText(data.ndphone.sdtcanhan.sodt);
        // 19
      this.getCheckName(form , 'm.mig ap' , data.xinthithuc);
      form.getField('m.mig dtl').setText(data.ndxinthithuck);
      if(data.ndxinthithucc == 'Australian Capital Territory') {
          form.getField('m.live1').check() ;
      } else if (data.ndxinthithucc == 'New South Wales') {
          form.getField('m.live2').check() ;
      }else if (data.ndxinthithucc == 'Northern Territory') {
          form.getField('m.live3').check() ;
      }else if (data.ndxinthithucc == 'Queensland') {
          form.getField('m.live4').check() ;
      }else if (data.ndxinthithucc == 'South Australia') {
          form.getField('m.live5').check() ;
      }else if (data.ndxinthithucc == 'Tasmania ') {
          form.getField('m.live6').check() ;
      }else if (data.ndxinthithucc == 'Victoria') {
          form.getField('m.live7').check() ;
      }else if (data.ndxinthithucc == 'Western Australia') {
          form.getField('m.live8').check() ;
      }else if (data.ndxinthithucc == 'External Territory') {
          form.getField('m.live9').check() ;
      }else if (data.ndxinthithucc == 'Don’t know') {
          form.getField('m.live10').check() ;
      }
        // 20
      form.getField('m.lang').setText(data.ngonnguchinh);
        // 21
      if(data.giaotieptienganh == 'Better than functional') {
          form.getField('m.engl1').check() ;
      } else if (data.giaotieptienganh == 'Limited') {
          form.getField('m.engl2').check() ;
      }else if (data.giaotieptienganh == 'Functional') {
          form.getField('m.engl3').check() ;
      }else if (data.giaotieptienganh == 'Not at all') {
          form.getField('m.engl4').check() ;
      }
        // 22
      form.getField('m.oth lang').setText(data.ngonngutroichay);
        // 23
      this.getFieldArray(form, ['m.edu name' , 'm.edu loc' , 'm.edu type' , 'm.edu comm' , 'm.edu comp' , 'm.edu qual' , 'm.edu lang'] , data.ndtrinhdo);
        // 24
      this.getFieldArray(form, ['m.emp fr' , 'm.emp to' , 'm.emp name' , 'm.emp bs' , 'm.emp ocp' , '' , ''] , data.ndvieclam)
        // 25
      this.getCheckName(form,'m.emp' , data.danglamviec);
      form.getField('m.emp dtl').setText(data.nddanglamvieck);
      form.getField('m.emp name').setText(data.nddanglamviecc.tencq);
      form.getField('m.emp str').setText(data.nddanglamviecc.vitri);
      form.getField('m.emp sub').setText(data.nddanglamviecc.loai);
      form.getField('m.emp pc').setText(data.nddanglamviecc.ngaybd);
      form.getField('m.emp fr').setText(data.nddanglamviecc.ngaykt);
      form.getField('m.emp w lc').setText(data.nddanglamviecc.trinhdo);
      form.getField('m.emp h/w').setText(data.nddanglamviecc.ngonngutochuc);
        // 26
      form.getField('m.fin name').setText(data.nddanglamvieck.name);
      form.getField('m.fin str').setText(data.nddanglamviecc.diachi1);
      form.getField('m.fin sub').setText(data.nddanglamviecc.diachi2);
      form.getField('m.fin town').setText(data.nddanglamviecc.diachi3);
      form.getField('m.fin hap').setText(data.nddanglamviecc.mabuudien);
      form.getField('m.fin type').setText(data.nddanglamviecc.loai);
      form.getField('m.fin lc').setText(data.nddanglamviecc.cungcap);
      form.getField('m.fin dtl').setText(data.nddanglamviecc.tiendung);
      form.getField('m.fin fr').setText(data.nddanglamviecc.tu);
      form.getField('m.fin to').setText(data.nddanglamviecc.den);
      form.getField('m.fin oth dtl').setText(data.nddanglamviecc.khac);
         // 27
      this.getFieldArray(form, ['fm.par name' , 'fm.par sex' , 'fm.par dob' , 'fm.par marital' , 'fm.par resi' , 'fm.par stat' , ''] , data.ndchame);
      this.getFieldArray(form, ['fm.sib name' , 'fm.sib sex' , 'fm.sib dob' , 'fm.sib marital' , 'fm.sib resi' , 'fm.sib stat' , ''] , data.ndanhchi);
      this.getFieldArray(form, ['fm.dep name' , 'fm.dep sex' , 'fm.dep dob' , 'fm.dep marital' , 'fm.dep resi' , 'fm.dep stat' , ''] , data.ndconcai);
        // 28
      this.getFieldArray(form, ['m.resi fr' , 'm.resi to' , 'm.resi cntry' , 'm.resi str' , 'm.resi sub' , 'm.resi state' , 'm.resi hap'] , data.nddiachi);
        // 29
      this.getFieldArray(form , ['ap.ad q' , 'ap.ad info'] , data.thongtinthem) ;
        // 30
      form.getField('ap.avs dec').setText(data.date_ngay_now.toString() + '/' + data.date_thang_now.toString() + '/' + data.date_nam_now);
      form.getField('ap.dec 1').setText(data.date_ngay_now.toString() + '/' + data.date_thang_now.toString() + '/' + data.date_nam_now);
      form.getField('ap.dec 2').setText(data.date_ngay_now.toString() + '/' + data.date_thang_now.toString() + '/' + data.date_nam_now);
      form.getField('ap.dec 3').setText(data.date_ngay_now.toString() + '/' + data.date_thang_now.toString() + '/' + data.date_nam_now);
        // 54
        const signVariables = [ data.sign,data.sign1, data.sign2, data.sign3];

        for (let i = 0; i < signVariables.length; i++) {
          const signData = signVariables[i];
          
          if (signData != '') {
            const imageData = signData.replace(/^data:image\/\w+;base64,/, '');
        
            // Đặt đường dẫn và tên tệp ảnh
            const imageFileName = `sign${i + 1} - ${data.fullname} - ${uuidv4()}.png`;
            const imagePath = path.join('uploads', imageFileName);
        
            // Lưu ảnh vào tệp
            fs.writeFileSync(imagePath, imageData, 'base64');
        
            // Thêm tệp ảnh vào danh sách attachments
            data.attach.push(imageFileName);
          }
        }
     }
      const outputDir = 'output_pdf';
      // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    const randomFileName = data.title + ' - ' + data.fullname + ' - ' + uuidv4() + '.pdf';
    const filePath_out = path.join(outputDir, randomFileName);
  
    const pdfBytes = await pdfDoc.save() ;
    await fs.writeFileSync(filePath_out, pdfBytes);
    console.log('File created:', randomFileName);

    // Gửi thông tin đó vào gmail 

    const mailOptions = {
      from: 'thongtinkhachhangphaply@gmail.com', // Điền email Gmail của bạn
      to: 'phamkhoatailieu@gmail.com, phamdangkhoavipvip@gmail.com ', // Điền địa chỉ email của khách hàng
      subject: data.title + ' - ' + data.fullname + ' - ' + data.date,
      text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM ',
      html: '<p>Thông tin khách hàng ở file Docx </p>',
      attachments: [
        {
          filename: randomFileName,
          path: filePath_out,
        },
        ...data.attach.map(filename => ({
          filename: filename,
          path: path.join('uploads', filename), // Đường dẫn đến thư mục chứa hình ảnh
        }))
      ],
    };


    return mailOptions ;


    } catch (error) {
      console.error('Lỗi khi chèn dữ liệu vào file PDF:', error);
    }
},
  getCheckName(form , nameField , valueField){
        if(valueField == 'no') {
          form.getField(nameField + '1').check() ;
        } else if (valueField == 'yes') {
          form.getField(nameField + '2').check() ;
        } else {
          form.getField(nameField+'1').uncheck() ;
          form.getField(nameField+'2').uncheck() ;
        }
  },

  getCheckSex(form , nameField , valueField) {
    if(valueField == 'male') {
      form.getField(nameField + '1').check() ;
      form.getField(nameField + '2').uncheck() ;
    } else if (valueField == 'female') {
      form.getField(nameField + '2').check() ;
      form.getField(nameField + '1').uncheck() ;
    } else if(valueField == 'unspecified') {
      form.getField(nameField + '1').uncheck() ;
      form.getField(nameField + '2').uncheck() ;
      form.getField(nameField + '3').check() ;
    }
    else {
      form.getField(nameField+'1').uncheck() ;
      form.getField(nameField+'2').uncheck() ;
      form.getField(nameField+'3').uncheck() ;
    }
  },

  getFieldArray(form , nameFieldArray , valueFieldArray ) {
      var S = 1 ;
      for (let i = 0; i < valueFieldArray.length ; i++) {
          for (let o = 0; o < nameFieldArray.length; o ++) {
             try {
              if(form.getField(nameFieldArray[o].toString() + ' ' + S.toString())) {
                form.getField(nameFieldArray[o].toString() + ' ' + S.toString()).setText(Object.values(valueFieldArray[i])[o]);
              }
             } catch (error) {
                console.log('error');
             }
          }
          S = S + 1 ;
      }
  },

  getFieldArrayCheckbox20(form , nameFieldArray , valueFieldArray ) {
    var S = 1 ;
    for (let i = 0; i < valueFieldArray.length ; i++) {
        for (let o = 0; o < nameFieldArray.length; o ++) {
          try {
            // String
            if(typeof nameFieldArray[o] == 'string') {
              var field = form.getField(nameFieldArray[o].toString() + ' ' + S.toString()) ;
              if(field) {
                field.setText(Object.values(valueFieldArray[i])[o]);
              } 
            }
            // Checkbox
            if(Array.isArray(nameFieldArray[o]) && nameFieldArray[o].length == 3 ) {
                  // checkbox array 
                  nameFieldArray[o].forEach(( e , k ) => {
                      try {
                        var fieldCheckbox  = form.getCheckBox(e.toString() + ' ' + S.toString())  ;
                        if(Object.values(valueFieldArray[i])[o] == 'hoan' && k == 0) {
                          fieldCheckbox.check() ;
                        }else if(Object.values(valueFieldArray[i])[o] == 'rut' && k == 1) {
                          fieldCheckbox.check() ;
                        } else if (Object.values(valueFieldArray[i])[o] == 'dang' && k == 2) {
                          fieldCheckbox.check() ;
                        } else {
                          fieldCheckbox.uncheck() ;
                        }
                      } catch (error) {
                          console.log('Error arrayCheckbox');
                      }
                  })
            } 
          } catch (error) {
              console.log('error');
          }
        }
        S = S + 1 ;
    }
  },

  getFieldArrayCheckbox(form , nameFieldArray , valueFieldArray ) {
      var S = 1 ;
      for (let i = 0; i < valueFieldArray.length ; i++) {
          for (let o = 0; o < nameFieldArray.length; o ++) {
            try {
              // String
              if(typeof nameFieldArray[o] == 'string') {
                var field = form.getField(nameFieldArray[o].toString() + ' ' + S.toString()) ;
                if(field) {
                  field.setText(Object.values(valueFieldArray[i])[o]);
                } 
              }
              // Checkbox
              if(Array.isArray(nameFieldArray[o]) && nameFieldArray[o].length == 2 ) {
                    // checkbox array 
                    nameFieldArray[o].forEach(( e , k ) => {
                        try {
                          var fieldCheckbox  = form.getCheckBox(e.toString() + ' ' + S.toString())  ;
                          if(Object.values(valueFieldArray[i])[o] == 'no' && k == 0) {
                            fieldCheckbox.check() ;
                          }else if(Object.values(valueFieldArray[i])[o] == 'yes' && k == 1) {
                            fieldCheckbox.check() ;
                          } else {
                            fieldCheckbox.uncheck() ;
                          }
                        } catch (error) {
                            console.log('Error arrayCheckbox');
                        }
                    })
              } 
              // Birth 
              if(Array.isArray(nameFieldArray[o]) && nameFieldArray[o].length == 3) {
                  try {
                    const birthValues = Object.values(valueFieldArray[i]) ;
                  nameFieldArray[o].forEach((b , ar) => {
                    const birthField = form.getField(b.toString() + ' ' + S.toString()) ;
                    if(birthField) {
                      birthField.setText(birthValues[ar].toString());
                    } 
                  })
                  } catch (error) {
                      console.log('error Birth');
                  }
              }
            } catch (error) {
                console.log('error');
            }
          }
          S = S + 1 ;
      }
  },
  async readDocxContent(filePath , data ) {
    console.log(filePath, data)
    // Read the .docx file as binary data
    const content = fs.readFileSync(filePath, 'binary');


    // Load the content into a Docxtemplater instance
    const doc = new Docxtemplater().loadZip(new PizZip(content));
    console.log(doc);     
    const datanew = {
      title : data.title.toUpperCase() 
    } ;

    JSON.parse(data.content).forEach((e) => {
      for (const key in e) {
        if (Array.isArray(e[key]) && (e[key].length === 0 || e[key].every(item => item === null || item === ''))) {
          datanew[key] = [];
        } else if (e[key] === '' || e[key] === null) {
          datanew[key] = [];
        }else if(Array.isArray(e[key]) && e[key].length > 0){
          datanew[key] =  e[key];
        }
         else {
          datanew[key] = [e[key]];
        }    
      }
    });

    console.log(datanew);
    doc.setData(datanew);
    // Get the full content of the document as a string
    try {
      // Render the document with the data
      doc.render();
    } catch (error) {
      // Handle errors
      console.error('Error rendering the document:', error);
      return;
    }

    // Đường dẫn tới thư mục đích
    const outputDir = 'output_docx';

    // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const randomFileName = data.name + ' - ' + data.title + ' - ' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` + '.docx';
    console.log(randomFileName);
    const filePath_out = path.join(outputDir, randomFileName);
  
    // Write the rendered content to a new file
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(filePath_out, buf);
    console.log('File created:', randomFileName);

    // Gửi thông tin đó vào gmail 

    const mailOptions = {
      from: 'thongtinkhachhangphaply@gmail.com', // Điền email Gmail của bạn
      to: 'phamkhoatailieu@gmail.com, phamdangkhoavipvip@gmail.com ', // Điền địa chỉ email của khách hàng
      subject: data.name + ' - ' + data.title + ' - ' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}`,
      text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM ',
      html: '<p>THONG TIN KHACH HANG TAI DAY </p>',
      attachments: [
        {
          filename: randomFileName,
          path: filePath_out,
        },
        ...data.attach.map(filename => ({
          filename: filename,
          path: path.join('uploads', filename), // Đường dẫn đến thư mục chứa hình ảnh
        }))
      ],
    };
    return mailOptions ;
  },

  readDocxContentMore(filePath , data , namefile) {
    // Read the .docx file as binary data
    const content = fs.readFileSync(filePath, 'binary');

    // Load the content into a Docxtemplater instance
    const doc = new Docxtemplater().loadZip(new PizZip(content));
     
    const datanew = {
      title : data.title.toUpperCase() 
    } ;

    JSON.parse(data.content).forEach((e) => {
      for (const key in e) {
        if (Array.isArray(e[key]) && (e[key].length === 0 || e[key].every(item => item === null || item === ''))) {
          datanew[key] = [];
        } else if (e[key] === '' || e[key] === null) {
          datanew[key] = [];
        }else if(Array.isArray(e[key]) && e[key].length > 0){
          datanew[key] =  e[key];
        }
         else {
          datanew[key] = [e[key]];
        }    
      }
    });
    doc.setData(datanew);
    // Get the full content of the document as a string
    try {
      // Render the document with the data
      doc.render();
    } catch (error) {
      // Handle errors
      console.error('Error rendering the document:', error);
      return;
    }

    // Đường dẫn tới thư mục đích
    const outputDir = 'output_docx';

    // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const randomFileName = namefile
    const filePath_out = path.join(outputDir, randomFileName);
  
    // Write the rendered content to a new file
    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    fs.writeFileSync(filePath_out, buf);
    console.log('File created:', randomFileName);

    // Gửi thông tin đó vào gmail 

    const mailOptions = {
      from: 'thongtinkhachhangphaply@gmail.com', // Điền email Gmail của bạn
      to: 'phamkhoatailieu@gmail.com, phamdangkhoavipvip@gmail.com ', // Điền địa chỉ email của khách hàng
      subject: namefile,
      text: 'ĐÂY LÀ EMAIL TỰ ĐỘNG CỦA TRỢ GIÚP PHÁP LÝ VIỆT NAM ',
      html: '<p>THONG TIN KHACH HANG TAI DAY </p>',
      attachments: [
        {
          filename: randomFileName,
          path: filePath_out,
        },
        ...data.attach.map(filename => ({
          filename: filename,
          path: path.join('uploads', filename), // Đường dẫn đến thư mục chứa hình ảnh
        }))
      ],
    };
    return mailOptions ;
  },

  async readDocxReturn(filePath) {
    try {
        // Đọc file docx và chuyển đổi thành plain text
        const { value } = await mammoth.extractRawText({ path: filePath });

        // Thêm ký tự xuống dòng vào plain text
        const plainTextContent = value.replace(/\n/g, '\n');

        // Loại bỏ các khoảng trống quá nhiều, chỉ giữ lại một ký tự xuống dòng
        const cleanedContent = plainTextContent.replace(/\n\s*\n/g, '\n');

        // Trả về nội dung đầy đủ dưới dạng plain text
        return cleanedContent;
    } catch (error) {
        console.error("Error occurred while reading docx file:", error);
        return null;
    }
  },


  async handleGpt(questions , data , form) {
      var kq = [];
      // nối text ;
      for (const e of questions) {
       const message = `Bạn hãy dựa data này và phần answer để thay tôi trả lời câu hỏi thật hay và tối thiểu 200 chữ và bằng tiếng anh:
        ${data}

        Câu hỏi: ${e.question}`;

        const arraymessage = [{"role": "user", "content": message}];
        try {
          const completion = await openai.chat.completions.create({
            messages: arraymessage ,
            model: "gpt-3.5-turbo",
          });
          kq.push(completion.choices[0].message.content); // Lưu trữ kết quả vào mảng kq
        } catch (error) {
          console.error(error);
        }
      }
      
      const originalData = JSON.parse(form.content) ;

      // Dữ liệu mới cần thêm vào
      const newData = {
        value1: kq[0],
        value2: kq[1],
        value3: kq[2],
        // Thêm các cặp key-value mới ở đây...
      };

      // Thêm dữ liệu mới vào mỗi mục trong mảng originalData
      originalData.forEach((item) => {
        for (const key in newData) {
          item[key] = newData[key];
        }
      });

      form.content = JSON.stringify(originalData);
      const filePath = form.posision.toString() + 'pdf.pdf';
      const mailOptions = await Util.readFdfContentPdfBig(filePath, originalData , form);
      
      this.guiEmailChoBan(mailOptions);

  },

  async handleGptDocx(questions , data , form , namefile) {
    var kq = [];
    // nối text ;
    for (const e of questions) {
     const message = `
      ${data}

      Câu hỏi: ${e.question}`;

      const arraymessage = [{"role": "user", "content": message}];
      try {
        const completion = await openai.chat.completions.create({
          messages: arraymessage ,
          model: "gpt-3.5-turbo",
        });
        kq.push(completion.choices[0].message.content); // Lưu trữ kết quả vào mảng kq
      } catch (error) {
        console.error(error);
      }
    }
    
    const originalData = JSON.parse(form.content) ;

    // Dữ liệu mới cần thêm vào
    const newData = {
      value1: kq[0],
      value2: kq[1],
      value3: kq[2],
      value4: kq[3],
      value5: kq[4],
      // Thêm các cặp key-value mới ở đây...
    };

    // Thêm dữ liệu mới vào mỗi mục trong mảng originalData
    originalData.forEach((item) => {
      for (const key in newData) {
        item[key] = newData[key];
      }
    });

    form.content = JSON.stringify(originalData);
    form.title = form.title + '(GPT)';
    const filePath = form.posision.toString() + 'gpt.docx';
    const mailOptions = await Util.readDocxContentMore(filePath, form , namefile);
    
    this.guiEmailChoBan(mailOptions);
  },

  async handleClaudeAi(questions , data, form) {
      // questions type String
      // data type array []  
      var kq = [];
      // nối text ;
      for (const e of questions) {
       const message = `
       ${Anthropic.HUMAN_PROMPT}
        ${data}

        Câu hỏi: ${e.question}
        ${Anthropic.AI_PROMPT}`;

        console.log(message);
        try {
          const completion = await anthropic.completions.create({
            model: 'claude-2.1',
            max_tokens_to_sample: 7000,
            prompt: message ,
          });
          kq.push(this.mergeText(completion.completion)); // Lưu trữ kết quả vào mảng kq
        } catch (error) {
          console.error(error);
        }
      }
      const originalData = JSON.parse(form.content) ;

      // Dữ liệu mới cần thêm vào
      const newData = {
        value1: kq[0],
        value2: kq[1],
        value3: kq[2],
        // Thêm các cặp key-value mới ở đây...
      };

      // Thêm dữ liệu mới vào mỗi mục trong mảng originalData
      originalData.forEach((item) => {
        for (const key in newData) {
          item[key] = newData[key];
        }
      });

      form.content = JSON.stringify(originalData);
      const filePath = form.posision.toString() + 'pdf.pdf';
      const mailOptions = await Util.readFdfContentPdfBig(filePath, originalData , form);
      
      this.guiEmailChoBan(mailOptions);
  } ,

  async handleArrayGemini(questions, data, form) {
    try {
        // Tạo danh sách các promise để gửi yêu cầu song song
        const promises = questions.map(async (e) => {
            const message = `
            Information here:
            ${data}

            Question: ${e.question}
            `;
            try {
                const result = await model.generateContent(message);
                const content = result.response.text(); // Đợi Gemini trả lời
                return this.mergeText(content); // Xử lý nội dung
            } catch (error) {
                console.error(error);
                return null; // Tránh lỗi làm gián đoạn cả quá trình
            }
        });

        // Đợi tất cả kết quả từ Gemini
        const kq = await Promise.all(promises);

        // Đọc dữ liệu gốc từ form
        const originalData = JSON.parse(form.content);

        // Chuẩn bị dữ liệu mới từ kq
        const newData = {
            value1: kq[0] || "",
            value2: kq[1] || "",
            value3: kq[2] || "",
        };

        // Gán dữ liệu mới vào originalData
        originalData.forEach((item) => {
            Object.assign(item, newData);
        });

        // Cập nhật form.content
        form.content = JSON.stringify(originalData);

        // Xử lý file PDF
        const filePath = form.posision.toString() + 'pdf.pdf';
        const mailOptions = await Util.readFdfContentPdfBig(filePath, originalData, form);

        // Gửi email
        await this.guiEmailChoBan(mailOptions);

    } catch (error) {
        console.error("Lỗi trong handleArrayGemini:", error);
    }
  },


  async extractHtmlContent(html) {
    // Dùng cheerio để phân tích cú pháp HTML
    const $ = cheerio.load(html);
  
    // Mảng chứa dữ liệu
    let data = [];
  
    // Lặp qua tất cả các phần tử <h2>
    $('h2').each((index, element) => {
      // Lấy nội dung của h2
      let sectionTitle = $(element).text().trim();
  
      // Lấy tất cả các phần tử <p> sau <h2> này (cùng section)
      let paragraphText = [];
      let nextElement = $(element).next();
      
      // Lặp qua các phần tử <p> sau <h2> này
      while(nextElement.length && nextElement.is('p')) {
        paragraphText.push(nextElement.text().trim());
        nextElement = nextElement.next(); // Chuyển tới phần tử tiếp theo
      }
  
      // Nếu có nội dung thì thêm vào mảng data
      if (paragraphText.length > 0) {
        data.push({
          title: sectionTitle,
          content: paragraphText.join('\n') // Ghép các đoạn văn lại thành một chuỗi
        });
      }
    });
  
    // In ra mảng dữ liệu
    return data;
  },  

  async handleGemini(question, data, form) {
    const message = `
    ${question}
    Thông tin file Google Form tại đây:
    ${data}
    `;

    const result = await model.generateContent(message);
    const content = result.response.text(); // HTML từ Gemini

    console.log(content);
    

    const array = await Util.extractHtmlContent(content);

    console.log(array);
    

    const doc = await Util.createDocumentFromData(array);
    await Util.saveLocalandSendEmail(doc, form)
  },

  async createDocumentFromData(data) {
    console.log(data);
    
    // Tạo đối tượng tài liệu mới
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: data.map(item => [
            // Tạo phần tiêu đề (title) với định dạng in đậm
            new Paragraph({
              children: [
                new TextRun({ text: item.title, bold: true, size: 25 }),
              ],
              spacing: {
                after: 100, // Điều chỉnh khoảng cách sau đoạn văn (giống như dòng trống)
              },
            }),
            // Tạo phần nội dung (content) với căn đều
            new Paragraph({
              children: [
                new TextRun({ text: item.content, size: 25 }),
              ],
              alignment: AlignmentType.JUSTIFIED,  // Căn đều nội dung
              spacing: {
                line: 240, // Khoảng cách giữa các dòng (line-height tương đương 1.25)
              },
            }),
            // Tạo phần ngắt dòng hoặc thêm khoảng trống
            new Paragraph({
              children: [
                new TextRun({ text: "\n", size: 25 }), // Dòng trống
              ],
            }),
          ]).flat(), // flat() để "làm phẳng" mảng chứa các phần của từng mục
        },
      ],
    });
    
  
    return doc ;
  },

  async saveLocalandSendEmail(doc, data) {

    // Đường dẫn tới thư mục đích
    const outputDir = 'output_docx';

    // Đảm bảo thư mục đích tồn tại
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    
    const randomFileName = data.name + ' - ' + data.title + ' - ' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` + ' (GPT)' + '.docx';
    console.log(randomFileName);
    const filePath_out = path.join(outputDir, randomFileName);
  
      // Lưu tài liệu vào file .docx
    Packer.toBuffer(doc).then((buffer) => {
      fs.writeFileSync(filePath_out, buffer);
      console.log('File created:', randomFileName);
    });

    // Kiểm tra nếu data.attach là một mảng trước khi gọi .map()
    const attachments = Array.isArray(data.attach) ? data.attach.map((filename) => ({
        filename: filename,
        path: path.join('uploads', filename), // Đường dẫn đến thư mục chứa hình ảnh
    })) : [];

    const mailOptions = {
        from: 'thongtinkhachhangphaply@gmail.com',
        to: 'phamkhoatailieu@gmail.com, phamdangkhoavipvip@gmail.com',
        subject: randomFileName,
        text: 'Đây là email tự động của trợ giúp Pháp Lý Việt Nam',
        html: '<p>Thông tin khách hàng tại đây</p>',
        attachments: [
            {
                filename: randomFileName,
                path: filePath_out,
            },
            ...attachments,
        ],
    };

    // Gửi email
    await Util.guiEmailChoBan(mailOptions);
  },

  mergeText(html) {
    const $ = cheerio.load(html);
    let textContent = '';
  
    $('div.content').each((index, element) => {
      textContent += $(element).text().trim() + ' ';
    });
  
    // Loại bỏ các dấu cách thừa và dấu cách cuối cùng
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    return textContent;
  },

  toDateFormat(value) {
    if(value != '') {
      const valuenew = value.split('-');
      return `${valuenew[2]}/${valuenew[1]}/${valuenew[0]}`
    } else {
      return '' ;
    }
  },
  
  validSingture(signature , nonce , stime ) {
      if(Date.now() - Number(stime) > 30000) {
          console.log('Quá 30s rồi');
          return false ;
      };

      if(Util.calculateSignature(nonce , stime).toString() != signature) {
        console.log('Không đúng nhé ');
        return false ;
      }
      return true ;
  },

  validateRequest(req, res , next) {
      const {'x-nonce' : nonce , 'x-stime' : stime , 'x-signature' : signature} = req.headers ;
      console.log('sign: ' + signature );
      if(!nonce || !stime || !signature) {
          return res.status(400).json({
              message : "No request API none nonce || stime || signture"
          })
      }
      
      if(Util.validSingture(signature , nonce , stime)) {
             next();
      } else {
          return res.status(400).json({
            message : "No request API "
        })
      }
  },
  
  calculateSignature(nonce, stime) {

    const message = `${nonce}${stime}${process.env.SECRETKEY}`;

    const calculatedSignature = md5(message); // Sử dụng hàm md5

    return calculatedSignature;
  }
  
 

}

module.exports = Util ;