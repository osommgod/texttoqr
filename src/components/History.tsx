import { useState, useRef, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Download,
  Search,
  Calendar,
  Filter,
  Trash2,
  Eye,
  Copy,
  Check,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ConversionRecord } from "../types";
import QRCode from "qrcode";

interface HistoryProps {
  conversions: ConversionRecord[];
  onDeleteConversion: (id: string) => void;
}

export function History({ conversions, onDeleteConversion }: HistoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedConversion, setSelectedConversion] = useState<ConversionRecord | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const filteredConversions = conversions.filter((conversion) => {
    // Search filter
    const matchesSearch = conversion.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Time filter
    const now = new Date();
    const conversionDate = new Date(conversion.timestamp);
    let matchesTime = true;

    if (filterPeriod === "today") {
      matchesTime = conversionDate.toDateString() === now.toDateString();
    } else if (filterPeriod === "week") {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      matchesTime = conversionDate >= weekAgo;
    } else if (filterPeriod === "month") {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      matchesTime = conversionDate >= monthAgo;
    }

    return matchesSearch && matchesTime;
  });

  const generateQRCodeForPreview = async (text: string) => {
    const canvas = canvasRef.current;
    if (canvas) {
      await QRCode.toCanvas(canvas, text, {
        width: 200,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });
    }
  };

  const handleDownload = async (conversion: ConversionRecord) => {
    const canvas = document.createElement("canvas");
    await QRCode.toCanvas(canvas, conversion.text, {
      width: 500,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
    
    const url = canvas.toDataURL();
    const link = document.createElement("a");
    link.download = `qrcode-${conversion.id}.png`;
    link.href = url;
    link.click();
  };

  const handleCopyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
      });
    }
  };

  const truncateText = (text: string, maxLength: number = 50) => {
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  useEffect(() => {
    if (selectedConversion) {
      generateQRCodeForPreview(selectedConversion.text);
    }
  }, [selectedConversion]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-gray-900">Conversion History</h2>
        <p className="text-gray-600 mt-1">
          View and manage all your QR code conversions
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <p className="text-gray-600 mb-1">Total Conversions</p>
          <p className="text-gray-900">{conversions.length}</p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-1">This Week</p>
          <p className="text-gray-900">
            {conversions.filter((c) => {
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return new Date(c.timestamp) >= weekAgo;
            }).length}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-gray-600 mb-1">Today</p>
          <p className="text-gray-900">
            {conversions.filter((c) => {
              const today = new Date().toDateString();
              return new Date(c.timestamp).toDateString() === today;
            }).length}
          </p>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search conversions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Time Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                {filterPeriod === "all" && "All Time"}
                {filterPeriod === "today" && "Today"}
                {filterPeriod === "week" && "This Week"}
                {filterPeriod === "month" && "This Month"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPeriod("all")}>
                All Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("today")}>
                Today
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("week")}>
                This Week
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPeriod("month")}>
                This Month
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Conversions List */}
      {filteredConversions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Calendar className="w-16 h-16 mx-auto mb-4" />
            <p className="text-gray-900 mb-2">No conversions found</p>
            <p className="text-sm text-gray-600">
              {searchQuery || filterPeriod !== "all"
                ? "Try adjusting your filters"
                : "Start generating QR codes to see them here"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredConversions.map((conversion) => (
            <Card key={conversion.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                {/* QR Code Thumbnail */}
                <div className="flex-shrink-0 w-20 h-20 bg-white border-2 border-gray-100 rounded-lg p-2">
                  <img
                    src={conversion.qrCodeUrl}
                    alt="QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Conversion Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 mb-1 break-all">
                        {truncateText(conversion.text)}
                      </p>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(conversion.timestamp)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {conversion.type === "url" ? "URL" : "Text"}
                        </Badge>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedConversion(conversion)}
                        className="gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Preview</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyText(conversion.text, conversion.id)}
                        className="gap-2"
                      >
                        {copiedId === conversion.id ? (
                          <>
                            <Check className="w-4 h-4 text-green-500" />
                            <span className="hidden sm:inline text-green-500">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            <span className="hidden sm:inline">Copy</span>
                          </>
                        )}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleDownload(conversion)}
                        className="gap-2"
                      >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Download</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteConversion(conversion.id)}
                        className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Modal */}
      {selectedConversion && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedConversion(null)}
        >
          <Card
            className="max-w-md w-full p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-gray-900">QR Code Preview</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedConversion(null)}
              >
                ✕
              </Button>
            </div>

            <div className="bg-white p-4 rounded-lg border-2 border-gray-100 flex items-center justify-center">
              <canvas ref={canvasRef} className="max-w-full" />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Content:</p>
              <p className="text-gray-900 break-all bg-gray-50 p-3 rounded-lg text-sm">
                {selectedConversion.text}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleDownload(selectedConversion)}
                className="flex-1 gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCopyText(selectedConversion.text, selectedConversion.id)}
                className="flex-1 gap-2"
              >
                {copiedId === selectedConversion.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Text
                  </>
                )}
              </Button>
            </div>

            <div className="text-xs text-gray-500 text-center pt-2 border-t">
              Created {formatDate(selectedConversion.timestamp)}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
