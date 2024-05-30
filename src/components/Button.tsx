import classNames from "classnames";
import React, { MouseEvent } from "react";
import { useNavigationContext } from "./NavigationContext";

interface Props {
  to?: string;
  label?: string;
  onClick?: (e: MouseEvent) => void;
  classes?: string;
}

export const Button: React.FC<Props> = ({ to, label, onClick, classes }) => {
  const { goToPage } = useNavigationContext();
  return (
    <button
      className={classNames("button is-primary", classes)}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
        if (to) {
          goToPage(to);
        }
      }}
    >
      {label || to}
    </button>
  );
};
