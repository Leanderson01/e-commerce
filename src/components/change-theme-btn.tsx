"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

function ChangeThemeBtn() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Só executa após a montagem do componente no cliente
  useEffect(() => {
    setMounted(true);
  }, []);

  // Evita renderização do valor do tema no servidor
  const buttonText = mounted ? `Change Theme to (${theme})` : "Change Theme";

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      {buttonText}
    </Button>
  );
}

export default ChangeThemeBtn;
