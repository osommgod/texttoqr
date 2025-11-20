import React, { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card } from "./ui/card";
import { Download, Copy, Check } from "lucide-react";
import QRCode from "qrcode";
import jsQR from "jsqr";

interface QRGeneratorProps {
  onConversion: (text: string, qrCodeUrl: string) => void;
  conversionsUsed: number;
  isLoggedIn: boolean;
}

export function QRGenerator({ onConversion, conversionsUsed, isLoggedIn }: QRGeneratorProps) {
  const [text, setText] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const decodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [decodedText, setDecodedText] = useState("");
  const [decodeError, setDecodeError] = useState("");
  const [isDecoding, setIsDecoding] = useState(false);

  const generateQRCode = async (value: string) => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        await QRCode.toCanvas(canvas, value, {
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#FFFFFF",
          },
        });
        const url = canvas.toDataURL();
        setQrCodeUrl(url);
        return url;
      }
    } catch (err) {
      console.error("Error generating QR code:", err);
    }
    return "";
  };

  const handleGenerate = async () => {
    const value = text.trim();
    if (!value) {
      setQrCodeUrl("");
      return;
    }

    setIsGenerating(true);
    try {
      const url = await generateQRCode(value);
      if (url) {
        onConversion(value, url);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (qrCodeUrl) {
      const link = document.createElement("a");
      link.download = "qrcode.png";
      link.href = qrCodeUrl;
      link.click();
    }
  };

  const handleCopyImage = async () => {
    try {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.toBlob(async (blob: Blob | null) => {
          if (blob) {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }
        });
      }
    } catch (err) {
      console.error("Error copying image:", err);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsDecoding(true);
    setDecodeError("");
    setDecodedText("");

    try {
      const imageDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Unable to read file"));
          }
        };
        reader.onerror = () => reject(new Error("Unable to read file"));
        reader.readAsDataURL(file);
      });

      const img = new Image();
      img.onload = () => {
        const canvas = decodeCanvasRef.current;
        if (!canvas) {
          setDecodeError("Unable to access canvas");
          setIsDecoding(false);
          return;
        }

        const maxSize = 600;
        let width = img.width;
        let height = img.height;
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = width * scale;
          height = height * scale;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setDecodeError("Unable to access canvas context");
          setIsDecoding(false);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code && code.data) {
          setDecodedText(code.data);
        } else {
          setDecodeError("No QR code detected in the image");
        }
        setIsDecoding(false);
      };
      img.onerror = () => {
        setDecodeError("Unable to load image");
        setIsDecoding(false);
      };
      img.src = imageDataUrl;
    } catch (error) {
      setDecodeError("Failed to decode QR code");
      setIsDecoding(false);
    }
  };

  return (
    <Card className="max-w-3xl mx-auto p-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-text" className="block mb-2 text-gray-700">
              Enter Text or URL
            </label>
            <Textarea
              id="qr-text"
              placeholder="https://example.com or any text..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>
          <div className="text-sm text-gray-500">
            {isLoggedIn ? "Total conversions" : "Conversions today"}: <span className="text-indigo-600">{conversionsUsed}</span>
          </div>
          <div>
            <Button onClick={handleGenerate} disabled={isGenerating} className="w-full">
              Generate
            </Button>
          </div>
        </div>

        {/* QR Code Display */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative bg-white p-4 rounded-lg shadow-sm border-2 border-gray-100">
            <canvas ref={canvasRef} className="max-w-full w-[300px] h-[300px]" />
            {!qrCodeUrl && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-gray-400">QR code will appear here</p>
              </div>
            )}
          </div>
          <div className="flex gap-2 w-full">
            <Button
              onClick={handleDownload}
              className="flex-1 gap-2"
              variant="default"
              disabled={!qrCodeUrl}
            >
              <Download className="w-4 h-4" />
              Download
            </Button>
            <Button
              onClick={handleCopyImage}
              className="flex-1 gap-2"
              variant="outline"
              disabled={!qrCodeUrl}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-10 rounded-xl border border-gray-200 bg-gray-50/70 p-6 space-y-6">
        <div className="flex flex-col gap-2 max-w-xl">
          <h3 className="text-base font-semibold text-gray-900">Decode an existing QR code</h3>
          <p className="text-sm text-gray-500">
            Upload a QR code image and we&apos;ll extract the text or URL inside it.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          <div className="space-y-3">
            <div>
              <label className="block mb-2 text-sm font-medium text-gray-700">Upload QR code image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="sr-only"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-1 w-full rounded-full border border-black bg-white text-black hover:bg-gray-100"
              >
                Upload QR image
              </Button>
            </div>
            {decodeError && (
              <p className="text-sm text-red-500">{decodeError}</p>
            )}
          </div>

          <div className="h-full">
            <Textarea
              readOnly
              value={decodedText}
              placeholder={isDecoding ? "Decoding..." : "Decoded text will appear here"}
              className="h-full min-h-[160px] resize-none bg-white border border-gray-300 rounded-lg"
            />
          </div>
        </div>
      </div>

      <canvas ref={decodeCanvasRef} style={{ display: "none" }} />
    </Card>
  );
}