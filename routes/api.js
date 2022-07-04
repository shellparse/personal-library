/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

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
        }
    }
  }
}

module.exports =async function (app,client) {
  const db = await client.db("book");
  const collection = await db.createCollection("books",{validator:schema});
  app.route('/api/books/:id')
    .get(async function (req, res){
      if(req.params.id){
        const book= await collection.findOne({_id:ObjectId(req.params.id)})
        if(book){
        res.json(book)
        }else{
          res.send("no book exists")
        }
      }
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
      let {title,commentcount=0}=req.body;
      //response will contain new book object including atleast _id and title
      if(title){
         const insert=await collection.insertOne({title:title,commentcount:commentcount});
      if(insert.acknowledged){
        res.json({title:title,_id:insert.insertedId})
      }
    }else{
      res.send("missing required field title")
    }
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
    });
      
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});
};
