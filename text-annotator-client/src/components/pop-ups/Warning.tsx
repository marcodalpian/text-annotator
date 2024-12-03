import { useEffect, useState } from "react";
import { FC, ReactElement } from "react";
import "../../css/warning.css";

interface WarningProps {
  open: boolean;
  children: ReactElement;
}

export default function Warning(props: WarningProps): ReturnType<FC> {
  
  const [showWarning, setShowWarning] = useState<boolean>(false);
  useEffect(() => {
    if (props.open && !showWarning) {
      setShowWarning(true);
    } 
  }, [props.open, showWarning]);

  const openStyle = { 
    animation: "inAnimation 500ms ease-in" 
  };
  const closeStyle = {
    animation: "outAnimation 500ms ease-out",
    animationFillMode: "forwards"
  };

  return ( //Returns warning message with mount and unmount animation
    <div>
      {showWarning && (
        <div style={props.open ? openStyle : closeStyle}>{props.children}</div>
      )}
    </div>
  );
};