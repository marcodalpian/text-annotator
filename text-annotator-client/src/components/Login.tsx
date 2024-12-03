import React, { FC } from 'react';
import "../css/app.css";

interface LoginProps {
  username: string;
  setUsername: Function;
  renderPage: Function;
}

export default function Login(props: LoginProps): ReturnType<FC>  {

  const handleChangeSessionName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    props.setUsername(evt.target?.value);
  };

  //If the username is inserted, it changes the rendered page to texts list
  function confirmUsername(){
    if(props.username!==""){
      props.renderPage("TextsList");
    }
  }

  return ( //Returns the login page
    <>
      <div className='loginMenu'>
        <b style={{marginBottom: "1cap"}}>Username:</b>
        <input
          className='input'
          onInput={handleChangeSessionName}
          placeholder="..."
          value={props.username}
        />
        <button style={{marginTop: "3cap"}} className='buttons' onClick={confirmUsername}>Confirm</button>
      </div>
    </>
  );
}