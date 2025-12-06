"use client";

import { useEffect, useRef, useState } from "react";
import {
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  Mic,
  Square,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Lock,
  Fingerprint,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";
import {
  readNamespacedItem,
  STORAGE_KEYS,
  writeNamespacedItem,
} from "@/lib/local-storage";
import { cn } from "@/lib/utils";

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

  const securityFeatures = [
    { label: "Email Verified", status: true, icon: Mail },
    { label: "Phone Verified", status: true, icon: Phone },
    { label: "Voice Auth", status: !!audioURL, icon: Mic },
    { label: "2FA Enabled", status: false, icon: Lock },
  ];

  return (
    <div className="flex h-full flex-col p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-semibold text-2xl tracking-tight">Security Center</h1>
        <p className="text-muted-foreground text-sm">Manage your profile and security settings</p>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4">
        <div className="space-y-6">
          {/* Personal Information Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-violet-500 to-violet-600">
                <User className="size-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold">Personal Information</h2>
                <p className="text-sm text-muted-foreground">Your basic account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-muted-foreground text-xs font-medium">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    value={userName}
                    readOnly
                    className="h-11 rounded-xl border-border/50 bg-muted/30"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-muted-foreground text-xs font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={userEmail}
                    readOnly
                    className="h-11 rounded-xl border-border/50 bg-muted/30"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-muted-foreground text-xs font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+60 123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onBlur={() => persistPhone(phoneNumber.trim())}
                    className="h-11 rounded-xl border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-muted-foreground text-xs font-medium">
                    Address
                  </Label>
                  <Input
                    id="address"
                    placeholder="123 Main St, City"
                    defaultValue="123 Main St, San Francisco"
                    className="h-11 rounded-xl border-border/50"
                  />
                </div>
              </div>
              <Button
                className="mt-2 rounded-xl"
                onClick={() => persistPhone(phoneNumber.trim())}
              >
                Save Changes
              </Button>
            </div>
          </div>

          {/* Voice Authentication Card */}
          <div className="rounded-2xl border border-border/50 bg-card p-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-teal-500 to-teal-600">
                  <Fingerprint className="size-5 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold">Voice Authentication</h2>
                  <p className="text-sm text-muted-foreground">Secure your transactions with voice ID</p>
                </div>
              </div>
              {audioURL && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-500">
                  <CheckCircle2 className="size-3" />
                  Enrolled
                </span>
              )}
            </div>

            <div className="flex flex-col items-center space-y-6 py-4">
              {/* Recording Indicator */}
              <div className="relative">
                <div
                  className={cn(
                    "flex size-28 items-center justify-center rounded-full border-4 transition-all duration-300",
                    isRecording
                      ? "border-rose-500 bg-rose-500/10"
                      : audioURL
                        ? "border-emerald-500 bg-emerald-500/10"
                        : "border-border/50 bg-muted/30"
                  )}
                >
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full animate-ping bg-rose-500/20" />
                  )}
                  <Mic
                    className={cn(
                      "size-12 transition-colors",
                      isRecording
                        ? "text-rose-500"
                        : audioURL
                          ? "text-emerald-500"
                          : "text-muted-foreground"
                    )}
                  />
                </div>
              </div>

              <div className="text-center">
                <p className="font-mono text-3xl font-semibold tabular-nums">
                  {formatTime(recordingTime)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isRecording
                    ? "Recording your voice..."
                    : audioURL
                      ? "Voice sample saved"
                      : "Ready to record"}
                </p>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center gap-3">
                {!isRecording && !audioURL && (
                  <Button
                    onClick={startRecording}
                    size="lg"
                    className="h-12 gap-2 rounded-xl bg-linear-to-br from-teal-500 to-teal-600 px-6 hover:from-teal-400 hover:to-teal-500"
                  >
                    <Mic className="size-4" />
                    Start Recording
                  </Button>
                )}
                {isRecording && (
                  <Button
                    onClick={stopRecording}
                    size="lg"
                    className="h-12 gap-2 rounded-xl bg-rose-500 px-6 hover:bg-rose-600"
                  >
                    <Square className="size-4" />
                    Stop Recording
                  </Button>
                )}
                {audioURL && !isRecording && (
                  <>
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      size="lg"
                      className="h-12 gap-2 rounded-xl px-6"
                    >
                      <Mic className="size-4" />
                      Re-record
                    </Button>
                    <Button
                      onClick={deleteRecording}
                      variant="outline"
                      size="lg"
                      className="h-12 gap-2 rounded-xl px-6 border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </>
                )}
              </div>

              {/* Audio Playback */}
              {audioURL && (
                <div className="w-full max-w-md rounded-xl border border-border/50 bg-muted/30 p-4">
                  <p className="mb-2 text-center text-sm font-medium text-muted-foreground">
                    Preview Recording
                  </p>
                  <audio controls src={audioURL} className="w-full" />
                </div>
              )}

              {/* Instructions */}
              <div className="max-w-md rounded-xl bg-muted/30 p-4 text-center">
                <p className="text-sm font-medium">Recording Tips</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Speak clearly: "My voice is my password for secure banking."
                  This will verify your identity during transactions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
