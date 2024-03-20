const express = require("express")
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken")
const { generateAcessToken } = require('../utils/utils')
const { Admin, Case, Attorney, Blog, BlogCase } = require("../database/databaseConfig");
const { validationResult } = require("express-validator");


module.exports.getAdminFromJwt = async (req, res, next) => {
   try {
      let token = req.headers["header"]
      if (!token) {
         throw new Error("a token is needed ")
      }
      const decodedToken = jwt.verify(token, process.env.SECRET_KEY)

      const admin = await Admin.findOne({ email: decodedToken.email })

      if (!admin) {
         //if user does not exist return 404 response
         return res.status(404).json({
            response: "admin has been deleted"
         })
      }

      return res.status(200).json({
         response: {
            admin: admin,
         }
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}




module.exports.signup = async (req, res, next) => {
   try {
      //email verification
      let { password, email, secretKey } = req.body
      console.log(req.body)
      //checking for validation error
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
         let error = new Error("invalid user input")
         return next(error)
      }

      //check if the email already exist
      let adminExist = await Admin.findOne({ email: email })

      if (adminExist) {
         let error = new Error("admin is already registered")
         //setting up the status code to correctly redirect user on the front-end
         error.statusCode = 301
         return next(error)
      }


      //check for secretkey
      if (secretKey !== 'legal') {
         let error = new Error("secretKey mismatched")
         error.statusCode = 300
         return next(error)
      }


   


      //hence proceed to create models of admin and token
      let newAdmin = new Admin({
         _id: new mongoose.Types.ObjectId(),
         email: email,
         password: password,
      })

      let savedAdmin = await newAdmin.save()

      if (!savedAdmin) {
         //cannot save user
         let error = new Error("an error occured")
         return next(error)
      }

      let token = generateAcessToken(email)

      //at this point,return jwt token and expiry alongside the user credentials
      return res.status(200).json({
         response: {
            admin: savedAdmin,
            token: token,
            expiresIn: '500',
         }
      })


   } catch (error) {
      console.log(error)
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}

//sign in user with different response pattern
module.exports.login = async (req, res, next) => {
   try {
      console.log(req.body)
      let { email, password } = req.body
      //checking for validation error
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
         let error = new Error("invalid user input")
         return next(error)
      }

      let adminExist = await Admin.findOne({ email: email })


      if (!adminExist) {
         return res.status(404).json({
            response: "admin is not yet registered"
         })
      }



      //check if password corresponds
      if (adminExist.password != password) {
         let error = new Error("Password does not match")
         return next(error)
      }

      let token = generateAcessToken(email)

      //at this point,return jwt token and expiry alongside the user credentials
      return res.status(200).json({
         response: {
            admin: adminExist,
            token: token,
            expiresIn: '500',
         }
      })


   } catch (error) {
      console.log(error)
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}


module.exports.fetchCases = async (req, res, next) => {
   try {
      let cases = await Case.find()

      if (!cases) {
         let error = new Error("An error occured")
         return next(error)
      }

      console.log(cases)
      return res.status(200).json({
         response: {
            cases: cases
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }





}

module.exports.fetchCase = async (req, res, next) => {
   try {

      let caseId = req.params.id

      let case_ = await CaseOne.findOne({ _id: caseId })

      if (!case_) {
         let error = new Error("casenot found")
         return next(error)
      }
      return res.status(200).json({
         response: {
            case_
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }

}

module.exports.updateCase = async (req, res, next) => {

   try {
      let caseId = req.params.id

      let {
         caseOwner,
         subject,
         clientEmail,
         clientPhoneNumber,
         clientAddress,
         caseNumber,
         caseSubject,
         caseCategory,
         caseMatter,
         status,
         attorney,
         courtCaseNumber,
         stage1,
         stage2,
         stage3,
         progress,
         chargingCourt,
         nextCaseDate,
         dateAdded

      } = req.body

      let case_ = await Case.findOne({ _id: caseId })

      if (!case_) {
         let error = new Error("casenot found")
         return next(error)
      }

      //update case here
      case_.caseOwner = caseOwner || ''
      case_.subject = subject || ''
      case_.clientEmail = clientEmail || ''
      case_.clientPhoneNumber = clientPhoneNumber || ''
      case_.clientAddress = clientAddress || ''
      case_.caseNumber = caseNumber || ' '
      case_.caseSubject = caseSubject || ' '
      case_.caseCategory = caseCategory || ''
      case_.caseMatter = caseMatter || ' '
      case_.status = status || ' '
      case_.attorney = attorney || ' '
      case_.courtCaseNumber = courtCaseNumber || ' '
      case_.stage1 = stage1 || ' '
      case_.stage2 = stage2 || ' '
      case_.stage3 = stage3 || ' '
      case_.progress = progress || ''
      case_.chargingCourt = chargingCourt || ' '
      case_.nextCaseDate = nextCaseDate || ' '
      case_.dateAdded = dateAdded || ''


      let savedCase = await case_.save()

      if (!savedCase) {
         let error = new Error("an error occured on the server")
         return next(error)
      }


      return res.status(200).json({
         response: savedCase
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }

}

module.exports.deleteCase = async (req, res, next) => {
   try {
      let caseId = req.params.id
      let case_ = await Case.deleteOne({ _id: caseId })
      if (!case_) {
         let error = new Error("an error occured")
         return next(error)
      }
      return res.status(200).json({
         response: {
            message: 'deleted successfully'
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}

//attorneys controller section
module.exports.fetchAttorneys = async (req, res, next) => {
   try {
      let Attorneys = await Attorney.find()
      if (!Attorneys) {
         let error = new Error("An error occured")
         return next(error)
      }

      return res.status(200).json({
         response: {
            attorneys: Attorneys
         }
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}
module.exports.fetchAttorney = async (req, res, next) => {
   try {

      let attorneyId = req.params.id

      let attorney_ = await Attorney.findOne({ _id: attorneyId })

      if (!attorney_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      return res.status(200).json({
         response: {
            attorney_
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}
module.exports.updateAttorney = async (req, res, next) => {
   try {
      let attorneyId = req.params.id

      //fetching details from the request object
      let {
         nameOfAttorney,
         about,
         address,
         email,
         phone } = req.body

      let attorney_ = await Attorney.findOne({ _id: attorneyId })

      if (!attorney_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      //update attorney

      attorney_.nameOfAttorney = nameOfAttorney || ''

      attorney_.about = about || ''

      attorney_.address = address || ''
      attorney_.email = email || ''

      attorney_.phone = phone || ''

      let savedAttorney_ = await attorney_.save()

      if (!savedAttorney_) {
         let error = new Error("an error occured on the server")
         return next(error)
      }

      return res.status(200).json({
         response: savedAttorney_
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
module.exports.deleteAttorney = async (req, res, next) => {
   try {
      let attorneyId = req.params.id

      let attorney_ = await Attorney.deleteOne({ _id: attorneyId })

      if (!attorney_) {
         let error = new Error("an error occured")
         return next(error)
      }
      return res.status(200).json({
         response: {
            message: 'deleted successfully'
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}
module.exports.newAttorney = async (req, res, next) => {
   try {
      let {
         nameOfAttorney,
         about,
         address,
         email,
         phone,
         photo } = req.body

      //creating new attorney
      let newAttorney_ = new Attorney({
         _id: new mongoose.Types.ObjectId(),
         nameOfAttorney,
         about,
         address,
         email,
         phone,
         photo,
      })

      let savedAttorney = await newAttorney_.save()


      if (!savedAttorney) {
         let error = new Error("an error occured")
         return next(error)
      }
      return res.status(200).json({
         response: savedAttorney
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}

//blogs controller


//attorneys controller section
module.exports.fetchBlogs = async (req, res, next) => {
   console.log('trying to fetch all blog')
   try {
      let blogs = await Blog.find()

      if (!blogs) {
         let error = new Error("An error occured")
         return next(error)
      }

      console.log(blogs)

      return res.status(200).json({
         response: blogs
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}
module.exports.fetchBlog = async (req, res, next) => {

   try {
      let blogId = req.params.id

      let blog_ = await Blog.findOne({ _id: blogId })

      if (!blog_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      return res.status(200).json({
         response: {
            blog_
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}

module.exports.updateBlog = async (req, res, next) => {
   try {

      let blogId = req.params.id
      //fetching details from the request object
      let {
         blog_photo_url,
         blog_photo_url2,
         blog_topic,
         date,
         numOfView,
         blog_text,
         blog_qoute,
         blog_topic2,
         blog_text2,
      } = req.body

      let blog_ = await Blog.findOne({ _id: blogId })

      if (!blog_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      //update attorney
      blog_.blog_photo_url = blog_photo_url || ' '

      blog_.blog_topic = blog_topic || ' '

      blog_.date = date || ' '

      blog_.numOfView = numOfView || " "

      blog_.blog_text = blog_text || ' '

      blog_.blog_qoute = blog_qoute || ' '

      blog_.blog_topic2 = blog_topic2 || ' '

      blog_.blog_photo_url2 = blog_photo_url2 || ' '

      blog_.blog_text2 = blog_text2 || ' '


      let savedBlog_ = await blog_.save()

      if (!savedBlog_) {
         let error = new Error("an error occured on the server")
         return next(error)
      }

      return res.status(200).json({
         response: savedBlog_
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}

module.exports.deleteBlog = async (req, res, next) => {
   try {
      let blogId = req.params.id

      let blog_ = await Blog.deleteOne({ _id: blogId })

      if (!blog_) {
         let error = new Error("an error occured")
         return next(error)
      }
      return res.status(200).json({
         response: {
            message: 'deleted successfully'
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}

Blog.find().then(data => {
   console.log(data)
})

module.exports.newBlog = async (req, res, next) => {
   try {

      let {
         blog_photo_url,
         blog_topic,
         date,
         numOfView,
         blog_text,
         blog_qoute,
         blog_topic2,
         blog_photo_url2,
         blog_text2,

      } = req.body

      //creating new attorney
      let newBlog_ = new Blog({
         _id: new mongoose.Types.ObjectId(),
         blog_photo_url,
         blog_topic,
         date,
         numOfView,
         blog_text,
         blog_qoute,
         blog_topic2,
         blog_photo_url2,
         blog_text2,


      })

      let savedBlog = await newBlog_.save()


      if (!savedBlog) {
         let error = new Error("an error occured")
         return next(error)
      }
      return res.status(200).json({
         response: savedBlog
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}



//blog case controller

module.exports.fetchBlogCases = async (req, res, next) => {

   try {
      let blogCases = await BlogCase.find()

      if (!blogCases) {
         let error = new Error("An error occured")
         return next(error)
      }

      return res.status(200).json({
         response: blogCases
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}

module.exports.fetchBlogCase = async (req, res, next) => {
   try {
      let blogCaseId = req.params.id

      let blogCase_ = await BlogCase.findOne({ _id: blogCaseId })

      if (!blogCase_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      return res.status(200).json({
         response: {
            blogCase_
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}

module.exports.updateBlogCase = async (req, res, next) => {
   try {

      console.log(req.body)

      let blogCaseId = req.params.id
      //fetching details from the request object
      let {
         case_photo_url,
         case_type,
         case_topic,
         case_text,
         case_attorney,
         case_duration,
         result_price,
         case_category,
         case_challenge,
         case_legal_strategy,
         result_text,
      } = req.body

      let blogCase_ = await BlogCase.findOne({ _id: blogCaseId })

      if (!blogCase_) {
         let error = new Error("attorney not found")
         return next(error)
      }

      //update attorney
      blogCase_.case_photo_url = case_photo_url || ' '

      blogCase_.case_type = case_type || ' '

      blogCase_.case_topic = case_topic || ' '

      blogCase_.case_text = case_text || ' '

      blogCase_.case_attorney = case_attorney || ' '

      blogCase_.case_duration = case_duration || ' '

      blogCase_.result_price = result_price || ' '

      blogCase_.case_category = case_category || ' '

      blogCase_.case_challenge = case_challenge || ' '

      blogCase_.case_legal_strategy = case_legal_strategy || ' '

      blogCase_.result_text = result_text || ' '

      let savedBlogCase_ = await blogCase_.save()

      if (!savedBlogCase_ ) {
         let error = new Error("an error occured on the server")
         return next(error)
      }

      return res.status(200).json({
         response: savedBlogCase_ 
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)
   }
}

module.exports.deleteBlogCase = async (req, res, next) => {
   try {

      let blogCaseId = req.params.id

      let blogCase_ = await BlogCase.deleteOne({ _id: blogCaseId })

      if (!blogCase_) {
         let error = new Error("an error occured")

         return next(error)
      }
      return res.status(200).json({
         response: {
            message: 'deleted successfully'
         }
      })
   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }
}


module.exports.newBlogCase = async (req, res, next) => {

   
   try {
      let {
         case_photo_url,
         case_type,
         case_topic,
         case_text,
         case_attorney,
         case_duration,
         result_price,
         case_category,
         case_challenge,
         case_legal_strategy,
         result_text,
      } = req.body

      //creating new attorney
      let newBlogCase_ = new BlogCase({
         _id: new mongoose.Types.ObjectId(),
         case_photo_url,
         case_type,
         case_topic,
         case_text,
         case_attorney,
         case_duration,
         result_price,
         case_category,
         case_challenge,
         case_legal_strategy,
         result_text,
      })

      let savedBlogCase = await newBlogCase_ .save()

      if (!savedBlogCase) {
         let error = new Error("an error occured")
         return next(error)
      }

      return res.status(200).json({
         response: savedBlogCase
      })

   } catch (error) {
      error.message = error.message || "an error occured try later"
      return next(error)

   }


}