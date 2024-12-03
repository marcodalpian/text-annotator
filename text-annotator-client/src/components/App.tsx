import { useState } from 'react';
import Login from './Login';
import TextsList from './TextsList';
import TextAnnotator from './TextAnnotator';
import "../css/app.css";

export default function App() {

  const[bookID, setBookID] = useState<string>("");
  const[title, setTitle] = useState<string>("");
  const[content, setContent] = useState<string>("");

  const[username, setUsername] = useState<string>("");

  const[showLogin, setShowLogin] = useState<boolean>(true);
  const[showAnnotator, setShowAnnotator] = useState<boolean>(false);
  const[showTextsList, setShowTextsList] = useState<boolean>(false);

  //Changes the rendered page
  function renderPage(pageName: string){
    setShowLogin(false);
    setShowTextsList(false);
    setShowAnnotator(false);
    if(pageName==="Login"){
      setShowLogin(true);
    } else if(pageName==="TextsList"){
      setShowTextsList(true);
    } else if(pageName==="TextAnnotator"){
      setShowAnnotator(true);
    }
  }

  //Returns login page/books list/text annotator
  return ( 
    <>
      {showLogin ? 
        <Login username={username} setUsername={setUsername} renderPage={renderPage} />
      : null}
      {showTextsList ? 
        <TextsList setBookID={setBookID} setTitle={setTitle} setContent={setContent} setUsername={setUsername} renderPage={renderPage} />
      : null}
      {showAnnotator ? 
        <TextAnnotator bookID={bookID} title={title} bookContent={content} userID={username} username={username} renderPage={renderPage} />
      : null}
    </>
  );
}