export function GetENV(name: string): string {
  return import.meta.env["VITE_" + name] ?? "";
}
