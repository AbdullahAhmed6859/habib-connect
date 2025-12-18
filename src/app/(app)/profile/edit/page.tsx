"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getUserProfile,
  updateUserProfile,
  UserProfile,
} from "@/features/profile/server";
import { toast } from "sonner";
import { User } from "lucide-react";

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    class_of: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    try {
      const data = await getUserProfile();
      setProfile(data);
      setFormData({
        first_name: data.first_name,
        last_name: data.last_name,
        class_of: data.class_of?.toString() || "",
      });
    } catch (error) {
      console.error("Failed to load profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await updateUserProfile({
        first_name: formData.first_name,
        last_name: formData.last_name,
        class_of: formData.class_of ? parseInt(formData.class_of) : null,
      });
      toast.success("Profile updated successfully!");
      loadProfile();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">Profile not found</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Info Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-muted-foreground">{profile.email}</p>
              <p className="text-sm text-muted-foreground">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                {profile.program && ` • ${profile.program}`}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {profile.role === "student" && (
              <div>
                <Label htmlFor="class_of">Class Of</Label>
                <Input
                  id="class_of"
                  type="number"
                  placeholder="e.g., 2027"
                  value={formData.class_of}
                  onChange={(e) =>
                    setFormData({ ...formData, class_of: e.target.value })
                  }
                />
              </div>
            )}

            <div className="pt-4">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Read-only info */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Account Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{profile.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Role</span>
              <span className="font-medium">
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
            {profile.program && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Program</span>
                <span className="font-medium">{profile.program}</span>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
