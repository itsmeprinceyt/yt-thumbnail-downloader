"use client";
import { useState, useEffect, useRef } from "react";

export default function YouTubeThumbnailDownloader() {
  const [url, setUrl] = useState<string>("");
  const [thumbnail, setThumbnail] = useState<string>("");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const extractVideoId = (link: string): string | null => {
    const youtubeRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = link.match(youtubeRegex);
    return match ? match[1] : null;
  };

  const processLink = (link: string) => {
    const videoId = extractVideoId(link);
    if (videoId) {
      const highRes = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
      setThumbnail(highRes);
    } else {
      setThumbnail("");
    }
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const pastedText = e.clipboardData?.getData("text");
      if (pastedText) {
        setUrl(pastedText);
        processLink(pastedText);
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        processLink(text);
      }
    } catch (error) {
      alert("Clipboard access denied. Please allow permission.");
    }
  };

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (!url) return;

    timeoutRef.current = setTimeout(() => {
      processLink(url);
    }, 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [url]);

const downloadImage = async () => {
  if (!thumbnail) return;

  try {
    const response = await fetch(thumbnail);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "thumbnail.jpg";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Clean up blob URL
    URL.revokeObjectURL(url);
  } catch (error) {
    alert("Failed to download image.");
  }
};


  return (
    <div className="min-h-screen flex justify-center items-center">
      <div className="flex flex-col items-center gap-4 p-6 max-w-xl mx-auto text-center">
        <p className="text-lg text-gray-700">
          Paste a YouTube video URL using Ctrl+V or manually enter it below.
        </p>

        <div className="flex gap-2 w-full max-w-md">
          <input
            type="text"
            placeholder="Enter or paste YouTube link..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-grow p-2 border border-black/50 rounded-lg shadow-sm "
          />
          <button
            onClick={handlePasteClick}
            className="px-4 py-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900"
          >
            Paste
          </button>
        </div>

        {thumbnail && (
          <>
            <img
              src={thumbnail}
              alt="YouTube Thumbnail"
              className="rounded-lg shadow-lg max-w-full h-auto"
            />
            <button
              onClick={downloadImage}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Download
            </button>
          </>
        )}
      </div>
    </div>
  );
}
