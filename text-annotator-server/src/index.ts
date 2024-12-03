import express, { Request, Response } from 'express';
import cors from 'cors';
import { Note } from './models/note';
import { Book } from './models/book';
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const jsdom = require("jsdom");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

const allowedOrigins = ['http://localhost:3001'];
const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));
app.use(express.json());

//extract data from HTML files
const bookString1 = fs.readFileSync(path.resolve(__dirname, './books/book1.html'), 'utf8');
let book1: string = bookString1.substring(bookString1.indexOf("<body>")+6, bookString1.lastIndexOf("</body>"));
const bookDOM1 = new jsdom.JSDOM(bookString1);
let title1: string = bookDOM1.window.document.querySelector("head").textContent;

const bookString2 = fs.readFileSync(path.resolve(__dirname, './books/book2.html'), 'utf8');
let book2: string = bookString2.substring(bookString2.indexOf("<body>")+6, bookString2.lastIndexOf("</body>"));
const bookDOM2 = new jsdom.JSDOM(bookString2);
let title2: string = bookDOM2.window.document.querySelector("head").textContent;

const bookString3 = fs.readFileSync(path.resolve(__dirname, './books/book3.html'), 'utf8');
let book3: string = bookString3.substring(bookString3.indexOf("<body>")+6, bookString3.lastIndexOf("</body>"));
const bookDOM3 = new jsdom.JSDOM(bookString3);
let title3: string = bookDOM3.window.document.querySelector("head").textContent;

//Initialize books array
let books: Book[] = [
  {id: uuidv4(), title: title1, content: book1},
  {id: uuidv4(), title: title2, content: book2},
  {id: uuidv4(), title: title3, content: book3}
];

//Initialize notes array
let notes: Note[] = [];

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

//BOOKS

//get all books
app.get('/annotator/books', (req: Request, res: Response) => {
  res.json(books);
});

//get all notes from the requested book
app.get('/annotator/:bookID', (req: Request, res: Response) => {
  const bookNotes = notes.filter((t) => t.bookID === req.params.bookID);
  if (!bookNotes) {
    res.status(404).send('Notes not found');
  } else {
    res.json(bookNotes);
  }
});

//NOTES

//create a note
app.post('/annotator/', (req: Request, res: Response) => {
    notes.push({
      '@context': req.body.context,
      body: req.body.body,
      id: req.body.id,
      target: req.body.target,
      type: req.body.type,
      bookID: req.body.bookID,
      session: req.body.session});
    console.log("Note added: ", req.body.id)
    res.status(201).json("Note added");
});

//update a note 
app.put('/annotator/:id', (req: Request, res: Response) => {
  var note = notes.find((t) => t.id === "#"+req.params.id);
  if (!note) {
    res.status(404).send('Note not found');
  } else {
    note.body = req.body.newBody || note.body;
    note.session = req.body.session || note.session;
    console.log("Note updated: ", req.params.id)
    res.json(note);
  }
});

//delete a note
app.delete('/annotator/:id', (req: Request, res: Response) => {
  const index = notes.findIndex((t) => t.id === "#"+req.params.id);

  if (index === -1) {
    res.status(404).send('Note not found');
  } else {
    notes.splice(index, 1);
    console.log("Note deleted:", req.params.id);
    res.status(204).send();
  }
});

//SESSION

//delete a session
app.delete('/annotator/session/:userID/:bookID', (req: Request, res: Response) => {
  var notesToDelete: number[] = [];
  notes.forEach((t, index) => {  
    if((t.body[0].userID === req.params.userID) && (t.bookID === req.params.bookID) && (t.session.type==="draft")){
      notesToDelete.push(index);
    }
  });
  if (notesToDelete.length === 0) {
    res.status(404).send("Session not found");
  } else {
    for(let i=notesToDelete.length-1; i>=0; i--){
      notes.splice(notesToDelete[i], 1);
    }
    console.log("Session deleted for user: ", req.params.userID, ", book: ", req.params.bookID);
    res.status(204).send();
  }
});