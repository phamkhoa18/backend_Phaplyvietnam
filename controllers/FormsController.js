const mongoose = require('mongoose');
const Forms = require('../models/Forms');
const Util = require('../Utils');

const FormsController = {
    Add_Forms : async (req,res) => {
        try {
            console.log(req.body);
            var filenames ;
            if(req.files) {
                filenames = req.files.map((file) => file.filename);
            } // Lấy danh sách các tên file đã lưu
            const form = await new Forms({
                title : req.body.title , 
                name : req.body.name ,
                content : req.body.content ,
                posision : req.body.posision ,
                date : Date.now() ,
                attach : filenames || [] 
            });
            var filePath;
            var mailOptions ;
            var content = '' ;
            var namefile = '' ;
            if(form.posision == 'form80' || form.posision == 'form47a') {
                filePath = form.posision.toString() + '.pdf';
                mailOptions = await Util.readPdfContent(filePath, form);
            } else if (form.posision == 'form888'){
                filePath = form.posision.toString() + '.docx';
                mailOptions = await Util.readDocxContent(filePath, form);
                // return content in Docx use GPT
               content = await Util.readDocxReturn(mailOptions.attachments[0].path);
               const questions = [
                {id : 1 , question : "How did you get to know the applicant and the applicant's spouse or fiance and how often you contacted them? Based on all the information I provided above, my relationship of the sponsor and the guarantor. The sponsor is sponsoring the sponsor for a spousal visa. Based on my information above: Please write me a 200-word paragraph in English ,The answer is related to the question, please help me put the < div > tag in the .content class , about: how I know them, what my relationship with them is like, how often I and they meet and How to communicate, write emotionally, write in a way that I support their relationship. I recognize them as a couple, their relationship is real. No yapping"} ,
                {id : 2 , question : "State how you know whether the relationship between the applicant and his/her spouse or fiancé is sincere and lasting, and give reasons for the trust between them? Above is all my information, my relationship between the sponsored person and the guarantor. The sponsor is sponsoring the sponsor for a spousal visa. Based on my information, write about 200 English words for a paragraph, The answer is related to the question, please help me put the < div > tag in the .content class, touching and sincere: describe their relationship as husband and wife, their passionate love, their sincerity. In the relationship between husband and wife, how do they care for and love each other? How do they help each other with housework and share finances? I always support their love as husband and wife, I recognize their relationship as real. Note: add this sentence to the answer ' I declares that ...... and ........ are in a married relationship relationship '"} ,
                {id : 3, question : "Above is all my information, my relationship between the sponsored person and the guarantor. The sponsor is sponsoring the sponsor for a spousal visa. Based on my information, please write me a paragraph, touching and sincere words: I support the love of this couple, I hope they will always be happy. I hope the Immigration Department will consider approving the sponsor's visa application. ( English words , The answer is related to the question, please help me put the < div > tag in the .content class )"}
               ]
                Util.handleArrayGemini(questions, content , form) ;
            }else if (form.posision == 'genuinestudent') {
                filePath = form.posision.toString() + '.docx';
                mailOptions = await Util.readDocxContent(filePath, form);
                // handle logic asynchronous (bất đồng bộ) process   (create namefile before handle logic fs) 
                namefile = await form.name + '-' + form.title + '(GPT)' + '-' + `${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}${Math.floor(Math.random() * 10)}` + '.docx' ;
                await mailOptions.attachments.push({
                    filename: namefile,
                    path: 'output_docx\\' + namefile // Đường dẫn đến tệp .docx
                })

                console.log(mailOptions);
                // return content in Docx use GPT
               content = await Util.readDocxReturn(mailOptions.attachments[0].path);
               const questions = [
                {id : 1, question : `Based on the information provided above, I will write at least 1000 words in English. Here is a descriptive narrative encompassing my family situation (including family members), my current job or academic pursuits (detailing what I am doing, my passion for my career or academic field if I am still studying, my emotional relationship with my family, how my job or studies contribute to my family or society, describing my family's income or my own income, and explaining that with my income and economic conditions, my family ensures that I can comfortably choose the path of studying abroad in Australia to enhance my educational attainment without worrying about finances during my time studying in Australia.`} ,
                {id : 2, question : `Dựa trên thông tin ở trên của tôi, hãy viết tối thiểu 1000 chữ bằng tiếng anh,tối thiểu 1000 chữ bằng tiếng anh,  Viết lời văn tự tin mô tả: Tại sao tôi lại chọn ngành học này, ngành học này mang lại lợi ích gì cho tương lai của tôi, tại sao tôi chọn trường học này tại úc, trường học này có đặc điểm gì nổi bật so với các trường đại học khác tại Úc, tại sao tôi yêu thích nó, tại sao tôi quyết định chọn nước Úc là nơi học tập: tôi đã hiểu cuộc sống và môi trường học tập tại Úc có những thuận lợi gì và có những khác biệt gì so với nước khác, tôi đã hiểu những yêu cầu của chính phủ Úc đối với một du học sinh, tôi sẽ chấp hành tốt, với mong muốn học tập tốt.`} ,
                {id : 3, question : `Dựa trên thông tin ở trên của tôi, hãy viết tối thiểu 1000 chữ bằng tiếng anh, tối thiểu 1000 chữ bằng tiếng anh , Viết lời văn tình cảm xúc động mô tả: khó học của tôi đã chọn sẽ mang lại lợi ích gì cho công việc tương lai của tôi tại Việt Nam, lý do tại sao tôi lại tin khóa học này là một lợi thế của tôi với công việc sau này của tôi tại Việt Nam, cụ thể hãy nêu chi tiết những mặt tôi sẽ đạt được sau khi học khóa học này, hãy nêu rõ thế mạnh của tôi sau khi tốt nghiệp khóa học này khi học tại Úc so với việc tôi tốt nghiệp khóa học này tại Việt Nam, sau khi tốt nghiệp tôi dễ dàng tìm kiếm cơ hội việc làm tại Việc Nam, được làm trong môi trường yêu thích như thế nào.`},
                {id : 4, question : `Dựa trên thông tin ở trên của tôi, hãy viết tối thiểu 1000 chữ bằng tiếng anh, tối thiểu 1000 chữ bằng tiếng anh , Lời văn giãi bày, tình cảm mô tả: hãy tóm tắt lại lý do tôi chọn nước Úc là nơi tôi du học, tình cảm tôi dành cho nước Úc và ngành học tôi đã chọn, tôi mong muốn sau khi mình tốt nghiệp mình sẽ trở về Việt Nam, đóng góp cho xã hội Việt Nam, mong muốn kiến thức được phát triển, mang lại lợi ích cho tương lai và thu nhập, từ đó tôi có thể chăm sóc yêu thương gia dình mình hơn`},
                {id : 5, question : `Dựa vào thông tin ở trên của tôi ở câu số 21 , hãy dịch câu trả lời thành tiếng anh (chỉ cần trả lời) `},
               ]
                Util.handleGptDocx(questions , content , form , namefile);
            }else if (form.posision == 'formmoiquanhevochong') {    
                filePath = form.posision.toString() + '.docx';
                mailOptions = await Util.readDocxContent(filePath, form);
                // return content in Docx use GPT
                content = await Util.readDocxReturn(mailOptions.attachments[0].path);
                const prompt =  `
                        Tôi có một file Google Form mà khách hàng của tôi đã điền thông tin về mối quan hệ vợ chồng của họ 
                            để nộp cho Bộ Di Trú Úc trong hồ sơ visa 309 hoặc 820.
                            File này chứa các câu trả lời của client về cách họ gặp nhau, cuộc sống chung, tài chính, gia đình, kế hoạch tương lai, v.v.

                            Tôi muốn bạn viết một bản tường trình mối quan hệ vợ chồng theo đúng phong cách và cấu trúc của mẫu bản khai mối quan hệ sau:

                            **Hoàn cảnh gặp nhau**
                            **Cuộc sống chung**
                            **Công việc & tài chính**
                            **Du lịch & các hoạt động chung**
                            **Quan hệ gia đình & bạn bè**
                            **Cam kết với nhau**
                            **Dự định trong tương lai**
                            **Kết luận**

                            Hãy sử dụng câu trả lời của khách hàng từ file Google Form để viết bản tường trình một cách tự nhiên, mạch lạc và cảm xúc, sao cho mỗi phần có sự liên kết chặt chẽ với nhau. Viết thật dài, ít lắm là 3000 từ

                            Đảm bảo rằng bản tường trình này duy trì giọng văn tự nhiên, dễ hiểu, và thể hiện chân thực cảm xúc của cặp đôi. Hãy viết ở ngôi thứ nhất, kể về mối quan hệ của họ với nhau.

                            Lưu ý: Không cần có câu giới thiệu, trả lời vào vấn đề, hãy trả lời thành HTML, chỉ lấy các thẻ trong html , nội dung sử dụng <p>, tiêu đề sử dụng <h1>, tựa nội dung <h2>
                `
                Util.handleGemini(prompt, content , form) ;
            } else if(form.posision == 'free' || form.posision == 'saigon247') {
                filePath = form.posision.toString() + '.docx';
                mailOptions = await Util.readDocxContent(filePath, form);
                mailOptions.to = 'luatsutiensi@gmail.com, phamkhoa3092003@gmail.com' ;
            }
            else {
                console.log(form.posision.toString());
                filePath = form.posision.toString() + '.docx';
                mailOptions = await Util.readDocxContent(filePath, form);
            }

            await Util.guiEmailChoBan(mailOptions);

            // // Util.TransformJsonToDoc(form) ;
            await form.save();
            res.status(200).json({
                status: 200,
                message: 'menusave',
                attachments: mailOptions.attachments,
                content: content,
                position: form.posision
            });
        } catch (error) {
            console.log(error);
            
            res.status(200).json({status : 404 ,message : error});
        }
    },

    Add_Pdf : async (req, res) => {
        try {
            var mailOptions ;
            var valueen ;
            if(req.body.pdfvalue) {
                req.body.pdfvalue.fileNamePdf.forEach((e) => {
                    if(e.fieldname == 'pdfen') {
                        valueen = e ;
                    }
                })
            }
            values = await Util.readFdfContentUpdate( valueen , req.body.data , req.body.pdfvalue);

            const form = new Forms({
                title : values.informationvalue.title , 
                name : values.informationvalue.name ,
                content : values.informationvalue.content ,
                posision : values.informationvalue.posision ,
                date : Date.now() ,
                attach : [] 
            });

            await form.save() ;
            await Util.guiEmailChoBan(values.mailOptions);
            
            res.status(200).json({status : 200, filename : values.mailOptions.attachments[0].filename });
          } catch (error) {
            res.status(404).json({status : 404 ,message : error});
          }
    },
    List_Forms : async (req,res) => {
        try {
            const menu = await Forms.find();
            res.status(200).json(menu);
        } catch (error) {
            res.status(404).json({message : error});
        }
    },
    Del_Forms  : async(req,res) => {
        try {
            try {
                const del = await Forms.deleteOne({_id : req.params.id});
            if (del.deletedCount === 1) {
                res.status(200).json({ status : 200 , message : 'Successfully deleted one document.'});
              } else {
                res.status(200).json({ status : 404 , message : 'No documents matched the query. Deleted 0 documents.'});
              }
            } catch (error) {
                res.status(404).json({ status : 404 , message : "lỗi "});
            }
        } catch (error) {
            
        }
    },

    Handle_Update : async (req,res) => {
        try {
            const dataone = await Forms.findByIdAndUpdate(req.body.id , {
                name : req.body.name ,
                title : req.body.title ,
                content : req.body.content ,
                posision : req.body.posision ,
                seen : req.body.seen 
            })
            
            if(dataone) {
                res.status(200).json({status : 200 , message : "update thành công"});
            }
            else {
                res.status(404).json({status : 404 , message : "không thành công"});
            }
        } catch (error) {
            res.status(404).json({message : error});
        }
    },

    Xuly_contact : async (req,res) => {
        try {
            const count = await Forms.countDocuments({seen : false});
            res.status(200).json(count);
        } catch (error) {
            res.status(404).json(error);
        }
    },

    Send_Mail : async (req,res) => {

    }
    
}
module.exports = FormsController ;