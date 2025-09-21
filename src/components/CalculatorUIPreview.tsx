import React, { useEffect, useMemo, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  CssBaseline,
  Container,
  Stack,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
} from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { motion } from "framer-motion";

function getMuiTheme(mode: "light" | "dark") {
  return createTheme({
    palette: {
      mode,
      primary: { main: mode === "light" ? "#1976d2" : "#90caf9" },
      background: {
        default: mode === "light" ? "#f8fafc" : "#0a0a0a",
        paper: mode === "light" ? "#ffffff" : "#0f1115",
      },
      text: {
        primary: mode === "light" ? "#000000" : "#ffffff",
        secondary: mode === "light" ? "#666666" : "#cccccc",
      },
    },
    shape: { borderRadius: 16 },
    components: {
      MuiButton: {
        defaultProps: { size: "large" },
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 700,
            borderRadius: 14,
            fontSize: "1.25rem",
            backgroundColor: mode === "light" ? "#f0f0f0" : "#2a2a2a",
            color: mode === "light" ? "#000000" : "#ffffff",
            "&:hover": {
              backgroundColor: mode === "light" ? "#e0e0e0" : "#3a3a3a",
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: mode === "light" ? "#ffffff" : "#0f1115",
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            color: mode === "light" ? "#000000" : "#ffffff",
          },
        },
      },
    },
    typography: {
      fontFamily: "Inter, system-ui, Segoe UI, Arial, sans-serif",
    },
  });
}

function formatNumber(val: string) {
  if (val === "" || val === "-") return val;
  const [i, d] = val.split(".");
  const iFmt = Number(i).toLocaleString();
  return d !== undefined ? `${iFmt}.${d}` : iFmt;
}

