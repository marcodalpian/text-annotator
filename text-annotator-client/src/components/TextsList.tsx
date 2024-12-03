import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import "../css/app.css";

interface TextsListProps {
  setBookID: Function;
  setTitle: Function;
  setContent: Function;
  setUsername: Function;
  renderPage: Function;
}

export default function Login(props: TextsListProps): ReturnType<FC>  {

  type Book = { id: string; title: string; content: string};

  const[books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    fetchBooks();
  },[]);

  //GETS all the books data
  async function fetchBooks() {
    try {
      const response = await axios.get('http://localhost:3000/annotator/books');
      const booksAPI = response.data;
      console.log('List of books:', booksAPI);
      setBooks(booksAPI);
    } catch (error) {
       console.error('Error fetching books!');
    }
  }

  //Changes the rendered page to login
  function backToLogin(){
    props.setUsername("");
    props.renderPage("Login");
  }

  //Sets the current book data and changes the rendered page to text annotator
  function openAnnotator(id: string, title: string, content: string){
    props.setBookID(id); 
    props.setTitle(title); 
    props.setContent(content);
    props.renderPage("TextAnnotator");
  }

  return ( //Returns the texts list
    <>
      <button style={{marginLeft: "3cap", marginTop: "3cap"}} className="buttonBack" onClick={backToLogin}>
        <img style={{width: 26}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABlklEQVR4nO3dvUoDYRSE4S8W/oBtinMIpNlqblRBkHRaeREWwTuysRAVLCNLGjvLWTPvA+ksDjPDKsKSMQAAABBsmqaLqrqrqrfu/qqqh81mc+W+Kyb87t539+H3p6oe3bfFht/Hz4f7vuTwD1X17r4xNvw+FnDvvjM2/O7ezz/nvvXkSDqvquc/wn/ZbreX7ltPjgif8COJ5RN+JLF8wo8klk/4kcTyCT+SWD7hRxLLJ/xIYvmEH0ksn/AjieUTfiSxfMKPJJZP+JHE8gk/klg+4UcSyyf8SCzfiPCNeDPFrLtveS3IqLtfeS3IiALMuvuGR5ARv4QXgD9DF4ASFoASFkD8M85PlOAnSvATJfiJEvxECX6iBD9Rgp8owU+U4CdK8BMl+IkS/EQJfqIEP1GCnyjBT5TgJ0rwEyX4iRL8RAl+ogQ/UYKfKMFPlOAnSvATJfiJEvxECX4TX+T2b0rYue9ML+FzjLFy3xlbQlV9jzHO3Dcmf6Hzk/u2tBJ282NnXv4c/nq9vnbflWjFcx8AgHH6fgD4Cc1OfmBPQgAAAABJRU5ErkJggg==" alt="back"/>
      </button>
      <div className='booksMenu'>
        <h1>Texts</h1>
        {books.map(book => ( <button key={book.id} className='bookButton' onClick={() => openAnnotator(book.id, book.title, book.content)}>{book.title}</button>))}
      </div>
    </>
  );
}

