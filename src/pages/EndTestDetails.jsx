import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, Save, Download } from 'lucide-react';
import { pressureTestAPI } from '../services/api';
import { validateImageFile, calculatePressureHoldingTime } from '../utils/helpers';
import { generatePressureTestReport } from '../utils/pdfGenerator';

const EndTestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    result: '',
    comments: '',
    pressureHoldingTime: '',
    drawingReferenceNo: '',
  });

  useEffect(() => {
    fetchTestDetails();
  }, [id]);

  const fetchTestDetails = async () => {
    try {
      const response = await pressureTestAPI.getTestById(id);
      const testData = response.data;
      setTest(testData);
      
      // Calculate pressure holding time
      const holdingTime = calculatePressureHoldingTime(
        testData.startDate,
        new Date()
      );
      setFormData(prev => ({
        ...prev,
        pressureHoldingTime: holdingTime,
      }));
    } catch (error) {
      console.error('Error fetching test:', error);
      alert('Failed to load test details');
      navigate('/end-test');
    } finally {
      setLoading(false);
    }
  };

  const updateEndPressure = (floorIndex, locationIndex, value) => {
    const newTest = { ...test };
    newTest.floors[floorIndex].locations[locationIndex].endPressure = value;
    setTest(newTest);
  };

  const handleImageUpload = (floorIndex, locationIndex, file) => {
    try {
      validateImageFile(file);
      
      const newTest = { ...test };
      newTest.floors[floorIndex].locations[locationIndex].endImage = file;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        newTest.floors[floorIndex].locations[locationIndex].endImagePreview = e.target.result;
        setTest({ ...newTest });
      };
      reader.readAsDataURL(file);
      
      setTest(newTest);
    } catch (error) {
      alert(error.message);
    }
  };

  const validateForm = () => {
    for (let i = 0; i < test.floors.length; i++) {
      const floor = test.floors[i];
      for (let j = 0; j < floor.locations.length; j++) {
        const location = floor.locations[j];
        if (!location.endPressure || location.endPressure <= 0) {
          alert(`Please enter end pressure for ${floor.floorName} - ${location.locationName}`);
          return false;
        }
        if (!location.endImage) {
          alert(`Please upload end image for ${floor.floorName} - ${location.locationName}`);
          return false;
        }
      }
    }

    if (!formData.result) {
      alert('Please select test result (Accepted/Rejected)');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setSubmitting(true);
  try {
    console.log('=== SUBMITTING TEST ===');
    
    const submitData = new FormData();
    
    // Add end datetime to all locations
    const updatedFloors = test.floors.map(floor => ({
      ...floor,
      locations: floor.locations.map(location => ({
        ...location,
        endDateTime: new Date().toISOString(),
        // Don't include the File object in JSON
        endImage: location.endImage ? 'pending_upload' : null,
      }))
    }));
    
    // Add form data
    submitData.append('floors', JSON.stringify(updatedFloors));
    submitData.append('result', formData.result);
    submitData.append('comments', formData.comments);
    submitData.append('pressureHoldingTime', formData.pressureHoldingTime);
    submitData.append('drawingReferenceNo', formData.drawingReferenceNo);

    // Append end images with correct field names
    let imageCount = 0;
    test.floors.forEach((floor, floorIndex) => {
      floor.locations.forEach((location, locationIndex) => {
        if (location.endImage && location.endImage instanceof File) {
          const fieldName = `floors[${floorIndex}].locations[${locationIndex}].endImage`;
          submitData.append(fieldName, location.endImage);
          imageCount++;
        }
      });
    });

    console.log(`Uploading ${imageCount} images`);
    
    // Log FormData contents (for debugging)
    for (let pair of submitData.entries()) {
      console.log(pair, ':', pair);
    }

    const response = await pressureTestAPI.updateTest(id, submitData);
    alert('Test completed successfully!');
    
    // Generate and download PDF
    const updatedTest = response.data;
    console.log(updatedTest)
    const pdf = await generatePressureTestReport(updatedTest);
    pdf.save(`pressure-test-report-${updatedTest.projectName.replace(/\s+/g, '-')}.pdf`);
    
    navigate('/end-test');
    
  } catch (error) {
    console.error('Error completing test:', error);
    console.error('Error details:', error.response?.data);
    
    // Show more specific error message
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    alert(`Failed to complete test: ${errorMessage}`);
  } finally {
    setSubmitting(false);
  }
};


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Test Not Found</h2>
          <button
            onClick={() => navigate('/end-test')}
            className="btn btn-primary"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/end-test')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Tests
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Complete Test: {test.projectName}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Test Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Test Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={test.projectName}
                  className="input bg-gray-100"
                  readOnly
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="text"
                  value={new Date(test.startDate).toLocaleString()}
                  className="input bg-gray-100"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Floors and Locations */}
          {test.floors.map((floor, floorIndex) => (
            <div key={floorIndex} className="card p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {floor.floorName}
              </h3>

              <div className="space-y-6">
                {floor.locations.map((location, locationIndex) => (
                  <div key={locationIndex} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800 mb-4">
                      {location.locationName}
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4">
                      {/* Start Data (Read-only) */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Start Pressure (kg)
                        </label>
                        <input
                          type="text"
                          value={location.startPressure}
                          className="input bg-gray-100"
                          readOnly
                        />
                        {location.startImage && (
                          <div className="mt-2">
                            <img
                              src={location.startImage}
                              alt="Start"
                              className="image-preview rounded border"
                            />
                            <p className="text-xs text-gray-500 mt-1">Start Image</p>
                          </div>
                        )}
                      </div>

                      {/* End Pressure */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Pressure (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={location.endPressure || ''}
                          onChange={(e) => updateEndPressure(floorIndex, locationIndex, e.target.value)}
                          className="input"
                          placeholder="10"
                          required
                        />
                      </div>

                      {/* End Image */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Image *
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {console.log(e.target.files[0]);handleImageUpload(floorIndex, locationIndex, e.target.files[0])}}
                          className="hidden"
                          id={`end-image-${floorIndex}-${locationIndex}`}
                        />
                        <label
                          htmlFor={`end-image-${floorIndex}-${locationIndex}`}
                          className="btn btn-secondary flex items-center cursor-pointer w-full justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Choose Photo
                        </label>
                        
                        {location.endImagePreview && (
                          <div className="mt-2">
                            <img
                              src={location.endImagePreview}
                              alt="End Preview"
                              className="image-preview rounded border"
                            />
                            <p className="text-xs text-gray-500 mt-1">End Image Preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Test Results */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pressure Holding Time
                </label>
                <input
                  type="text"
                  value={formData.pressureHoldingTime}
                  onChange={(e) => setFormData({ ...formData, pressureHoldingTime: e.target.value })}
                  className="input"
                  placeholder="23 Hrs 30 Mins"  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Drawing Reference No.
                </label>
                <input
                  type="text"
                  value={formData.drawingReferenceNo}
                  onChange={(e) => setFormData({ ...formData, drawingReferenceNo: e.target.value })}
                  className="input"
                  placeholder="DRG-001"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result *
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="result"
                    value="accepted"
                    checked={formData.result === 'accepted'}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="mr-2"
                  />
                  Accepted
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="result"
                    value="rejected"
                    checked={formData.result === 'rejected'}
                    onChange={(e) => setFormData({ ...formData, result: e.target.value })}
                    className="mr-2"
                  />
                  Rejected
                </label>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comments
              </label>
              <textarea
                value={formData.comments}
                onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                className="input"
                rows="3"
                placeholder="Additional comments..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full btn btn-success flex items-center justify-center text-lg py-4"
          >
            {submitting ? (
              <div className="spinner mr-2"></div>
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            {submitting ? 'Completing Test...' : 'Complete Test & Generate Report'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EndTestDetails;
