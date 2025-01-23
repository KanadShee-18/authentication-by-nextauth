"use client";

interface HeaderProps {
  headerLabel: string;
  title: string;
}

import React from "react";

const AuthHeader = ({ headerLabel, title }: HeaderProps) => {
  return (
    <div className="w-full flex flex-col gap-y-4 items-center justify-center">
      <h1 className="text-3xl font-semibold text-blue-500">{title}</h1>
      <p className="text-muted-foreground text-sm">{headerLabel}</p>
    </div>
  );
};

export default AuthHeader;
