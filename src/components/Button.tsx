import React, { MouseEvent } from "react";
import { useNavigationContext } from "./NavigationContext";

interface Props {
  to?: string;
  label?: string;
  onClick?: (e: MouseEvent) => void;
}

export const Button: React.FC<Props> = ({ to, label, onClick }) => {
  const { goToPage } = useNavigationContext();
  return (
    <button
      className="button is-primary"
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
