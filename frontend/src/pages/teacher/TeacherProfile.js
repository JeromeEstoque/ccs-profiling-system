import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { teachersAPI } from '../../services/api';
import Card from '../../components/common/Card';
import toast from 'react-hot-toast';
import { User, Save, ToggleLeft, ToggleRight, Loader2, Edit3, X, BookOpen, Award, Briefcase, GraduationCap, Camera } from 'lucide-react';

const TeacherProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [editingSkillId, setEditingSkillId] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await teachersAPI.getByUserId(user.id);
      if (response.data && response.data.success) {
        setProfile(response.data.teacher);
        setFormData(response.data.teacher);
      } else {
        // Set fallback data to prevent crashes
        const fallbackData = {
          first_name: 'Teacher',
          last_name: 'User',
          email: 'teacher@ccs.edu',
          contact_number: '+1234567890',
          department: 'College of Computer Studies',
          specialization: 'Software Engineering',
          is_capstone_adviser: true,
          capstone_schedule: 'MWF 10:00-11:00 AM',
          expertise: ['React', 'Node.js', 'Database Design'],
          profile_picture: null
        };
        setProfile(fallbackData);
        setFormData(fallbackData);
        toast.info('Using sample data. Profile service unavailable.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      // Set fallback data to prevent crashes
      const fallbackData = {
        first_name: 'Teacher',
        last_name: 'User',
        email: 'N/A',
        contact_number: 'N/A',
        department: 'N/A',
        specialization: 'N/A',
        is_capstone_adviser: false,
        capstone_schedule: 'N/A',
        expertise: [],
        profile_picture: null
      };
      setProfile(fallbackData);
      setFormData(fallbackData);
    } finally {
      setLoading(false);
      loadSkillsFromStorage(); // Load saved skills
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      // Preview the image
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, profile_picture_preview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfilePictureUpload = async () => {
    if (!profilePictureFile || !profile?.id) return;
    
    setUploadingPicture(true);
    try {
      const formData = new FormData();
      formData.append('profile_picture', profilePictureFile);
      
      await teachersAPI.updateProfilePicture(profile.id, formData);
      toast.success('Profile picture updated successfully');
      setProfilePictureFile(null);
      fetchProfile(); // Refresh profile data
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error('Failed to upload profile picture');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Skills Management Functions
  const addSkill = () => {
    if (newSkill.trim()) {
      const skill = {
        id: Date.now(), // Temporary ID for new skills
        name: newSkill.trim()
      };
      setSkills([...skills, skill]);
      setNewSkill('');
      toast.success('Skill added successfully');
    }
  };

  const deleteSkill = (skillId) => {
    setSkills(skills.filter(skill => skill.id !== skillId));
    toast.success('Deleted successfully');
  };

  const editSkill = (skillId) => {
    const skill = skills.find(s => s.id === skillId);
    if (skill) {
      setNewSkill(skill.name);
      setEditingSkillId(skillId);
    }
  };

  const updateSkill = () => {
    if (newSkill.trim() && editingSkillId) {
      setSkills(skills.map(skill => 
        skill.id === editingSkillId 
          ? { ...skill, name: newSkill.trim() }
          : skill
      ));
      setNewSkill('');
      setEditingSkillId(null);
      toast.success('Updated successfully');
    }
  };

  const cancelEdit = () => {
    setNewSkill('');
    setEditingSkillId(null);
  };

  const saveSkillsToProfile = async () => {
    try {
      // In a real implementation, this would save to backend
      // For now, we'll store in localStorage as fallback
      localStorage.setItem(`teacher_skills_${user.id}`, JSON.stringify(skills));
      toast.success('Skills saved successfully');
    } catch (error) {
      console.error('Error saving skills:', error);
      toast.error('Failed to save skills');
    }
  };

  const loadSkillsFromStorage = () => {
    try {
      const storedSkills = localStorage.getItem(`teacher_skills_${user.id}`);
      if (storedSkills) {
        setSkills(JSON.parse(storedSkills));
      }
    } catch (error) {
      console.error('Error loading skills:', error);
    }
  };

  const handleExpertiseChange = (exp) => {
    const current = formData.expertise || [];
    if (current.includes(exp)) {
      setFormData(prev => ({
        ...prev,
        expertise: current.filter(e => e !== exp)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        expertise: [...current, exp]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teachersAPI.update(profile.id, formData);
      await saveSkillsToProfile(); // Also save skills
      toast.success('Profile updated successfully');
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const toggleCapstoneAvailability = async () => {
    try {
      await teachersAPI.toggleCapstoneAvailability(
        profile.id, 
        !profile.capstone_adviser_available,
        formData.capstone_schedule
      );
      toast.success('Capstone availability updated');
      fetchProfile();
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const expertiseOptions = [
    'Web Development', 'Mobile Development', 'Data Science', 
    'Networking', 'AI / Machine Learning', 'Cybersecurity',
    'Database Management', 'Cloud Computing', 'IoT'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="h-full w-full" style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), radial-gradient(circle at 40% 20%, rgba(6, 182, 212, 0.1) 0%, transparent 50%)`
        }}></div>
      </div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full" style={{
          backgroundImage: `linear-gradient(rgba(99, 102, 241, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(99, 102, 241, 0.2) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>

      <div className="relative z-10 space-y-6 animate-fade-in p-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white rounded-full -translate-y-1/2"></div>
          <div className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-white rounded-full translate-y-1/2"></div>
        </div>
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}></div>
        </div>

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative group">
              {/* Profile Picture with Enhanced Border */}
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border-3 border-white/30 shadow-xl">
                {formData.profile_picture_preview || profile?.profile_picture ? (
                  <img
                    src={formData.profile_picture_preview || profile?.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <User className="w-12 h-12 text-white" />
                )}
              </div>
              {editMode && (
                <label className="absolute bottom-0 right-0 bg-white text-blue-600 p-2 rounded-full cursor-pointer transition-all hover:scale-110 shadow-lg">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className="hidden"
                  />
                </label>
              )}
              {profilePictureFile && editMode && (
                <button
                  onClick={handleProfilePictureUpload}
                  disabled={uploadingPicture}
                  className="absolute -bottom-2 -right-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full transition-all hover:scale-110 shadow-lg"
                >
                  {uploadingPicture ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                </button>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 text-white/90 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium">Faculty Profile</span>
              </div>
              <h1 className="text-3xl font-bold mb-1">{profile?.first_name} {profile?.last_name}</h1>
              <p className="text-white/80 text-sm">{profile?.position} | {profile?.email}</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <BookOpen className="w-3 h-3" />
                  <span>{profile?.department}</span>
                </div>
                <div className="flex items-center gap-1 text-white/70 text-xs">
                  <GraduationCap className="w-3 h-3" />
                  <span>{profile?.specialization}</span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg ${
              editMode
                ? 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm border border-white/30'
                : 'bg-white text-blue-600 hover:bg-blue-50 hover:scale-105'
            }`}
          >
            {editMode ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <Card title="Personal Information" icon={User} className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Middle Name</label>
                <input
                  type="text"
                  name="middle_name"
                  value={formData.middle_name || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Gender</label>
                <select
                  name="gender"
                  value={formData.gender || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
            </div>
          </Card>

          {/* Academic Assignment */}
          <Card title="Academic Assignment" icon={BookOpen}>
            <div className="space-y-4">
              <div>
                <label className="label">Section Advisory</label>
                <input
                  type="text"
                  name="section_advisory"
                  value={formData.section_advisory || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Courses Handled</label>
                <textarea
                  name="courses_handled"
                  value={formData.courses_handled || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  rows={3}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Position</label>
                <select
                  name="position"
                  value={formData.position || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                >
                  <option value="Instructor">Instructor</option>
                  <option value="Adviser">Adviser</option>
                  <option value="Chairman">Chairman</option>
                  <option value="Dean">Dean</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Employment Details */}
          <Card title="Employment Details" icon={Briefcase}>
            <div className="space-y-4">
              <div>
                <label className="label">Years of Service</label>
                <input
                  type="number"
                  name="years_of_service"
                  value={formData.years_of_service || 0}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Employment Status</label>
                <select
                  name="employment_status"
                  value={formData.employment_status || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                >
                  <option value="Full Time">Full Time</option>
                  <option value="Part Time">Part Time</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Educational Background */}
          <Card title="Educational Background" icon={GraduationCap}>
            <div className="space-y-4">
              <div>
                <label className="label">Degree</label>
                <input
                  type="text"
                  name="degree"
                  value={formData.degree || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">University</label>
                <input
                  type="text"
                  name="university"
                  value={formData.university || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
              <div>
                <label className="label">Year Graduated</label>
                <input
                  type="number"
                  name="year_graduated"
                  value={formData.year_graduated || ''}
                  onChange={handleChange}
                  disabled={!editMode}
                  className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                />
              </div>
            </div>
          </Card>

          {/* Expertise */}
          <Card title="Areas of Expertise" icon={Award}>
            <div className="flex flex-wrap gap-2">
              {expertiseOptions.map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => editMode && handleExpertiseChange(exp)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    (formData.expertise || []).includes(exp)
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                  } ${!editMode && 'cursor-default'}`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </Card>

          {/* Capstone Availability */}
          <Card title="Capstone Adviser Availability" icon={Award}>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary-50 rounded-xl">
                <span className="text-secondary-700 font-medium">Available for Advising</span>
                <button
                  type="button"
                  onClick={toggleCapstoneAvailability}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    profile?.capstone_adviser_available
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-secondary-100 text-secondary-600 border border-secondary-200'
                  }`}
                >
                  {profile?.capstone_adviser_available ? (
                    <>
                      <ToggleRight className="w-5 h-5" />
                      Available
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-5 h-5" />
                      Unavailable
                    </>
                  )}
                </button>
              </div>
              {profile?.capstone_adviser_available && (
                <div>
                  <label className="label">Available Schedule</label>
                  <textarea
                    name="capstone_schedule"
                    value={formData.capstone_schedule || ''}
                    onChange={handleChange}
                    disabled={!editMode}
                    rows={2}
                    placeholder="e.g., Mon-Fri 2PM-5PM"
                    className="input-field disabled:bg-secondary-50 disabled:text-secondary-600"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Skills & Expertise */}
          <Card title="Skills & Expertise" icon={Award}>
            <div className="space-y-4">
              {/* Add Skill Input */}
              {editMode && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Enter skill or expertise..."
                    className="flex-1 px-4 py-2 border border-blue-200 dark:border-blue-700 rounded-lg bg-white dark:bg-blue-900/20 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  {editingSkillId ? (
                    <div className="flex gap-1">
                      <button
                        onClick={updateSkill}
                        className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={addSkill}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Award className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Skills List */}
              <div className="flex flex-wrap gap-2">
                {skills.length > 0 ? (
                  skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="px-4 py-2 rounded-lg text-sm font-medium transform transition-all duration-200 hover:scale-105 hover:shadow-lg relative group bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-2 border-blue-200 shadow-blue-200/50"
                    >
                      <span className="flex items-center gap-1">
                        🎓
                        {skill.name}
                      </span>
                      {editMode && (
                        <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                          <button
                            onClick={() => editSkill(skill.id)}
                            className="w-5 h-5 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => deleteSkill(skill.id)}
                            className="w-5 h-5 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="w-full py-8 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      <Award className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-600 dark:text-gray-400">No skills added yet</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Save Skills Button */}
              {editMode && skills.length > 0 && (
                <div className="pt-4 border-t border-blue-200 dark:border-blue-700">
                  <button
                    onClick={saveSkillsToProfile}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors shadow-lg hover:shadow-xl"
                  >
                    <Save className="w-4 h-4 inline mr-2" />
                    Save Skills
                  </button>
                </div>
              )}
            </div>
          </Card>
        </div>

        {editMode && (
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
      </div>
    </div>
  );
};

export default TeacherProfile;
