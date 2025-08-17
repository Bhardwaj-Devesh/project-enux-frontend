import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Navigation } from '@/components/Navigation';
import { API_BASE_URL } from '@/lib/utils';
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Building, 
  Heart, 
  Edit3, 
  Save, 
  X,
  Camera,
  Briefcase,
  GraduationCap
} from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  company: string | null;
  location: string | null;
  website: string | null;
  interests: string[] | null;
  stage: string | null;
  avatar_url: string | null;
  created_at: string | null;
  updated_at: string | null;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    bio: '',
    company: '',
    location: '',
    website: '',
    interests: [] as string[],
    stage: ''
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      // Get token from sessionStorage
      const userData = sessionStorage.getItem('user_data');
      let token = '';
      
      if (userData) {
        try {
          const userDataObj = JSON.parse(userData);
          token = userDataObj.access_token || userDataObj.token;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${API_BASE_URL}/profiles/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setProfile(data);
      setEditForm({
        full_name: data.full_name || '',
        bio: data.bio || '',
        company: data.company || '',
        location: data.location || '',
        website: data.website || '',
        interests: data.interests || [],
        stage: data.stage || ''
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Empty is valid
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // Validate website URL if provided
    if (editForm.website && editForm.website.trim() !== '' && !validateUrl(editForm.website)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid website URL (e.g., https://example.com)",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      // Get token from sessionStorage
      const userData = sessionStorage.getItem('user_data');
      let token = '';
      
      if (userData) {
        try {
          const userDataObj = JSON.parse(userData);
          token = userDataObj.access_token || userDataObj.token;
        } catch (error) {
          console.error('Error parsing user data:', error);
        }
      }

      if (!token) {
        throw new Error('No authentication token found');
      }

             // Prepare request body, only including non-empty fields
       const requestBody: any = {
         user_id: user.id,
         username: user.email,
         full_name: editForm.full_name || null,
         bio: editForm.bio || null,
         company: editForm.company || null,
         location: editForm.location || null,
         interests: editForm.interests.length > 0 ? editForm.interests : null,
         stage: editForm.stage || null,
         avatar_url: profile?.avatar_url || null
       };

       // Only include website if it's not empty and is a valid URL
       if (editForm.website && editForm.website.trim() !== '') {
         requestBody.website = editForm.website;
       }

       const response = await fetch(`${API_BASE_URL}/profiles/me`, {
         method: 'PUT',
         headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify(requestBody),
       });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      await fetchProfile();
      setIsEditing(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully!",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInterestChange = (index: number, value: string) => {
    const newInterests = [...editForm.interests];
    newInterests[index] = value;
    setEditForm({ ...editForm, interests: newInterests });
  };

  const addInterest = () => {
    setEditForm({
      ...editForm,
      interests: [...editForm.interests, '']
    });
  };

  const removeInterest = (index: number) => {
    const newInterests = editForm.interests.filter((_, i) => i !== index);
    setEditForm({ ...editForm, interests: newInterests });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || ''} />
                  <AvatarFallback className="text-2xl font-semibold bg-blue-100 text-blue-600">
                    {getInitials(profile?.full_name || user.full_name || 'User')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {profile?.full_name || user.full_name || 'Your Name'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    @{profile?.username || user.email?.split('@')[0] || 'user'}
                  </p>
                  {profile?.bio && (
                    <p className="text-gray-700 mt-2 max-w-2xl">{profile.bio}</p>
                  )}
                </div>
              </div>
              <Button
                variant={isEditing ? "outline" : "default"}
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center space-x-2"
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4" />
                    Cancel
                  </>
                ) : (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - About */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>About</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <Input
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bio
                      </label>
                      <Textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                          placeholder="City, Country"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Website
                      </label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editForm.website}
                          onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                          placeholder="https://your-website.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.bio && (
                      <p className="text-gray-700">{profile.bio}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      {profile?.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile?.website && (
                        <div className="flex items-center space-x-1">
                          <Globe className="h-4 w-4" />
                          <a 
                            href={profile.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {profile.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5" />
                  <span>Professional</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Company
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          value={editForm.company}
                          onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                          placeholder="Your company"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Career Stage
                      </label>
                      <select
                        value={editForm.stage}
                        onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select your career stage</option>
                        <option value="student">Student</option>
                        <option value="junior">Junior Developer</option>
                        <option value="mid-level">Mid-Level Developer</option>
                        <option value="senior">Senior Developer</option>
                        <option value="lead">Tech Lead</option>
                        <option value="manager">Engineering Manager</option>
                        <option value="architect">Software Architect</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profile?.company && (
                      <div className="flex items-center space-x-2">
                        <Building className="h-5 w-5 text-gray-400" />
                        <span className="text-gray-700">{profile.company}</span>
                      </div>
                    )}
                    {profile?.stage && (
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="h-5 w-5 text-gray-400" />
                        <Badge variant="secondary" className="capitalize">
                          {profile.stage.replace('-', ' ')}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Interests Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5" />
                  <span>Interests & Hobbies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    {editForm.interests.map((interest, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          value={interest}
                          onChange={(e) => handleInterestChange(index, e.target.value)}
                          placeholder="Add an interest or hobby"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => removeInterest(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      onClick={addInterest}
                      className="w-full"
                    >
                      + Add Interest
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.interests && profile.interests.length > 0 ? (
                      profile.interests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm">No interests added yet.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact & Stats */}
          <div className="space-y-6">
            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>Contact</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{user.email}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Member since</span>
                    <span className="text-sm font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last updated</span>
                    <span className="text-sm font-medium">
                      {profile?.updated_at 
                        ? new Date(profile.updated_at).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Save Button */}
        {isEditing && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="shadow-lg"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
