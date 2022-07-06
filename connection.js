const {MongoMemoryServer} =require('mongodb-memory-server');
const {MongoClient} = require("mongodb");
async function  main(callback){
    let client;
    if(process.env.LOCAL_TEST==="test"){
        try{
        const mongod = await MongoMemoryServer.create();
        const dbUri = mongod.getUri();
        console.log(dbUri);
        client= new MongoClient("mongodb+srv://shellparse:Mido1991@cluster0.yzkfu.mongodb.net/?retryWrites=true&w=majority");
        await client.connect();
        await callback(client);
        }catch(e){
            console.error(e)
        }
    }else{
        client=new MongoClient(process.env.DB);
        try{
        await client.connect();
        await callback(client);
        }catch (e){
            console.error(e);
        }
    }
}
module.exports = main;