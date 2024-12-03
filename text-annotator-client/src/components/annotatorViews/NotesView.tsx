import React, { FC, useState } from 'react';
import "../../css/app.css";
import "../../css/notesView.css";
import profilePicture from "../../images/blank-profile-picture.png";

interface NotesViewProps {
  sessionNotes: any[];
  notes: any[];
  sessionName: string;
  sessionColor: string;
  recogito: any;
  setShowModalSession: Function;
  setSessionNameWarning: Function;
  toggleModalSaveSession: Function;
  toggleModalDeleteSession: Function;
  filteredAuthors: string[];
  filteredSessions: string[];
  paintText: Function;
}

export default function NotesView(props: NotesViewProps): ReturnType<FC>  {

  const [filterAuthor, setFilterAuthor] = useState<string>("Select...");
  //Filters the annotations on the current text based on the selected author, and the already selected session
  function filterAnnotationsByAuthor(e: React.ChangeEvent<HTMLSelectElement>){
    setFilterAuthor(e.target.value);
    props.recogito.clearAnnotations();
    props.sessionNotes.map(nota => props.recogito.addAnnotation(nota));
    props.paintText(props.sessionNotes, true);
    let filteredNotes = props.notes.filter(note => (note.body[0].username===e.target.value || e.target.value==="Select...") && (note.session[0].name===filterSession || filterSession==="Select..."));
    filteredNotes.map(nota => props.recogito.addAnnotation(nota));
    props.paintText(filteredNotes, true);
  }

  const [filterSession, setFilterSession] = useState<string>("Select...");
  //Filters the annotations on the current text based on the selected session, and the already selected author
  function filterAnnotationsBySession(e: React.ChangeEvent<HTMLSelectElement>){
    setFilterSession(e.target.value);
    props.recogito.clearAnnotations();
    props.sessionNotes.map(nota => props.recogito.addAnnotation(nota));
    props.paintText(props.sessionNotes, true);
    let filteredNotes = props.notes.filter(note => (note.body[0].username===filterAuthor || filterAuthor==="Select...") && (note.session[0].name===e.target.value || e.target.value==="Select..."));
    filteredNotes.map(nota => props.recogito.addAnnotation(nota));
    props.paintText(filteredNotes, true);
  }

  //Clears all filters
  function resetFilters(){
    props.recogito.clearAnnotations();
    props.sessionNotes.map(note => props.recogito.addAnnotation(note));
    props.paintText(props.sessionNotes, true);
    props.notes.map(note => props.recogito.addAnnotation(note));
    props.paintText(props.notes, true);
    setFilterSession("Select...");
    setFilterAuthor("Select...");
    (document.getElementById("filterAuthor") as HTMLInputElement).value = "Select...";
    (document.getElementById("filterSession") as HTMLInputElement).value = "Select...";
  }

  return ( //Returns the session notes and all the public notes
    <div className='notesView'> 
      <div style={{display: 'flex'}}>
        <h1 style={{marginRight: "0.3cap"}}>Your Session</h1>
        {props.sessionNotes.length!==0 ? 
          <div className='floppySettingsDiv'>
            {props.sessionName!=="" && props.sessionColor!=="" ?
              <>
                <button className="sessionIcons" onClick={() => {props.setShowModalSession(true); props.setSessionNameWarning(false)}}>
                  <img style={{width: 26}} src="data:image/png;base64,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" alt="settings--v1"/>              
                </button>
                <button className="sessionIcons" onClick={() => props.toggleModalSaveSession()}>
                  <img style={{width: 26}} src="data:image/png;base64,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" alt="upload-2"/>
                </button>
              </>
            : 
              <>
                <button className="sessionIcons" onClick={() => {props.setShowModalSession(true); props.setSessionNameWarning(false)}}>
                  <img style={{width: 26}} src="data:image/png;base64,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" alt="settings--v1"/>              
                  <span className='badge'>!</span>
                </button>
                <button className="sessionIconsSave">
                  <img style={{width: 26}} src="data:image/png;base64,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" alt="upload-2"/>
                </button>
              </>
            }  
            <button className="sessionIconsTrash" onClick={() => props.toggleModalDeleteSession()}>
              <img style={{width: 26}} src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAACXBIWXMAAAsTAAALEwEAmpwYAAADA0lEQVR4nO2dPYtTQRiFxw9QC6toMudM3IjEv6AWIoIg9iKyVqudhQjCYmMhFouFnTYWsp2CbC2Ighb7EyxdFBTBwkYQEZaNXIggkom58Sb7zut54O1Cbs55bnLnkpAJQQghhBBCCCGEEEIIMRNijAdJXiS5DOBm3SF5JaV0VHr+kW63uw/AAwA/SA4amGcAFiRmCvr9/h6S6w2J+H0+t9vtI5JSE5IrM5Dxa9YlpAa9Xm8vya8zFDJIKZ2QlAmJMZ6apYzh3JKQCQFwaVSJAL4DeFFzPmWEPJSQCSG5lCnxXd0SAaxm5K5KiITMld3VcrKJIbmcOas/TPFca5l321pTr7fVau0P1uh0OofncCEeGJ2lYA0JMYaEGENCjCEhxpAQ48ve3IoEwGJTy832HGaSHCaXvX+SC5JSOh0Kgk5yuAlCJzncBKGTHG6C0EkON0HoJIebIHSSw00QOsnhJgid5KgdBMDJzA/dFnPHGPPjuIWmjvE/C7mduSN+VdIxzGKxLEiIrbIgIbbKgoTYKgsSYqssSIitsiAhtsqChNgqCxJiqyxIiK2yICG2yoKE2CoLEmKrLEiIrbIgIbbKgoTYKgsSYqssSIitsiAhtsqChNgqCxJiqyxIiK2yICG2yoKE2CoLEmKrLEiIrbIgIbbKgoTYKgsSYqssSIitsiAhtsqChNgqCxJSq6zrJDdGzOMxQkY9fiOldLzBY9SSbhYvQegkh5sgdJLDTRA6yeEmCJ3kcBOETnK4CUInOaog30YFiTGeD4UA4EBOSLfbPRZKAsDb0v9zneTlMUJSKAkATzJhtkjeCCHsDIYBcBbAl8xJ9TGEsCOURErpQu7sGoaqwr6eYvuJWc9Lku/HvXaS90OB7CL55i/BBqVNtUFZsXtYkTxDcnO7S2SzU/bOPACuDa8bHt4dT4u7dozZwmjkMphlzBaAe9XHcPACyUMAHhUmZpPk8+LuOeru3hljPEfyKoA7JO8am5Xqe5PqBrba8nW7+xJCCCGEEEIIIYQQIhjiJzbdiKOKzh+tAAAAAElFTkSuQmCC" alt="trash"/>
            </button>
          </div> 
        : null}
      </div>
      {props.sessionNotes.length!==0 ?
        <>           
          {props.sessionNotes.map((note) => ( 
            <div style={{backgroundColor: props.sessionColor}} className="noteCard" key={note.id}> 
              <div style={{display: 'flex'}}>
                <section className="authorNote">
                  <img style={{width: "1.5cap", borderRadius: "50%"}} src={profilePicture} alt='profileimage'/>
                  &nbsp;{note.body[0].username}
                </section>
                <button style={{flex: 0.1, height: "2.5cap"}} className='buttons' onClick={() => props.recogito.selectAnnotation(note)}>Edit</button>
              </div>
              <div className='noteDiv'>
                <section style={{whiteSpace: "pre-line"}}>{note.body[0].value.substring(note.body[0].value.indexOf(":")+1)}</section>                
              </div>             
              <b>Text reference:</b>
              <div className='noteDiv'>
              <section className="cardText">{note.target.selector[0].exact}</section>
              </div>
              {note.body[1]!==undefined ?
                <b>Comments:</b>
                : null}
              {note.body.slice(1).map((commento: any) => <div key={commento.id}>
                <section>
                  <img style={{width: "1.5cap", borderRadius: "50%"}}  src={profilePicture} alt='profileImage'/>
                  &nbsp;{commento.username}           
                </section>
                <div className='commentsDiv'>
                  <section style={{whiteSpace: "pre-line"}}>{commento.value.substring(commento.value.indexOf(":")+1)}</section>
                </div>
              </div>)}
            </div>           
          ))}  
        </>
        : 
        <h3 className='sessionNoNotes'>Still no annotations in your session.</h3>
      }  
      <h1 className='allAnnotationsTitle'>All Annotations</h1>
      <b>Filters:</b>
      <section className='filterSection'>
        Author:&nbsp;
        <select id="filterAuthor" name="filterAuthor" defaultValue={"Select..."} onChange={filterAnnotationsByAuthor}>
          <option value={"Select..."}>Select...</option>
          {props.filteredAuthors.map(author => <option key={author} value={author}>{author}</option>)}
        </select>
      </section><br/>
      <section className='filterSection'>
        Session:&nbsp;
        <select id="filterSession" name="filterSession" defaultValue={"Select..."} onChange={filterAnnotationsBySession}>
          <option value={"Select..."}>Select...</option>
          {props.filteredSessions.map(session => <option key={session} value={session}>{session}</option>)}
        </select>
      </section><br/>
      {filterAuthor!=="Select..." || filterSession!=="Select..." ? 
        <button className='buttons' onClick={resetFilters}>Clear filters</button>
      : null}
      {props.notes.length!==0 ?
        <>           
          {props.notes.map((note) => ((note.body[0].username===filterAuthor || filterAuthor==="Select...") && (note.session[0].name===filterSession || filterSession==="Select...") ? 
            <div style={{backgroundColor: note.session[0].color}} className="noteCard" key={note.id}>
              <div style={{display: 'flex'}}>
                <section className="authorNote">
                  <img style={{width: "1.5cap", borderRadius: "50%"}} src={profilePicture} alt='profileimage'/>
                  &nbsp;{note.body[0].username}
                </section>
                <button style={{flex: 0.1, height: "2.5cap"}} className='buttons' onClick={() => props.recogito.selectAnnotation(note)}>Edit</button>
              </div>
              <div className='noteDiv'>
                <section style={{whiteSpace: "pre-line"}}>{note.body[0].value.substring(note.body[0].value.indexOf(":")+1)}</section>
              </div> 
              <b>Text reference:</b>
              <div className='noteDiv'>
              <section className="cardText">{note.target.selector[0].exact}</section>
              </div>  
              <b> Session: </b>  
              <div className="noteDiv">
                <section><label> Name: </label>{note.session[0].name}</section>
                {note.session[0].description!=="" ? 
                  <section><label>Description: </label>{note.session[0].description}</section>
                :
                  null
                }
                <section><label>Creation: </label>{note.session[0].date.slice(8,10)+note.session[0].date.slice(4,8)+note.session[0].date.slice(0,4)+" "+note.session[0].date.slice(11,16)}</section>
              </div>          
              {note.body[1]!==undefined ?
                <b>Comments:</b>
                : null}
              {note.body.slice(1).map((commento: any) => <div key={commento.id}>
                <section>
                  <img style={{width: "1.5cap", borderRadius: "50%"}} src={profilePicture} alt='profileImage'/>
                  &nbsp;{commento.username}           
                </section>
                <div className='commentsDiv'>
                  <section style={{whiteSpace: "pre-line"}}>{commento.value.substring(commento.value.indexOf(":")+1)}</section>
                </div>
              </div>)}
            </div>           
          :
          null))}  
        </>
        : 
        <h3>Still no annotations for this book.</h3>
      }
    </div>
  );
}