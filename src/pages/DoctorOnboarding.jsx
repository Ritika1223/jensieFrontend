import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api.js';
import { checkAuth } from '../utils/auth.js';

const DoctorOnboarding = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('get');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Get Doctor states
  const [getEmail, setGetEmail] = useState('');
  const [getLoading, setGetLoading] = useState(false);
  const [getError, setGetError] = useState(null);
  const [retrievedDoctor, setRetrievedDoctor] = useState(null);

  // Create Doctor states
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [createdDoctorId, setCreatedDoctorId] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // Update Doctor states
  const [updateDoctorId, setUpdateDoctorId] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    gender: 'male',
    experience: '',
    patientStories: '',
    rating: '',
    location: '',
    latitude: '',
    longitude: '',
    image: '',
    badge: '',
    fee: '',
    biography: '',
    specialization: [],
    qualifications: '',
    totalConsultations: '',
    officeAddress: '',
    phoneNumber: '',
    officePhoneNumber: '',
  });
  const [updateSpecializationInput, setUpdateSpecializationInput] = useState('');

  // Delete Doctor states
  const [deleteDoctorId, setDeleteDoctorId] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Create Doctor form state
  const [createFormData, setCreateFormData] = useState({
    name: '',
    email: '',
    specialty: '',
    gender: 'male',
    experience: '',
    patientStories: '',
    rating: '',
    location: '',
    latitude: '',
    longitude: '',
    image: '',
    badge: '',
    fee: '',
    biography: '',
    specialization: [],
    qualifications: '',
    totalConsultations: '',
    officeAddress: '',
    phoneNumber: '',
    officePhoneNumber: '',
  });
  const [createSpecializationInput, setCreateSpecializationInput] = useState('');

  // Check authorization on mount
  useEffect(() => {
    const checkAuthorization = async () => {
      try {
        const authResult = await checkAuth();
        if (authResult.authenticated && authResult.user) {
          setIsAuthorized(true);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/login');
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthorization();
  }, [navigate]);

  // Get Doctor by Email
  const handleGetDoctor = async (e) => {
    e.preventDefault();
    setGetLoading(true);
    setGetError(null);
    setRetrievedDoctor(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/doctors/by-email?email=${encodeURIComponent(getEmail)}`, {
        method: 'GET',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctor');
      }

      setRetrievedDoctor(data.data);
    } catch (err) {
      setGetError(err.message || 'An error occurred while fetching the doctor');
    } finally {
      setGetLoading(false);
    }
  };

  // Create Doctor
  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    setCreateError(null);
    setCreateSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/doctors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          ...createFormData,
          experience: Number(createFormData.experience),
          patientStories: createFormData.patientStories ? Number(createFormData.patientStories) : 0,
          rating: Number(createFormData.rating),
          latitude: Number(createFormData.latitude),
          longitude: Number(createFormData.longitude),
          fee: Number(createFormData.fee),
          totalConsultations: createFormData.totalConsultations ? Number(createFormData.totalConsultations) : 0,
          badge: createFormData.badge || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create doctor');
      }

      const doctorId = data.data?._id || data.data?.id;
      setCreatedDoctorId(doctorId);
      setCreateSuccess(true);
      setShowSuccessPopup(true);
      
      // Reset form
      setCreateFormData({
        name: '',
        email: '',
        specialty: '',
        gender: 'male',
        experience: '',
        patientStories: '',
        rating: '',
        location: '',
        latitude: '',
        longitude: '',
        image: '',
        badge: '',
        fee: '',
        biography: '',
        specialization: [],
        qualifications: '',
        totalConsultations: '',
        officeAddress: '',
        phoneNumber: '',
        officePhoneNumber: '',
      });
      setCreateSpecializationInput('');
    } catch (err) {
      setCreateError(err.message || 'An error occurred while creating the doctor');
    } finally {
      setCreateLoading(false);
    }
  };

  // Load doctor data for update
  const handleLoadDoctorForUpdate = async () => {
    if (!updateDoctorId) {
      setUpdateError('Please enter a doctor ID');
      return;
    }

    setUpdateLoading(true);
    setUpdateError(null);

    try {
      const response = await fetch(`${API_URL}/api/doctors/${updateDoctorId}`, {
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch doctor');
      }

      const doctor = data.data;
      setUpdateFormData({
        name: doctor.name || '',
        email: doctor.email || '',
        specialty: doctor.specialty || '',
        gender: doctor.gender || 'male',
        experience: doctor.experience || '',
        patientStories: doctor.patientStories || '',
        rating: doctor.rating || '',
        location: doctor.location || '',
        latitude: doctor.coordinates?.coordinates?.[1] || '',
        longitude: doctor.coordinates?.coordinates?.[0] || '',
        image: doctor.image || '',
        badge: doctor.badge || '',
        fee: doctor.fee || '',
        biography: doctor.biography || '',
        specialization: doctor.specialization || [],
        qualifications: doctor.qualifications || '',
        totalConsultations: doctor.totalConsultations || '',
        officeAddress: doctor.officeAddress || '',
        phoneNumber: doctor.phoneNumber || '',
        officePhoneNumber: doctor.officePhoneNumber || '',
      });
    } catch (err) {
      setUpdateError(err.message || 'An error occurred while loading the doctor');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Update Doctor
  const handleUpdateDoctor = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/doctors/${updateDoctorId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          ...updateFormData,
          experience: updateFormData.experience ? Number(updateFormData.experience) : undefined,
          patientStories: updateFormData.patientStories ? Number(updateFormData.patientStories) : undefined,
          rating: updateFormData.rating ? Number(updateFormData.rating) : undefined,
          latitude: updateFormData.latitude ? Number(updateFormData.latitude) : undefined,
          longitude: updateFormData.longitude ? Number(updateFormData.longitude) : undefined,
          fee: updateFormData.fee ? Number(updateFormData.fee) : undefined,
          totalConsultations: updateFormData.totalConsultations ? Number(updateFormData.totalConsultations) : undefined,
          badge: updateFormData.badge || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update doctor');
      }

      setUpdateSuccess(true);
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (err) {
      setUpdateError(err.message || 'An error occurred while updating the doctor');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Delete Doctor
  const handleDeleteDoctor = async (e) => {
    e.preventDefault();
    if (!deleteDoctorId) {
      setDeleteError('Please enter a doctor ID');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete doctor with ID: ${deleteDoctorId}? This action cannot be undone.`)) {
      return;
    }

    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/doctors/${deleteDoctorId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete doctor');
      }

      setDeleteSuccess(true);
      setDeleteDoctorId('');
      setTimeout(() => {
        setDeleteSuccess(false);
      }, 3000);
    } catch (err) {
      setDeleteError(err.message || 'An error occurred while deleting the doctor');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Helper functions for form handling
  const handleCreateInputChange = (e) => {
    const { name, value } = e.target;
    setCreateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateSpecializationAdd = () => {
    if (createSpecializationInput.trim()) {
      setCreateFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, createSpecializationInput.trim()]
      }));
      setCreateSpecializationInput('');
    }
  };

  const handleCreateSpecializationRemove = (index) => {
    setCreateFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateSpecializationAdd = () => {
    if (updateSpecializationInput.trim()) {
      setUpdateFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, updateSpecializationInput.trim()]
      }));
      setUpdateSpecializationInput('');
    }
  };

  const handleUpdateSpecializationRemove = (index) => {
    setUpdateFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
    }));
  };

  // Render form fields (reusable component)
  const renderDoctorForm = (formData, handleInputChange, specializationInput, handleSpecializationAdd, handleSpecializationRemove, setSpecializationInput) => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Specialty <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="specialty"
            value={formData.specialty}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gender <span className="text-red-500">*</span>
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="others">Others</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Experience (years) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            required
            min="0"
            max="5"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fee (₹) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            name="fee"
            value={formData.fee}
            onChange={handleInputChange}
            required
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Patient Stories
          </label>
          <input
            type="number"
            name="patientStories"
            value={formData.patientStories}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="latitude"
              value={formData.latitude}
              onChange={handleInputChange}
              required
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="longitude"
              value={formData.longitude}
              onChange={handleInputChange}
              required
              step="any"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Image URL (S3) <span className="text-red-500">*</span>
        </label>
        <input
          type="url"
          name="image"
          value={formData.image}
          onChange={handleInputChange}
          required
          placeholder="https://jensei-images.s3.ap-south-1.amazonaws.com/doctors-images/doctor-1.png"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Badge
        </label>
        <select
          name="badge"
          value={formData.badge}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="">None</option>
          <option value="Recommended">Recommended</option>
          <option value="Top Rated">Top Rated</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Specialization
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={specializationInput}
            onChange={(e) => setSpecializationInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleSpecializationAdd();
              }
            }}
            placeholder="Add specialization"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <button
            type="button"
            onClick={handleSpecializationAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>
        {formData.specialization.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.specialization.map((spec, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {spec}
                <button
                  type="button"
                  onClick={() => handleSpecializationRemove(index)}
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Biography
          </label>
          <textarea
            name="biography"
            value={formData.biography}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Qualifications
          </label>
          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleInputChange}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Address
          </label>
          <textarea
            name="officeAddress"
            value={formData.officeAddress}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Office Phone Number
          </label>
          <input
            type="tel"
            name="officePhoneNumber"
            value={formData.officePhoneNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Consultations
          </label>
          <input
            type="number"
            name="totalConsultations"
            value={formData.totalConsultations}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
    </>
  );

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Checking authorization...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 p-6 border-b">
            Doctor Management
          </h1>

          {/* Tabs */}
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('get')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'get'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Get Doctor
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'create'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Create Doctor
            </button>
            <button
              onClick={() => setActiveTab('update')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'update'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Update Doctor
            </button>
            <button
              onClick={() => setActiveTab('delete')}
              className={`px-6 py-4 font-medium transition-colors ${
                activeTab === 'delete'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Delete Doctor
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6 md:p-8">
            {/* Get Doctor Tab */}
            {activeTab === 'get' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Get Doctor by Email</h2>
                <form onSubmit={handleGetDoctor} className="mb-6">
                  <div className="flex gap-4">
                    <input
                      type="email"
                      value={getEmail}
                      onChange={(e) => setGetEmail(e.target.value)}
                      placeholder="Enter doctor's email"
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="submit"
                      disabled={getLoading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {getLoading ? 'Loading...' : 'Get Doctor'}
                    </button>
                  </div>
                </form>

                {getError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{getError}</p>
                  </div>
                )}

                {retrievedDoctor && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Doctor Data:</h3>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto text-sm">
                      {JSON.stringify(retrievedDoctor, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Create Doctor Tab */}
            {activeTab === 'create' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Create New Doctor</h2>
                
                {createError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{createError}</p>
                  </div>
                )}

                <form onSubmit={handleCreateDoctor} className="space-y-6">
                  {renderDoctorForm(
                    createFormData,
                    handleCreateInputChange,
                    createSpecializationInput,
                    handleCreateSpecializationAdd,
                    handleCreateSpecializationRemove,
                    setCreateSpecializationInput
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={createLoading}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {createLoading ? 'Creating...' : 'Create Doctor'}
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate('/doctors')}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Update Doctor Tab */}
            {activeTab === 'update' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Update Doctor</h2>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Doctor ID <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={updateDoctorId}
                      onChange={(e) => setUpdateDoctorId(e.target.value)}
                      placeholder="Enter doctor ID"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleLoadDoctorForUpdate}
                      disabled={updateLoading}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                      Load Doctor
                    </button>
                  </div>
                </div>

                {updateError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{updateError}</p>
                  </div>
                )}

                {updateSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">Doctor updated successfully!</p>
                  </div>
                )}

                <form onSubmit={handleUpdateDoctor} className="space-y-6">
                  {renderDoctorForm(
                    updateFormData,
                    handleUpdateInputChange,
                    updateSpecializationInput,
                    handleUpdateSpecializationAdd,
                    handleUpdateSpecializationRemove,
                    setUpdateSpecializationInput
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      type="submit"
                      disabled={updateLoading || !updateDoctorId}
                      className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium"
                    >
                      {updateLoading ? 'Updating...' : 'Update Doctor'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Delete Doctor Tab */}
            {activeTab === 'delete' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Delete Doctor</h2>
                
                {deleteError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800">{deleteError}</p>
                  </div>
                )}

                {deleteSuccess && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">Doctor deleted successfully!</p>
                  </div>
                )}

                <form onSubmit={handleDeleteDoctor} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Doctor ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={deleteDoctorId}
                      onChange={(e) => setDeleteDoctorId(e.target.value)}
                      placeholder="Enter doctor ID to delete"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={deleteLoading}
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    {deleteLoading ? 'Deleting...' : 'Delete Doctor'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Popup for Create */}
      {showSuccessPopup && createdDoctorId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 md:p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Doctor Created Successfully!</h2>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  setCreateSuccess(false);
                  setCreatedDoctorId(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-gray-700 mb-4">The doctor has been created successfully.</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Doctor Profile URL:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}/doctor-profile/${createdDoctorId}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/doctor-profile/${createdDoctorId}`);
                  }}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  navigate(`/doctor-profile/${createdDoctorId}`);
                  setShowSuccessPopup(false);
                  setCreateSuccess(false);
                  setCreatedDoctorId(null);
                }}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
              >
                View Profile
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/doctors');
                  setShowSuccessPopup(false);
                  setCreateSuccess(false);
                  setCreatedDoctorId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Go to Doctors List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorOnboarding;
