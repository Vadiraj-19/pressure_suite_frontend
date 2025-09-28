
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Upload, Save } from 'lucide-react';
import { pressureTestAPI } from '../services/api';
import { validateImageFile } from '../utils/helpers';

const StartPressureTest = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [floors, setFloors] = useState([
    {
      floorName: '',
      locations: [
        {
          locationName: '',
          startPressure: '',
          startImage: null,
          startImagePreview: null,
        }
      ]
    }
  ]);

  const addFloor = () => {
    setFloors([
      ...floors,
      {
        floorName: '',
        locations: [
          {
            locationName: '',
            startPressure: '',
            startImage: null,
            startImagePreview: null,
          }
        ]
      }
    ]);
  };

  const removeFloor = (floorIndex) => {
    if (floors.length > 1) {
      setFloors(floors.filter((_, idx) => idx !== floorIndex));
    }
  };

  const addLocation = (floorIndex) => {
    const newFloors = [...floors];
    newFloors[floorIndex].locations.push({
      locationName: '',
      startPressure: '',
      startImage: null,
      startImagePreview: null,
    });
    setFloors(newFloors);
  };

  const removeLocation = (floorIndex, locationIndex) => {
    const newFloors = [...floors];
    if (newFloors[floorIndex].locations.length > 1) {
      newFloors[floorIndex].locations.splice(locationIndex, 1);
      setFloors(newFloors);
    }
  };

  const updateFloorName = (floorIndex, value) => {
    const newFloors = [...floors];
    newFloors[floorIndex].floorName = value;
    setFloors(newFloors);
  };

  const updateLocation = (floorIndex, locationIndex, field, value) => {
    const newFloors = [...floors];
    newFloors[floorIndex].locations[locationIndex][field] = value;
    setFloors(newFloors);
  };

  const handleImageUpload = (floorIndex, locationIndex, file) => {
    try {
      validateImageFile(file);
      const newFloors = [...floors];
      newFloors[floorIndex].locations[locationIndex].startImage = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        newFloors[floorIndex].locations[locationIndex].startImagePreview = e.target.result;
        setFloors(newFloors);
      };
      reader.readAsDataURL(file);

    } catch (error) {
      alert(error.message);
    }
  };

  const validateForm = () => {
    if (!projectName.trim()) {
      alert('Please enter project name');
      return false;
    }
    for (let i = 0; i < floors.length; i++) {
      const floor = floors[i];
      if (!floor.floorName.trim()) {
        alert(`Please enter name for Floor ${i + 1}`);
        return false;
      }
      for (let j = 0; j < floor.locations.length; j++) {
        const loc = floor.locations[j];
        if (!loc.locationName.trim()) {
          alert(`Please enter location name for Floor ${i+1}, Location ${j+1}`);
          return false;
        }
        if (!loc.startPressure || loc.startPressure <= 0) {
          alert(`Please enter valid start pressure for Floor ${i+1}, Location ${j+1}`);
          return false;
        }
        if (!(loc.startImage instanceof File)) {
          alert(`Please upload image for Floor ${i+1}, Location ${j+1}`);
          return false;
        }
      }
    }
    return true;
  };

 
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);

  try {
    const formData = new FormData();
    formData.append('projectName', projectName);
    // Add preview image string for every location (needed for PDF view)
    formData.append(
      'floors',
      JSON.stringify(
        floors.map(floor => ({
          floorName: floor.floorName,
          locations: floor.locations.map(loc => ({
            locationName: loc.locationName,
            startPressure: parseFloat(loc.startPressure),
            startImagePreview: loc.startImagePreview || "", // <----- for PDF
          }))
        }))
      )
    );

    // Append File objects for backend upload
    floors.forEach((floor, fi) => {
      floor.locations.forEach((loc, li) => {
        if (loc.startImage instanceof File) {
          const field = `floors[${fi}].locations[${li}].startImage`;
          formData.append(field, loc.startImage);
        }
      });
    });

    // Debug: log FormData keys and image preview strings
    for (let [key, val] of formData.entries()) {
      console.log(key, val);
    }

    await pressureTestAPI.createTest(formData);
    alert('Pressure test started successfully!');
    navigate('/');
  } catch (err) {
    console.error('Error starting test:', err);
    alert('Failed to start pressure test. Please try again.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate('/')} className="flex items-center text-gray-600 hover:text-gray-800 mr-4">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Start Pressure Test</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="card p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name *</label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              className="input"
              placeholder="Enter project name"
              required
            />
          </div>
          {floors.map((floor, fi) => (
            <div key={fi} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Floor {fi + 1}</h3>
                {floors.length > 1 && (
                  <button type="button" onClick={() => removeFloor(fi)} className="btn btn-danger flex items-center">
                    <Minus className="w-4 h-4 mr-1" />
                    Remove Floor
                  </button>
                )}
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Floor Name *</label>
                <input
                  type="text"
                  value={floor.floorName}
                  onChange={e => updateFloorName(fi, e.target.value)}
                  className="input"
                  placeholder="e.g., Ground Floor"
                  required
                />
              </div>
              <div className="space-y-4">
                <h4 className="font-medium text-gray-800">Locations</h4>
                {floor.locations.map((loc, li) => (
                  <div key={li} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-700">Location {li + 1}</h5>
                      {floor.locations.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLocation(fi, li)}
                          className="text-red-600 hover:text-red-800 flex items-center text-sm"
                        >
                          <Minus className="w-4 h-4 mr-1" /> Remove Location
                        </button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Location Name *</label>
                        <input
                          type="text"
                          value={loc.locationName}
                          onChange={e => updateLocation(fi, li, 'locationName', e.target.value)}
                          className="input"
                          placeholder="e.g., Kitchen"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Pressure (kg) *</label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={loc.startPressure}
                          onChange={e => updateLocation(fi, li, 'startPressure', e.target.value)}
                          className="input"
                          placeholder="e.g., 10"
                          required
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Start Image *</label>
                      <div className="flex items-center space-x-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageUpload(fi, li, e.target.files[0])}
                          className="hidden"
                          id={`img-${fi}-${li}`}
                        />
                        <label htmlFor={`img-${fi}-${li}`} className="btn btn-secondary flex items-center cursor-pointer">
                          <Upload className="w-4 h-4 mr-2" /> Choose Photo
                        </label>
                        {loc.startImagePreview && (
                          <img src={loc.startImagePreview} alt="Preview" className="image-preview rounded-lg border" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => addLocation(fi)} className="btn btn-secondary flex items-center w-full">
                  <Plus className="w-4 h-4 mr-2" /> Add Location
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row gap-4">
            <button type="button" onClick={addFloor} className="btn btn-secondary flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Add Floor
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary flex items-center justify-center flex-1">
              {loading ? <div className="spinner mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {loading ? 'Starting Test...' : 'Start Pressure Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StartPressureTest;
