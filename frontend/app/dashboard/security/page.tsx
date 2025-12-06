"use client";

import { useEffect, useRef, useState } from "react";
import { Shield, User, Mail, Phone, MapPin, Mic, Square, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import {
  readNamespacedItem,
  STORAGE_KEYS,
  writeNamespacedItem,
} from "@/lib/local-storage";

export default function SecurityPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [phoneNumber, setPhoneNumber] = useState("+1 (555) 123-4567");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const session = authClient.useSession();
  const userId = session.data?.user?.id;
  const userName = session.data?.user?.name ?? "";
  const userEmail = session.data?.user?.email ?? "";

  const persistPhone = (value: string) => {
    writeNamespacedItem(STORAGE_KEYS.securityPhone, value, userId);
    const profile = readNamespacedItem(STORAGE_KEYS.onboarding, userId);
    try {
      const parsed = profile ? JSON.parse(profile.value) : {};
      writeNamespacedItem(
        STORAGE_KEYS.onboarding,
        JSON.stringify({ ...parsed, phone: value }),
        userId
      );
    } catch {
      writeNamespacedItem(
        STORAGE_KEYS.onboarding,
        JSON.stringify({ phone: value }),
        userId
      );
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const savedPhone =
      readNamespacedItem(STORAGE_KEYS.securityPhone, userId)?.value ||
      (() => {
        const profile = readNamespacedItem(STORAGE_KEYS.onboarding, userId);
        if (!profile) return null;
        try {
          const parsed = JSON.parse(profile.value) as { phone?: string };
          return parsed.phone || null;
        } catch {
          return null;
        }
      })();
    if (savedPhone) {
      setPhoneNumber(savedPhone);
    }
  }, [userId]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Unable to access microphone. Please check your permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL(null);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col">
      {/* Content */}
      <div className="border-t border-border bg-card/50 px-6 py-8">
        <div className="mx-auto max-w-2xl space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="size-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" value={userName} readOnly />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">
                    <span className="flex items-center gap-2">
                      <Mail className="size-4" />
                      Email Address
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={userEmail}
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <span className="flex items-center gap-2">
                    <Phone className="size-4" />
                    Phone Number
                  </span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+60 123 456 789"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  onBlur={() => {
                    persistPhone(phoneNumber.trim());
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">
                  <span className="flex items-center gap-2">
                    <MapPin className="size-4" />
                    Address
                  </span>
                </Label>
                <Input id="address" placeholder="123 Main St, City, Country" defaultValue="123 Main St, San Francisco, CA" />
              </div>
              <Button
                className="mt-4"
                onClick={() => {
                  persistPhone(phoneNumber.trim());
                }}
              >
                Save Changes
              </Button>
            </CardContent>
          </Card>

          {/* Voice Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="size-5" />
                Voice Authentication
              </CardTitle>
              <CardDescription>
                Record your voice to enable secure voice-based authentication for transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center space-y-6">
                {/* Recording Indicator */}
                <div className="flex flex-col items-center">
                  <div
                    className={`mb-4 flex size-24 items-center justify-center rounded-full border-4 transition-all ${
                      isRecording
                        ? "border-red-500 bg-red-500/10 animate-pulse"
                        : audioURL
                          ? "border-emerald-500 bg-emerald-500/10"
                          : "border-border bg-card"
                    }`}
                  >
                    <Mic className={`size-10 ${isRecording ? "text-red-500" : audioURL ? "text-emerald-500" : "text-muted-foreground"}`} />
                  </div>
                  <p className="font-mono text-2xl font-medium">
                    {formatTime(recordingTime)}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isRecording
                      ? "Recording in progress..."
                      : audioURL
                        ? "Voice sample recorded"
                        : "Ready to record"}
                  </p>
                </div>

                {/* Recording Controls */}
                <div className="flex items-center gap-3">
                  {!isRecording && !audioURL && (
                    <Button onClick={startRecording} size="lg" className="gap-2">
                      <Mic className="size-4" />
                      Start Recording
                    </Button>
                  )}
                  {isRecording && (
                    <Button onClick={stopRecording} variant="destructive" size="lg" className="gap-2">
                      <Square className="size-4" />
                      Stop Recording
                    </Button>
                  )}
                  {audioURL && !isRecording && (
                    <>
                      <Button onClick={startRecording} variant="outline" size="lg" className="gap-2">
                        <Mic className="size-4" />
                        Re-record
                      </Button>
                      <Button onClick={deleteRecording} variant="destructive" size="lg" className="gap-2">
                        <Trash2 className="size-4" />
                        Delete
                      </Button>
                    </>
                  )}
                </div>

                {/* Audio Playback */}
                {audioURL && (
                  <div className="w-full max-w-md">
                    <Label className="mb-2 block text-center">Preview your recording:</Label>
                    <audio controls src={audioURL} className="w-full" />
                  </div>
                )}

                {/* Instructions */}
                <div className="max-w-md rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">Recording Tips:</p>
                  <p className="mt-1">
                    Speak clearly and naturally. Say: "My voice is my password for secure banking."
                    This recording will be used to verify your identity during transactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
