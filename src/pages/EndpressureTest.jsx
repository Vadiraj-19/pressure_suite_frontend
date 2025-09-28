import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin, Calendar } from 'lucide-react';
import { pressureTestAPI } from '../services/api';
import { formatDate, formatDateTime } from '../utils/helpers';

const EndPressureTest = () => {
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOngoingTests();
  }, []);

  const fetchOngoingTests = async () => {
    try {
      const response = await pressureTestAPI.getOngoingTests();
      setTests(response.data);
    } catch (error) {
      console.error('Error fetching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
          <h1 className="text-3xl font-bold text-gray-900">End Pressure Test</h1>
        </div>

        {tests.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" readOnly />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No Ongoing Tests
            </h3>
            <p className="text-gray-600 mb-6">
              There are no active pressure tests at the moment.
            </p>
            <button
              onClick={() => navigate('/start-test')}
              className="btn btn-primary"
            >
              Start New Test
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div
                key={test._id}
                className="card p-6 card-hover cursor-pointer"
                onClick={() => navigate(`/end-test/${test._id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 truncate">
                    {test.projectName}
                  </h3>
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                    Ongoing
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Started: {formatDate(test.startDate)}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    {test.floors.length} Floor{test.floors.length !== 1 ? 's' : ''}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    {test.floors.reduce((total, floor) => total + floor.locations.length, 0)} Location{test.floors.reduce((total, floor) => total + floor.locations.length, 0) !== 1 ? 's' : ''}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="text-sm text-gray-500 mb-2">Floors:</div>
                  <div className="flex flex-wrap gap-1">
                    {test.floors.slice(0, 3).map((floor, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                      >
                        {floor.floorName}
                      </span>
                    ))}
                    {test.floors.length > 3 && (
                      <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                        +{test.floors.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                <button className="w-full mt-4 btn btn-primary">
                  Complete Test
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EndPressureTest;
