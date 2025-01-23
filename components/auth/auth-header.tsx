"use client";

interface HeaderProps {
  label: string;
  title: string;
}

import React from "react";

const AuthHeader = ({ label, title }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground text-sm"></p>
    </div>
  );
};

export default AuthHeader;
