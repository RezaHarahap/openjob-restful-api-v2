require('dotenv').config();const app=require('./app');const {host,port}=require('./config');
const server=app.listen(port,host,()=>console.log(`OpenJob API running at http://${host}:${port}`));
const pool=require('./database/pool');const cache=require('./services/cache');
const shutdown=()=>server.close(async()=>{await Promise.allSettled([pool.end(),cache.close()]);process.exit(0)});process.on('SIGTERM',shutdown);process.on('SIGINT',shutdown);
