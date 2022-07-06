/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
const {ObjectId} =require("mongodb");

const schema = {
  $jsonSchema:{
    bsonType:"object",
    required:["title"],
    properties:{
        title:{
          bsonType:"string",
          description:"the book title"
        },
        commentcount:{
          bsonType:"int",
          description:"comments count"
        },
        comments:{
          bsonType:"array",
          description:"array of all comments",
          items: {
            bsonType: "string",
         }
        }
    }
  }
}

module.exports =async function (app,client) {
  const db = await client.db("book");
  var collection;
  try{
   collection = await db.createCollection("books",{validator:schema});
  }catch (err){
    collection = await db.collection("books")
  }
  app.route('/api/books')
    .get(async function (req, res){
      const booksArr= await collection.find().toArray();
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      if(booksArr.length>0){
      res.json(booksArr);
      }else{
        res.send("no book exists")
      }
    })
    
    .post(async function (req, res){
      let {title,commentcount=0,comments=[]}=req.body;
      //response will contain new book object including atleast _id and title
      if(title){
         const insert=await collection.insertOne({title:title,commentcount:commentcount,comments:comments});
      if(insert.acknowledged){
        res.json({title:title,_id:insert.insertedId})
      }else{
        
      }
    }else{
      res.send("missing required field title")
    }
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful '
      collection.deleteMany((err,doc)=>{
        if(err){
          console.error(err);
        }else{
          if(doc.deletedCount){
            res.send("complete delete successful");
          }else{
            res.send("something went wrong")
          }
        }
      })
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      if(bookid){
        const book= await collection.findOne({_id:ObjectId(bookid)})
        if(book){
        res.json(book)
        }else{
          res.send("no book exists")
        }
      }
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if(comment){
      collection.findOneAndUpdate({_id:ObjectId(bookid)},{$push:{comments:comment},$inc:{commentcount:1}},{returnDocument:"after"},(err,doc)=>{
        if(err){
          console.error(err);
        }else{
          if(doc.value){
          res.json(doc.value)
        }else{
          res.send("no book exists")
        }
        }
      })
    }else{
      res.send('missing required field comment')
    }
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      collection.deleteOne({_id:ObjectId(bookid)},(err,doc)=>{
        if(err){
          console.error(err);
        }else{
          if(doc.deletedCount>0){
            res.send("delete successful");
          }else{
            res.send("no book exists");
          }
        }
      })
    });
      console.log("finished registering endpoints")
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});
};
