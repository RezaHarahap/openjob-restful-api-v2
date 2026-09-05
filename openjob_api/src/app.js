const express=require('express');
const users=require('./routes/users');const companies=require('./routes/companies');const categories=require('./routes/categories');const jobs=require('./routes/jobs');const applications=require('./routes/applications');const bookmarks=require('./routes/bookmarks');const jobBookmarks=require('./routes/jobBookmarks');const authentications=require('./routes/authentications');const profile=require('./routes/profile');const documents=require('./routes/documents');const errorHandler=require('./middleware/error');
const app=express();app.use(express.json());
app.get('/',(req,res)=>res.json({status:'success',message:'OpenJob RESTful API V2'}));
app.use('/users',users);app.use('/companies',companies);app.use('/categories',categories);app.use('/jobs/:jobId/bookmark',jobBookmarks);app.use('/jobs',jobs);app.use('/applications',applications);app.use('/bookmarks',bookmarks);app.use('/authentications',authentications);app.use('/profile',profile);app.use('/documents',documents);
app.use((req,res)=>res.status(404).json({status:'failed',message:'Route not found'}));app.use(errorHandler);module.exports=app;
