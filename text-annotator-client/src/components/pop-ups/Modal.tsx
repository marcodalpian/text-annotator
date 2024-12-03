import { FC, ReactElement } from "react";
import '../../css/modal.css';
 
interface ModalProps {
  open: boolean;
  children: ReactElement;
}

export default function Modal(props: ModalProps): ReturnType<FC> {
  return ( //Returns or hides the modal
    <div className={`${"modal"} ${props.open ? "display-block" : "display-none"}`}>
      <div className="modal-main">
        {props.children}
      </div>
    </div>
  );
}