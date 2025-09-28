import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Square, TestTube, Building, Clock, Shield } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <TestTube className="w-8 h-8" />,
      title: "Digital Testing",
      description: "Modern approach to pressure testing with digital records"
    },
    {
      icon: <Building className="w-8 h-8" />,
      title: "Multi-Floor Support",
      description: "Manage tests across multiple floors and locations"
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Real-time Tracking",
      description: "Track test progress and timing in real-time"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Secure & Reliable",
      description: "Secure data storage with reliable backup systems"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Pressure Test Management System
            </h1>
            <p className="text-xl mb-12 max-w-2xl mx-auto">
              Professional pipeline pressure testing solution for construction and engineering projects. 
              Manage, track, and generate reports with ease.
            </p>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={() => navigate('/start-test')}
                className="flex items-center gap-3 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
              >
                <Play className="w-6 h-6" />
                Start Pressure Test
              </button>
              
              <button
                onClick={() => navigate('/end-test')}
                className="flex items-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                <Square className="w-6 h-6" />
                End Pressure Test
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose Our System?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Built specifically for construction professionals, our system streamlines 
              pressure testing processes and ensures compliance with industry standards.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 text-primary-600 rounded-xl mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Simple three-step process to manage your pressure tests effectively
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 text-white rounded-full mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Start Test
              </h3>
              <p className="text-gray-600">
                Create a new test project, add floors and locations with initial pressure readings and images
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 text-white rounded-full mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Monitor
              </h3>
              <p className="text-gray-600">
                Track ongoing tests and pressure holding times across all your active projects
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-500 text-white rounded-full mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Complete & Report
              </h3>
              <p className="text-gray-600">
                End tests with final readings and automatically generate professional PDF reports
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Testing?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join hundreds of construction professionals who trust our platform for their pressure testing needs.
          </p>
          <button
            onClick={() => navigate('/start-test')}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors duration-200 shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Pressure Test Management</h3>
          <p className="text-gray-400 mb-4">
            Professional pipeline pressure testing solution
          </p>
          <p className="text-gray-500 text-sm">
            © 2025 Pressure Test Management. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
