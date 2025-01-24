"use client";

import { logout } from "@/actions/logout";
import React from "react";

interface LogoutButtonProps {
  children?: React.ReactNode;
}

const LogoutButton = ({ children }: LogoutButtonProps) => {
  const onBtnClick = () => {
    logout();
  };
  return (
    <span className="cursor-pointer" onClick={onBtnClick}>
      {children}
    </span>
  );
};

export default LogoutButton;
