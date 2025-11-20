export function generateApiKey(email: string): string {
  const normalized = email.trim().toLowerCase();
  const base64 = toBase64Url(normalized);
  return `qr_${base64}`;
}

export function generateBearerToken(): string {
  const random = createRandomHex(32);
  return `br_${random}`;
}

function toBase64Url(value: string): string {
  if (typeof window !== "undefined" && typeof window.btoa === "function") {
    const base64 = window.btoa(unescape(encodeURIComponent(value)));
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  return Buffer.from(value).toString("base64url");
}

function createRandomHex(length: number): string {
  if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
    const bytes = new Uint8Array(Math.ceil(length / 2));
    crypto.getRandomValues(bytes);
    return Array.from(bytes, byte => byte.toString(16).padStart(2, "0")).join("").slice(0, length);
  }

  let output = "";
  while (output.length < length) {
    output += Math.floor(Math.random() * 16).toString(16);
  }
  return output.slice(0, length);
}
