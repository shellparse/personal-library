/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
//   /*
//   * ----[EXAMPLE TEST]----
//   * Each test should completely test the response of the API end-point including response status code!
  //*/
  test('#example Test GET /api/books', function(done){
     chai.request(server).post("/api/books").send({title:"testing title",commentcount:0}).end((err,res)=>{
      if(err){
        console.error(err);
      }else{
        chai.request(server)
        .get('/api/books')
        .end(function(err, res){
          if(err){
            console.error(err);
          }else{
          assert.equal(res.status, 200);
          assert.isArray(res.body, 'response should be an array');
          assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
          assert.property(res.body[0], 'title', 'Books in array should contain title');
          assert.property(res.body[0], '_id', 'Books in array should contain _id');
          done();
          }
        });
      }
     })
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server).post("/api/books").send({title:"this is midos title"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            assert.equal(res.status, 200);
            assert.isObject(res.body);
            assert.property(res.body, 'title');
            assert.equal(res.body.title, 'this is midos title');
            assert.property(res.body, '_id');
            done();
          }
        })
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server).post("/api/books").send({}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            assert.equal(res.status, 200);
            assert.isString(res.text);
            assert.equal(res.text, 'missing required field title');
          }
          done();
        })
      });
      
    });


    suite('GET /api/books => array of books', function(){
   
      test('Test GET /api/books',function(done){
         chai.request(server).post("/api/books").send({ title: 'Faux Book A' }).end((err,res)=>{
          if(err){
            console.error(err)
          }else{
            chai.request(server).post("/api/books").send({ title: 'Faux Book B' }).end((err,res)=>{
              if(err){
                console.error(err)
              }else{
                chai.request(server).post("/api/books").send({ title: 'Faux Book C' }).end((err,res)=>{
                  if(err){
                    console.error(err)
                  }else{
                    chai.request(server).get("/api/books").end((err,res)=>{
                      if(err){
                        console.error(err);
                      }else{
                        assert.isArray(res.body);
                        assert.isAtLeast(res.body.length, 3);
                        res.body.forEach((book) => {
                        assert.isObject(book);
                        assert.property(book, 'title');
                        assert.isString(book.title);
                        assert.property(book, '_id');
                        assert.property(book, 'commentcount');
                        assert.isNumber(book.commentcount);
                      });
                      done();
                      }
                    })
                  }
              })
              }
          })
         }
       })
     })
     
    suite('GET /api/books/[id] => book object with [id]', function(done){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server).get("/api/books/"+"5f665eb46e296f6b9b6a504d").end((err,res)=>{
          if(err){
            console.error(err)
          }else{
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
          }
          done();
        })
      });
      
      test('Test GET /api/books/[id] with valid id in db',function(done){
        let bookId="";
        chai.request(server).post("/api/books/").send({title:"just to get the book id"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            bookId=res.body._id
            chai.request(server).get("/api/books/"+bookId).end((err,res)=>{
              if(err){
                console.error(err);
              }else{
              assert.isObject(res.body);
              assert.property(res.body, 'title');
              assert.equal(res.body.title, 'just to get the book id');
              assert.property(res.body, 'comments');
              assert.isArray(res.body.comments);
            }
            done();   
            })
          }
        })
      });
    });
  

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server).post("/api/books").send({title:"book to work with on comments"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            let bookId=res.body._id;
            chai.request(server).post("/api/books/"+bookId).send({comment:"add this comment"}).end((err,res)=>{
              if(err){
                console.error(err);
              }else{
                assert.isObject(res.body);
                assert.property(res.body, '_id');
                assert.property(res.body, 'title');
                assert.property(res.body, 'comments');
                assert.lengthOf(res.body.comments, 1);
                assert.isString(res.body.comments[0]);
                assert.equal(res.body.comments[0],"add this comment");
              }
              done();
            })
          }
        })
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server).post("/api/books").send({title:"to test without comment"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            let bookId=res.body._id;
            chai.request(server).post("/api/books/"+bookId).send({}).end((err,res)=>{
              if(err){
                console.error(err);
              }else{
                assert.isString(res.text);
                assert.equal(res.text, 'missing required field comment');
              }
              done();
            })
          }
        })
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        let bookId="5f665eb46e296f6b9b6a504d";
        chai.request(server).post("/api/books/"+bookId).send({comment:"this comment for the invalid id"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
          }
          done();
        })
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server).post("/api/books/").send({title:"the book meant for delete"}).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            let bookId=res.body._id;
            chai.request(server).delete("/api/books/"+bookId).end((err,res)=>{
              if(err){
                console.error(err);
              }else{
                assert.isString(res.text);
                assert.equal(res.text, 'delete successful');
              }
              done();
            })
          }
        })
      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        let bookId="5f665eb46e296f6b9b6a504d";
        chai.request(server).delete("/api/books/"+bookId).end((err,res)=>{
          if(err){
            console.error(err);
          }else{
            assert.isString(res.text);
            assert.equal(res.text, 'no book exists');
          }
          done();
        })
      });

    });
  suite("DELETE for all books in the dataBase on /api/books",function(){
    test("delete all books in the database",function(done){
      chai.request(server).delete("/api/books").end((err,res)=>{
        if(err){
          console.error(err);
        }else{
          assert.isString(res.text);
          assert.equal(res.text, 'complete delete successful');
        }
        done();
      })
    })
  })
  });

});
})
