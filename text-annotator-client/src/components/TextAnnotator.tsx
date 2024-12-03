import { useState, FC, useEffect } from 'react';
import axios from 'axios';
import { Recogito } from '@recogito/recogito-js';
import '@recogito/recogito-js/dist/recogito.min.css';
import Warning from './pop-ups/Warning';
import BookView from './annotatorViews/BookView';
import NotesView from './annotatorViews/NotesView';
import Modal from './pop-ups/Modal';
import "../css/app.css";
import "../css/modal.css";
const { v4: uuidv4 } = require('uuid');

interface TextAnnotatorProps {
  bookID: string;
  title: string;
  bookContent: string;
  userID: string;
  username: string;
  renderPage: Function;
}

export default function TextAnnotator(props: TextAnnotatorProps): ReturnType<FC>  {
  
  const [notes, setNotes] = useState<any[]>([]);
  const [sessionNotes, setSessionNotes] = useState<any[]>([]);
  const [recogito, setRecogito] = useState<any>();

  //Creates a new RecogitoJS instance
  useEffect(() => {
    setRecogito(new Recogito({content: document.getElementById('bookDiv'), widgets: [{ widget: 'COMMENT' }]}));
  },[]);

  //Sets recogito event handlers
  const [count, setCount] = useState<number>(0);
  useEffect(() => {
    if(count>0){
      recogito.on("createAnnotation", function(annotation: any) {     
        if(annotation.target.selector[0].exact!==""){ //checks if the user selected only an image, with no text
          annotation.body[0]={id: annotation.id, purpose: annotation.body[0].purpose, type: annotation.body[0].type, value: props.username.concat(": ", annotation.body[0].value), userID: props.userID, username: props.username, isComment: false}; //set body id, userID, username, isComment and value(with author)
          setSessionNotes((sessionNotes) => {
            var newNotes = [...sessionNotes];
            if(newNotes.length!==0){
              annotation.session={name: newNotes[0].session[0].name, description: newNotes[0].session[0].description, color: newNotes[0].session[0].color, date: newNotes[0].session[0].date, type: "draft"};
            } else {
              const date = new Date();
              date.setTime(date.getTime() + (1 * 60 * 60 * 1000)); 
              annotation.session={name: "", description: "", color: "", date: date, type: "draft"};
            }
            postNote(annotation);
            return newNotes;
          });
        } else {
          setImageWarning(true);
          setSessionWarning(false);
          setAuthorizationWarning(false);
          setBodyWarning(false);
          setSessionNameWarning(false);
          setColorWarning(false);
          recogito.destroy();
          setRecogito(new Recogito({ content: document.getElementById('bookDiv'), widgets: [{ widget: 'COMMENT' }]}))
          fetchNotes();
        } 
      });
      
      recogito.on('updateAnnotation', function(annotation: any, previous: any) {
        let isAuthorized: boolean = true;
        for(let i=0; i<previous.body.length; i++){
          if(!annotation.body.some((body: any) => body.value===previous.body[i].value)){
            if(previous.body[i].userID!==props.userID){
              isAuthorized=false;
              break;
            }
          }
        }
        let isBodyOk: boolean = true;
        for(let i=0; i<previous.body.length; i++){
          if(previous.body[i].value.substring(0, previous.body[i].value.indexOf(":")+1)!==annotation.body[i].value.substring(0, previous.body[i].value.indexOf(":")+1)){
            isBodyOk=false;
            break;
          }
        }
        if(isAuthorized && isBodyOk){
          if(annotation.body.length>previous.body.length){ //set comments author & isComment & value+author
            annotation.body[annotation.body.length-1]={id: uuidv4(), purpose: annotation.body[annotation.body.length-1].purpose, type: annotation.body[annotation.body.length-1].type, value: props.username+": "+annotation.body[annotation.body.length-1].value, userID: props.userID, username: props.username, isComment: true};
          }
          if(annotation.body[0].isComment){
            deleteNote(annotation.id);
          } else {
            modifyNote(annotation.id, annotation.body, annotation.session[0]);
          }
        } else if(!isAuthorized){
          fetchNotes();
          setAuthorizationWarning(true);
          setSessionWarning(false);
          setBodyWarning(false);
          setImageWarning(false);
          setSessionNameWarning(false);
          setColorWarning(false);
        } else if(!isBodyOk){
          fetchNotes();
          setBodyWarning(true);
          setSessionWarning(false);
          setAuthorizationWarning(false);
          setImageWarning(false);
          setSessionNameWarning(false);
          setColorWarning(false);
        } 
      });

      recogito.on('deleteAnnotation', function(annotation: any) {
        if(annotation.body[0].userID===props.userID){
          deleteNote(annotation.id)
        } else {
          fetchNotes();
          setAuthorizationWarning(true);
          setSessionWarning(false);
          setBodyWarning(false);
          setImageWarning(false);
          setSessionNameWarning(false);
          setColorWarning(false);
        }
      });
    
      recogito.on('selectAnnotation', function(a: any) {
        console.log('selected', a);
      });

      if(count===1){ //Sets session time elapsed
        fetchNotes().then(()=>{
          setSessionNotes((sessionNotes) => {
            var tempSess = [...sessionNotes];
            if(tempSess.length!==0){ 
              let elapsed = new Date().getTime() - (new Date(tempSess[0].session[0].date).getTime()-(1 * 60 * 60 * 1000));
              var ms = (elapsed) % 1000;
              elapsed = (elapsed - ms) / 1000;
              var secs = elapsed % 60;
              elapsed = (elapsed - secs) / 60;
              var mins = elapsed % 60;
              var hrs = (elapsed - mins) / 60;
              if(mins>0 && !sessionWarningClosed){
                setSessionTimeElapsed(hrs + 'h:' + mins + 'm');
                setSessionWarning(true);
                setAuthorizationWarning(false);
                setBodyWarning(false);
                setImageWarning(false);
                setSessionNameWarning(false);
                setColorWarning(false);
              }  
            }
            return tempSess;
          });
        });
      }
    } 
    setCount(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[recogito]);

  //API CALLS//

  //GETS all notes from the current text
  async function fetchNotes() {
    try {
      await axios.get('http://localhost:3000/annotator/'+props.bookID).then(response => {
        const notesAPI = response.data;
        console.log('List of notes:', notesAPI);
        var tempSessionNotes:any[] = [];
        var tempNotes:any[] = [];
        recogito.clearAnnotations();
        for(let i=0; i<notesAPI.length; i++){        
          if(notesAPI[i].session.type==="final"){
            tempNotes.push({body: notesAPI[i].body, bookID: notesAPI[i].bookID, id: notesAPI[i].id, session: [notesAPI[i].session], target: notesAPI[i].target, type: notesAPI[i].type});        
            recogito.addAnnotation(notesAPI[i]);
          } else if(notesAPI[i].body[0].userID===props.userID){
            tempSessionNotes.push({body: notesAPI[i].body, bookID: notesAPI[i].bookID, id: notesAPI[i].id, session: [notesAPI[i].session], target: notesAPI[i].target, type: notesAPI[i].type});        
            recogito.addAnnotation(notesAPI[i]);
          }
        }
        paintText(notesAPI, false);
        if(tempSessionNotes.length>0){
          let tempDate = tempSessionNotes[0].session[0].date;
          setSessionDate(tempDate.slice(8,10)+tempDate.slice(4,8)+tempDate.slice(0,4)+" "+tempDate.slice(11,16));
          setSessionName(tempSessionNotes[0].session[0].name);
          setSessionColor(tempSessionNotes[0].session[0].color);
          setSessionDescription(tempSessionNotes[0].session[0].description);
        }
        setSessionNotes(tempSessionNotes);
        setNotes(tempNotes);
        getAuthors(tempNotes);
        getSessions(tempNotes);
      });
    } catch (error) {
       console.error('Error fetching notes!');
    }
  }

  //Paints all the RecogitoJS notes on the text
  function paintText(notes: any, fromFilter: boolean){
    var recogitoElements = Array.from(document.getElementsByClassName('r6o-annotation') as HTMLCollectionOf<HTMLElement>)
    for(let i=0; i<notes.length; i++){   
      for(var j=0; j<recogitoElements.length; j++){
        if(fromFilter){
          if(recogitoElements[j].getAttribute("data-id")===notes[i].id && notes[i].session[0].color===""){
            recogitoElements[j].style.backgroundColor = "rgb(210, 210, 210)";
            recogitoElements[j].style.borderBottom = "2px solid rgb(130, 130, 130)";
          } else if(recogitoElements[j].getAttribute("data-id")===notes[i].id){
            recogitoElements[j].style.backgroundColor = notes[i].session[0].color.slice(0, notes[i].session[0].color.length-1)+", 0.7)";
            recogitoElements[j].style.borderBottom = "2px solid "+notes[i].session[0].color;
          }
        } else {
          if(recogitoElements[j].getAttribute("data-id")===notes[i].id && notes[i].session.color===""){
            recogitoElements[j].style.backgroundColor = "rgb(210, 210, 210)";
            recogitoElements[j].style.borderBottom = "2px solid rgb(130, 130, 130)";
          } else if(recogitoElements[j].getAttribute("data-id")===notes[i].id){             
            recogitoElements[j].style.backgroundColor = notes[i].session.color.slice(0, notes[i].session.color.length-1)+", 0.7)";
            recogitoElements[j].style.borderBottom = "2px solid "+notes[i].session.color;
          }
        }
      }
    }
  }

  //POSTS a new note
  async function postNote(annotation: any) {
    try {
      await axios.post('http://localhost:3000/annotator/',{
        '@context': annotation.context,
        body: annotation.body,
        id: annotation.id,
        target: annotation.target,
        type: annotation.type,
        bookID: props.bookID,
        session: annotation.session
        }).then(response => {
          console.log(response.data);
          fetchNotes();
        });
    } catch (error) {
      console.error('Error posting note!');
    } 
  }

  //Modifies a note
  async function modifyNote(id: string, body: any, session: any){
    let putURL: string = 'http://localhost:3000/annotator/'+id.replace("#", "");
    try {
      await axios.put(putURL,{
        newBody: body,
        session: session}).then(response => {
        console.log(response.data);
        fetchNotes();
      });
    } catch (error) {
      console.error('Error modifying note!');
    }    
  }

  //DELETES a note
  async function deleteNote(id: string) {
    let deleteURL: string = 'http://localhost:3000/annotator/'+id.replace("#", "");
    try {
      await axios.delete(deleteURL).then(response => {
        console.log(response.data);
        fetchNotes();
      });
    } catch (error) {
       console.error('Error deleting note!');
    }
  }

  //DELETES a session
  async function deleteSession() {
    setShowModalDeleteSession(false);
    setSessionWarning(false);
    let deleteURL: string = 'http://localhost:3000/annotator/session/'+props.userID+"/"+props.bookID;
    try {
      await axios.delete(deleteURL).then(response => {
        console.log(response.data);
        fetchNotes();
      });
    } catch (error) {
       console.error('Error deleting session!');
    }
  }

  //WARNINGS//
  const [sessionWarning, setSessionWarning] = useState<boolean>(false);
  const [sessionWarningClosed, setSessionWarningClosed] = useState<boolean>(false);
  const [authorizationWarning, setAuthorizationWarning] = useState<boolean>(false);
  const [bodyWarning, setBodyWarning] = useState<boolean>(false);
  const [imageWarning, setImageWarning] = useState<boolean>(false);
  const [sessionNameWarning, setSessionNameWarning] = useState<boolean>(false);
  const [colorWarning, setColorWarning] = useState<boolean>(false);

  //SESSION & MODAL//
  const [showModalSession, setShowModalSession] = useState<boolean>(false);
  const [showModalDeleteSession, setShowModalDeleteSession] = useState<boolean>(false);
  const [showModalSaveSession, setShowModalSaveSession] = useState<boolean>(false);

  const [sessionName, setSessionName] = useState<string>("");
  const [sessionDescription, setSessionDescription] = useState<string>("");
  const [sessionColor, setSessionColor] = useState<string>("");
  const [sessionDate, setSessionDate] = useState<string>("");

  const [sessionTimeElapsed, setSessionTimeElapsed] = useState<string>("");
  
  const handleChangeSessionName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSessionName(evt.target?.value);
  };

  const handleChangeSessionDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setSessionDescription(evt.target?.value);
  };

  function toggleModalSaveSession() {
    setShowModalSaveSession(!showModalSaveSession);
  }

  function toggleModalDeleteSession() {
    setShowModalDeleteSession(!showModalDeleteSession);
  }

  //Changes session's color
  function changeColor(newColor: string){
    let alreadyPickedColor: boolean = false;
    // eslint-disable-next-line array-callback-return
    notes.map(note => {
      if(note.session[0].color===newColor){
        alreadyPickedColor = true;
      }
    });
    if(alreadyPickedColor){
      setColorWarning(true);
      setSessionWarning(false);
      setAuthorizationWarning(false);
      setBodyWarning(false);
      setImageWarning(false);
      setSessionNameWarning(false);
    } else {
      setColorWarning(false);
    }
    setSessionColor(newColor);
  }

  //Opens the modals to save the session
  function saveSessionFromWarning(){
    if(sessionColor!=="" && sessionName!==""){
      toggleModalSaveSession();
      setSessionWarning(false);
    } else {
      setShowModalSession(true);
      setSessionWarning(false);
    }
  }

  //Saves and closes the current session
  function saveSessionFinal() {
    if(notes.some(note => note.session[0].name === sessionName)){ 
      setSessionNameWarning(true);
      setSessionWarning(false);
      setAuthorizationWarning(false);
      setBodyWarning(false);
      setImageWarning(false);
      setColorWarning(false);
      setShowModalSaveSession(false);
    } else {
      const date = new Date();
      date.setTime(date.getTime() + (1 * 60 * 60 * 1000)); 
      for(let i=0; i<sessionNotes.length; i++){
        modifyNote(sessionNotes[i].id, sessionNotes[i].body, {name: sessionName, description: sessionDescription, color: sessionColor, date: date, type: "final"});
      }
      setSessionName("");
      setSessionColor("");
      setShowModalSession(false);
      setShowModalSaveSession(false);
      setSessionWarning(false);
      setSessionNameWarning(false);
      setColorWarning(false);
    }
  }

  //Saves the session datas
  function saveSessionData() {
    for(let i=0; i<sessionNotes.length; i++){
      modifyNote(sessionNotes[i].id, sessionNotes[i].body, {name: sessionName, description: sessionDescription, color: sessionColor, date: sessionNotes[i].session[0].date, type: "draft"});
    }
    setShowModalSession(false);
  }

  //FILTERS//
  const [filteredAuthors, setFilteredAuthors] = useState<string[]>([]);
  //Gets all the authors usernames from the notes on the current text
  function getAuthors(tempNotes: any){
    let authors: string[]=[];
    for(let i=0; i<tempNotes.length; i++){
      if(!authors.some(author => author===tempNotes[i].body[0].username)){
        authors.push(tempNotes[i].body[0].username);
      }
    }
    setFilteredAuthors(authors);
  }

  const [filteredSessions, setFilteredSessions] = useState<string[]>([]);
  //Gets all the sessions names from the notes on the current text
  function getSessions(tempNotes: any){
    let sessions: string[]=[];
    for(let i=0; i<tempNotes.length; i++){
      if(!sessions.some(session => session===tempNotes[i].session[0].name)){
        sessions.push(tempNotes[i].session[0].name);
      }
    }
    setFilteredSessions(sessions);
  }

  return ( //Returns the navigation bar, notes view, book view, modals and warnings
    <>

      <div className="topBar">
        <button className="buttonBack" onClick={() => props.renderPage("TextsList")}>
          <img style={{width: 26}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABlklEQVR4nO3dvUoDYRSE4S8W/oBtinMIpNlqblRBkHRaeREWwTuysRAVLCNLGjvLWTPvA+ksDjPDKsKSMQAAABBsmqaLqrqrqrfu/qqqh81mc+W+Kyb87t539+H3p6oe3bfFht/Hz4f7vuTwD1X17r4xNvw+FnDvvjM2/O7ezz/nvvXkSDqvquc/wn/ZbreX7ltPjgif8COJ5RN+JLF8wo8klk/4kcTyCT+SWD7hRxLLJ/xIYvmEH0ksn/AjieUTfiSxfMKPJJZP+JHE8gk/klg+4UcSyyf8SCzfiPCNeDPFrLtveS3IqLtfeS3IiALMuvuGR5ARv4QXgD9DF4ASFoASFkD8M85PlOAnSvATJfiJEvxECX6iBD9Rgp8owU+U4CdK8BMl+IkS/EQJfqIEP1GCnyjBT5TgJ0rwEyX4iRL8RAl+ogQ/UYKfKMFPlOAnSvATJfiJEvxECX4TX+T2b0rYue9ML+FzjLFy3xlbQlV9jzHO3Dcmf6Hzk/u2tBJ282NnXv4c/nq9vnbflWjFcx8AgHH6fgD4Cc1OfmBPQgAAAABJRU5ErkJggg==" alt="back"/>
        </button>
        <h2 className='titleTop'>{props.title}</h2>
        <button className="buttonTop" onClick={() => document.getElementsByClassName("introduction")[0]!.scrollIntoView({ behavior: "smooth", block: "end", inline: "nearest" })}>
          <img style={{width: 26}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAAACXBIWXMAAAsTAAALEwEAmpwYAAABqklEQVR4nO3aO07DUBCF4SEFUNC6mGnSuJqVQkUketgDRZQVwQIiRGl0I1JAQy6xM/fxf1KaJLJmznFsFxEBAAAAAAAAAAAAAAAAkIzjeGNmD2b2rqpvZnaf3jt8iGW5+7WqvprZ9Ou1W6/Xt+QfE/5ECfHhT5QQH/5ECfHhT5QQH/5ECfM8am7/CHh7ynd4RF3mzN+lx86c7557UnTB/xEoJQSGf0QJZ/IZLiWUEBj+ESVk8gVuopRQQFDO01F8QE4J8cE4JcQH4pQQH4T3XkIJAXgBM4QoaXEvaJaLKHFhL3Cm7hb1gmfrZkGvYMbmF/OKZm12Ia9w5uYW8Ypnb2MBqXiHagdvYZfqBm5pp2oGbXG34gdsecdiB+th1+IG6mnnYgYJEL57+AAFCMuA8AOzIPzATAg/MJtT/5/f83/vxyUzMrMnwp+thI1kWpnZB2f+bCXsReRKMqxU9ZPLzjwlpCxTphmHE1HVF67585Sgqs+ZhxIZhuEulfD9S9ib2WPPN9zMEjYps5RdCj9lKWfIunbhR25kBwAAAAAAAAAAAAAAAAAA5IK+AJ7vzYXUSptjAAAAAElFTkSuQmCC" alt="collapse-arrow--v2"/>
        </button>
      </div>

      <div className='viewsSeparator'>
        
        <NotesView sessionNotes={sessionNotes} notes={notes} sessionName={sessionName} sessionColor={sessionColor} recogito={recogito} setShowModalSession={setShowModalSession} setSessionNameWarning={setSessionNameWarning} toggleModalSaveSession={toggleModalSaveSession} toggleModalDeleteSession={toggleModalDeleteSession} filteredAuthors={filteredAuthors} filteredSessions={filteredSessions} paintText={paintText} />
        
        <BookView bookContent={props.bookContent} />
        
      </div>

      <Modal open={showModalSession}>
        <>
          <div className="modal-head">
            <h1>Session Data</h1>
          </div>
          <div className="modal-body">
            <section className='sessionSection1'>
              {sessionName==="" ? <span className='badgeModal'>!</span> : null}
              Name:
            </section>
            <input
              className='input'
              onInput={handleChangeSessionName}
              placeholder="Add here a name for your session"
              value={sessionName}
            />
            <section className='sessionSection'>Description (optional):</section>
            <input
              className='input'
              onInput={handleChangeSessionDescription}
              placeholder="Add here a description for your session"
              value={sessionDescription}
            />
            <section className='sessionSection'>
              {sessionColor==="" ? <span className='badgeModal'>!</span> : null}
              Color:
            </section>
            <div>
              {sessionColor==="rgb(254, 243, 226)" ? <button className='colorPick1Picked'></button> : <button className='colorPick1' onClick={() => changeColor("rgb(254, 243, 226)")}></button> }
              {sessionColor==="rgb(252, 245, 150)" ? <button className='colorPick2Picked'></button> : <button className='colorPick2' onClick={() => changeColor("rgb(252, 245, 150)")}></button> }
              {sessionColor==="rgb(251, 210, 136)" ? <button className='colorPick3Picked'></button> : <button className='colorPick3' onClick={() => changeColor("rgb(251, 210, 136)")}></button> }
              {sessionColor==="rgb(255, 156, 115)" ? <button className='colorPick4Picked'></button> : <button className='colorPick4' onClick={() => changeColor("rgb(255, 156, 115)")}></button> }
              {sessionColor==="rgb(255, 69, 69)" ? <button className='colorPick5Picked'></button> : <button className='colorPick5' onClick={() => changeColor("rgb(255, 69, 69)")}></button> }
              {sessionColor==="rgb(175, 23, 64)" ? <button className='colorPick6Picked'></button> : <button className='colorPick6' onClick={() => changeColor("rgb(175, 23, 64)")}></button> }
            </div>
            <section className='sessionSection'>Creation date:</section>
            <label>{sessionDate}</label>
            <div className='buttonsModalDiv'>
              <button className='buttonsModal1' onClick={() => {setShowModalSession(false); setSessionColor(sessionNotes[0].session[0].color); setSessionName(sessionNotes[0].session[0].name); setSessionDescription(sessionNotes[0].session[0].description)}}>Cancel</button>
              <button style={{marginLeft: "195%"}} className='buttonsModal2' onClick={saveSessionData}>Save</button>
            </div>
          </div>
        </>
      </Modal>

      <Modal open={showModalSaveSession}>
        <>
          <div className="modal-head">
            <h1>Save and close session</h1>
          </div>
          <div className="modal-body">
            <section style={{textAlign: "center"}} className='sessionSection1'>Are you sure you want to publish and close your session to make it available to everyone?</section>
            <section style={{textAlign: "center"}} className='sessionSection1'>After this step, a new session will start.</section>
            <div className='buttonsModalDiv'>
              <button className='buttonsModal1' onClick={() => setShowModalSaveSession(false)}>Cancel</button>
              <button className='buttonsModal2' onClick={saveSessionFinal}>Save and close</button>
            </div>
          </div>
        </>
      </Modal>

      <Modal open={showModalDeleteSession}>
        <>
          <div className="modal-head">
            <h1>Delete Session</h1>
          </div>
          <div className="modal-body">
            <section style={{textAlign: "center"}} className='sessionSection1'>Are you sure you want to delete your session?</section>
            <div className='buttonsModalDiv'>
              <button style={{marginLeft: "-7px"}} className='buttonsModal1' onClick={toggleModalDeleteSession}>Cancel</button>
              <button style={{marginLeft: "195%"}} className='buttonsModal2' onClick={deleteSession}>Delete</button>
            </div>
          </div>
        </>
      </Modal>

      <Warning open={sessionWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>Your session was created {sessionTimeElapsed} ago. </section>
            <section>You are the only one who can see the notes in your session.</section>
            <section>
              <button onClick={saveSessionFromWarning} className="saveSessionWarning" style={{color: "blue", textDecoration: "underline", cursor: "pointer", backgroundColor: "transparent", borderColor: "transparent", padding: 0, borderWidth: 0, fontSize: "100%"}}>
                Save and close your session 
              </button>
              &nbsp;to make your notes available to everyone.
            </section>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setSessionWarning(false); setSessionWarningClosed(true)}}>x</button>
          </div>
        </div>
      </Warning>

      <Warning open={authorizationWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>You cant modify or delete notes or comments if you are not the one who created them.</section>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setAuthorizationWarning(false)}}>x</button>
          </div>
        </div>
      </Warning>

      <Warning open={bodyWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>You cant modify the name of the user.</section>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setBodyWarning(false)}}>x</button>
          </div>
        </div>
      </Warning>

      <Warning open={imageWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>You cant select an image which is not wrapped by text.</section>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setImageWarning(false)}}>x</button>
          </div>
        </div>
      </Warning>

      <Warning open={sessionNameWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>You used a session name which has already been used for another session.</section>
            <button onClick={() => {setShowModalSession(true); setSessionNameWarning(false)}} className="saveSessionWarning" style={{color: "blue", textDecoration: "underline", cursor: "pointer", backgroundColor: "transparent", borderColor: "transparent", padding: 0, borderWidth: 0, fontSize: "100%"}}>
              Change your session name 
            </button>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setSessionNameWarning(false)}}>x</button>
          </div>
        </div>
      </Warning>

      <Warning open={colorWarning}>
        <div className="sessionWarning">
          <div>
            <b className='warningB'>Warning!</b>
            <section>You selected a color which has already been used for another session.</section>
          </div>
          <div>
            <button className='escWarning' onClick={() => {setColorWarning(false)}}>x</button>
          </div>
        </div>
      </Warning>
      
    </>
  );
}