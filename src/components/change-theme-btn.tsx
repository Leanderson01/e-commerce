"use client"

import { useTheme } from "next-themes";
import { Button } from "./ui/button";

function ChangeThemeBtn() {
  const { setTheme, theme } = useTheme();

  return (
    <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
      Change Theme to ({theme})
    </Button>
  );
}

export default ChangeThemeBtn;
