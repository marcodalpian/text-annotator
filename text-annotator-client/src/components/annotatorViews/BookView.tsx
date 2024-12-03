import { FC } from 'react';
import ReactHtmlParser from 'react-html-parser';
import "../../css/app.css";
import "../../css/bookView.css";

interface LoginProps {
  bookContent: string;
}

export default function BookView(props: LoginProps): ReturnType<FC>  {
  return ( //Returns Text Annotator infos and the current text
    <div className="bookView">
      <div className='introductionTop'>        
        <h3 className='h3Presentation'>View, Add, Modify, Delete and Comment notes on this text.</h3>
      </div>
      <div className='introduction'>        
        <h3 className='h3Note'>Please note that:</h3>
        <li className='list1'>You cant select text which ends with a new line.</li>
        <li className='list2'>You cant select an image which is not wrapped by text.</li>
      </div>
      <div id="bookDiv">{ReactHtmlParser(props.bookContent)}</div>    
    </div>
  );
}