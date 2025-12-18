"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getUserSettings,
  updateUserSettings,
  UserSettings,
} from "@/features/profile/server";
import { toast } from "sonner";
import { Bell, Palette, Globe } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getUserSettings();
      setSettings(data);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleUpdateSetting = async (
    field: keyof UserSettings,
    value: boolean | string
  ) => {
    if (!settings) return;

    setSaving(true);
    try {
      await updateUserSettings({ [field]: value });
      setSettings({ ...settings, [field]: value });
      toast.success("Settings updated");
    } catch {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Settings not found</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and application settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for comments, likes, and mentions
                </p>
              </div>
              <Button
                variant={settings.email_notifications ? "default" : "outline"}
                onClick={() =>
                  handleUpdateSetting(
                    "email_notifications",
                    !settings.email_notifications
                  )
                }
                disabled={saving}
              >
                {settings.email_notifications ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Appearance */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  handleUpdateSetting("theme", value)
                }
                disabled={saving}
              >
                <SelectTrigger id="theme" className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Choose how the application looks
              </p>
            </div>
          </div>
        </Card>

        {/* Language */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Language</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="language">Display Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  handleUpdateSetting("language", value)
                }
                disabled={saving}
              >
                <SelectTrigger id="language" className="w-full max-w-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ur">Urdu</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Select your preferred language
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