export default function CalculatorUIPreview() {
  const [mode, setMode] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as
      | "light"
      | "dark"
      | null;
    const systemPrefersDark =
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedMode) {
      setMode(savedMode);
    } else if (systemPrefersDark) {
      setMode("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", mode === "dark");
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  const theme = useMemo(() => getMuiTheme(mode), [mode]);
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));

  const [display, setDisplay] = useState("0");
  const [stored, setStored] = useState<number | null>(null);
  const [op, setOp] = useState<"+" | "-" | "×" | "÷" | null>(null);
  const [overwrite, setOverwrite] = useState(true);

  const inputDigit = (d: string) => {
    setDisplay((prev) => {
      if (overwrite) {
        setOverwrite(false);
        return d === "." ? "0." : d;
      }
      if (d === "." && prev.includes(".")) return prev;
      if (prev === "0" && d !== ".") return d;
      return prev + d;
    });
  };

  const evaluate = (
    a: number,
    b: number,
    operator: Exclude<typeof op, null>
  ) => {
    let out = 0;
    if (operator === "+") out = a + b;
    if (operator === "-") out = a - b;
    if (operator === "×") out = a * b;
    if (operator === "÷") out = b === 0 ? NaN : a / b;
    return Number.parseFloat(out.toFixed(12));
  };

  const chooseOp = (next: Exclude<typeof op, null>) => {
    const current = Number(display);
    if (op && stored !== null && !overwrite) {
      const res = evaluate(stored, current, op);
      setStored(res);
      setDisplay(String(res));
      setOverwrite(true);
    } else {
      setStored(current);
      setOverwrite(true);
    }
    setOp(next);
  };

  const equals = () => {
    const current = Number(display);
    if (op && stored !== null) {
      const res = evaluate(stored, current, op);
      setDisplay(String(res));
      setStored(null);
      setOp(null);
      setOverwrite(true);
    }
  };

  const clearAll = () => {
    setDisplay("0");
    setStored(null);
    setOp(null);
    setOverwrite(true);
  };
  const backspace = () =>
    setDisplay((p) =>
      overwrite ? p : p.length <= 1 ? "0" : p.slice(0, -1)
    );
  const invert = () =>
    setDisplay((p) => (p.startsWith("-") ? p.slice(1) : p === "0" ? p : "-" + p));
  const percent = () =>
    setDisplay((p) =>
      String(Number.parseFloat((Number(p) / 100).toFixed(12)))
    );

  const keys = [
    { label: "C", variant: "outlined", onClick: clearAll },
    { label: "±", variant: "outlined", onClick: invert },
    { label: "%", variant: "outlined", onClick: percent },
    { label: "÷", color: "primary", onClick: () => chooseOp("÷") },

    { label: "7", onClick: () => inputDigit("7") },
    { label: "8", onClick: () => inputDigit("8") },
    { label: "9", onClick: () => inputDigit("9") },
    { label: "×", color: "primary", onClick: () => chooseOp("×") },

    { label: "4", onClick: () => inputDigit("4") },
    { label: "5", onClick: () => inputDigit("5") },
    { label: "6", onClick: () => inputDigit("6") },
    { label: "-", color: "primary", onClick: () => chooseOp("-") },

    { label: "1", onClick: () => inputDigit("1") },
    { label: "2", onClick: () => inputDigit("2") },
    { label: "3", onClick: () => inputDigit("3") },
    { label: "+", color: "primary", onClick: () => chooseOp("+") },

    { label: "⌫", variant: "outlined", onClick: backspace },
    { label: "0", onClick: () => inputDigit("0") },
    { label: ".", onClick: () => inputDigit(".") },
    { label: "=", color: "primary", onClick: equals },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          backgroundColor: mode === "light" ? "#f8fafc" : "#0a0a0a",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="sm">
          <Stack gap={3}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="h5"
                sx={{
                  fontWeight: "bold",
                  fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
                  color: mode === "light" ? "#000000" : "#ffffff",
                }}
              >
                Calculator
              </Typography>
              <Stack direction="row" gap={1} alignItems="center">
                <IconButton
                  onClick={toggle}
                  size="large"
                  aria-label="toggle theme"
                  sx={{ color: mode === "light" ? "#000000" : "#ffffff" }}
                >
                  {mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
                </IconButton>
              </Stack>
            </Stack>

            {/* Display */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card sx={{ boxShadow: 3 }}>
                <CardContent className="p-6 sm:p-8">
                  <Typography
                    variant="body2"
                    sx={{
                      color: mode === "light" ? "#666666" : "#cccccc",
                      height: "20px",
                    }}
                  >
                    {stored !== null && op ? `${stored} ${op}` : "\u00A0"}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      textAlign: "right",
                      fontWeight: "bold",
                      userSelect: "none",
                      wordBreak: "break-all",
                      marginTop: "8px",
                      color: mode === "light" ? "#000000" : "#ffffff",
                    }}
                  >
                    {formatNumber(display)}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>

            {/* Keypad */}
            <Card sx={{ boxShadow: 3 }}>
              <CardContent className="p-4 sm:p-6">
                <div className="grid grid-cols-4 gap-3 sm:gap-4">
                  {keys.map((k, i) => (
                    <motion.div
                      key={i}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ y: -2 }}
                    >
                      <Button
                        fullWidth
                        variant={(k as any).variant ?? "contained"}
                        color={(k as any).color ?? "inherit"}
                        onClick={k.onClick}
                        sx={{
                          height: { xs: "56px", sm: "64px" },
                          borderRadius: "16px",
                          fontWeight: "bold",
                          fontSize: "1.125rem",
                          backgroundColor:
                            k.color === "primary"
                              ? undefined
                              : mode === "light"
                              ? "#f0f0f0"
                              : "#2a2a2a",
                          color:
                            k.color === "primary"
                              ? undefined
                              : mode === "light"
                              ? "#000000"
                              : "#ffffff",
                          "&:hover": {
                            backgroundColor:
                              k.color === "primary"
                                ? undefined
                                : mode === "light"
                                ? "#e0e0e0"
                                : "#3a3a3a",
                          },
                        }}
                      >
                        {k.label}
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Typography
              variant="body2"
              sx={{
                textAlign: "center",
                color: mode === "light" ? "#666666" : "#cccccc",
              }}
            >
              Tip: Click the theme icon to toggle dark/light.
            </Typography>
          </Stack>
        </Container>
      </div>
    </ThemeProvider>
  );
}
