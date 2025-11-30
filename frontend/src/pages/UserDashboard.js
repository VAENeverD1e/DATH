import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ClockIcon, Grid3x3Icon, MailIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar.js";
import { Button } from "../components/ui/button.js";
import { Card, CardContent } from "../components/ui/card.js";
import { Input } from "../components/ui/input.js";
import { Label } from "../components/ui/label.js";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select.js";
import { apiGet, apiPatch, getAuth } from "../api/client";

export const UserDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [profile, setProfile] = useState({
    username: "",
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    gender: "",
    insurance_provider: "",
    insurance_number: "",
  });

  const [formData, setFormData] = useState({
    email: "",
    phone_number: "",
    date_of_birth: "",
    address: "",
    gender: "",
    insurance_provider: "",
    insurance_number: "",
  });

  // Fetch patient profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        setError("");
        
        // Verify user is logged in
        const { user } = getAuth();
        if (!user) {
          navigate("/login", { replace: true });
          return;
        }

        // Fetch patient profile from backend
        const data = await apiGet("/api/patient/me", { auth: true });
        
        // Data structure: { id, insurance_provider, insurance_number, Users: { username, email, ... } }
        const userData = data.Users || {};
        const profileData = {
          username: userData.username || "",
          email: userData.email || "",
          phone_number: userData.phone_number || "",
          date_of_birth: userData.date_of_birth || "",
          address: userData.address || "",
          gender: userData.gender || "",
          insurance_provider: data.insurance_provider || "",
          insurance_number: data.insurance_number || "",
        };

        setProfile(profileData);
        setFormData({
          email: profileData.email,
          phone_number: profileData.phone_number,
          date_of_birth: profileData.date_of_birth,
          address: profileData.address,
          gender: profileData.gender,
          insurance_provider: profileData.insurance_provider,
          insurance_number: profileData.insurance_number,
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
        setError(err.message || "Failed to load profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");
      setSuccessMsg("");

      // Call PATCH endpoint to update profile
      await apiPatch("/api/patient/me", formData, { auth: true });

      // Update local state
      setProfile((prev) => ({
        ...prev,
        ...formData,
      }));

      setSuccessMsg("Profile updated successfully!");
      setEditMode(false);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setError(err.message || "Failed to save profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      email: profile.email,
      phone_number: profile.phone_number,
      date_of_birth: profile.date_of_birth,
      address: profile.address,
      gender: profile.gender,
      insurance_provider: profile.insurance_provider,
      insurance_number: profile.insurance_number,
    });
    setEditMode(false);
    setError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f9f9f9]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#4182f9]"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#f9f9f9] min-h-screen flex pt-20">
      <aside className="w-[65px] bg-white flex flex-col items-center py-8 gap-6 border-r">
        <button className="w-10 h-10 flex items-center justify-center text-[#4182f9] hover:bg-gray-100 rounded-lg transition-colors">
          <Grid3x3Icon className="w-6 h-6" />
        </button>
        <a
          href="/appointment-dashboard"
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ClockIcon className="w-6 h-6" />
        </a>
      </aside>

      <main className="flex-1 p-8">
        <Card className="w-full max-w-[1282px] mx-auto rounded-[10px] shadow-sm">
          <CardContent className="p-0">
            {/* Header Background */}
            <div className="relative h-[100px] bg-gradient-to-r from-[#4182f9] via-[#7ba3f7] to-[#f5e6d3] rounded-t-[10px] overflow-hidden">
              <div className="absolute inset-0 opacity-20" />
            </div>

            {/* Content */}
            <div className="px-8 py-8">
              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Success Alert */}
              {successMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 text-sm">{successMsg}</p>
                </div>
              )}

              {/* Profile Header */}
              <div className="flex items-start justify-between mb-12">
                <div className="flex items-center gap-4">
                  <Avatar className="w-[60px] h-[60px] -mt-16 border-4 border-white shadow-md">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-[#e8e4f3] text-[#7c6ba6] text-xl font-medium">
                      {profile.username?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-1.5 mt-2">
                    <h1 className="font-medium text-black text-xl">{profile.username || "User"}</h1>
                    <p className="font-normal text-black text-base opacity-50">{profile.email}</p>
                  </div>
                </div>
                <Button
                  onClick={() => (editMode ? handleCancel() : setEditMode(true))}
                  className="bg-[#4182f9] hover:bg-[#3671e8] text-white rounded-lg px-6 h-auto py-2.5 font-normal text-base"
                  disabled={isSaving}
                >
                  {editMode ? "Cancel" : "Edit"}
                </Button>
              </div>

              {/* Profile Fields */}
              <div className="grid grid-cols-2 gap-x-16 gap-y-8">
                {/* Left Column */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Email Address</Label>
                    <Input
                      name="email"
                      type="email"
                      value={editMode ? formData.email : profile.email}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                        !editMode ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Phone Number</Label>
                    <Input
                      name="phone_number"
                      type="tel"
                      value={editMode ? formData.phone_number : profile.phone_number}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                        !editMode ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Date of Birth</Label>
                    <Input
                      name="date_of_birth"
                      type="date"
                      value={editMode ? formData.date_of_birth : profile.date_of_birth}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                        !editMode ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Gender</Label>
                    <Select
                      value={editMode ? formData.gender : profile.gender}
                      onValueChange={(value) => handleSelectChange("gender", value)}
                    >
                      <SelectTrigger
                        className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                          !editMode ? "opacity-40 cursor-not-allowed" : ""
                        }`}
                        disabled={!editMode}
                      >
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Address</Label>
                    <Input
                      name="address"
                      type="text"
                      value={editMode ? formData.address : profile.address}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                        !editMode ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      placeholder="123 Main St, City"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="opacity-80 font-normal text-black text-base">Insurance Provider</Label>
                    <Input
                      name="insurance_provider"
                      type="text"
                      value={editMode ? formData.insurance_provider : profile.insurance_provider}
                      onChange={handleInputChange}
                      disabled={!editMode}
                      className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                        !editMode ? "opacity-40 cursor-not-allowed" : ""
                      }`}
                      placeholder="Insurance Co."
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Number and Save Button */}
              <div className="mt-8 space-y-4">
                <div className="space-y-2">
                  <Label className="opacity-80 font-normal text-black text-base">Insurance Number</Label>
                  <Input
                    name="insurance_number"
                    type="text"
                    value={editMode ? formData.insurance_number : profile.insurance_number}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={`bg-[#f9f9f9] border-0 rounded-lg h-[52px] font-normal text-base ${
                      !editMode ? "opacity-40 cursor-not-allowed" : ""
                    }`}
                    placeholder="Insurance policy number"
                  />
                </div>

                {editMode && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 bg-[#4182f9] hover:bg-[#3671e8] text-white rounded-lg px-6 py-2.5 font-normal text-base"
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Email Display */}
              <div className="mt-12 pt-8 border-t">
                <h2 className="font-medium text-black text-lg mb-4">Email Address</h2>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#4182f9] bg-opacity-10 rounded-full flex items-center justify-center">
                    <MailIcon className="w-6 h-6 text-[#4182f9]" />
                  </div>
                  <span className="font-normal text-black text-base">{profile.email || "Not set"}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UserDashboard;