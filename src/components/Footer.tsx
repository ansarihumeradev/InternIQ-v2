import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, Phone, MapPin, Twitter, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-primary-600 to-accent-600 rounded-lg">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">FresherJobs</span>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering freshers with smarter job and internship discovery. 
              Your career journey starts here.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/jobs" className="block text-gray-300 hover:text-white transition-colors">
                Browse Jobs
              </Link>
              <Link to="/internships" className="block text-gray-300 hover:text-white transition-colors">
                Find Internships
              </Link>
              <Link to="/companies" className="block text-gray-300 hover:text-white transition-colors">
                Companies
              </Link>
              <Link to="/profile" className="block text-gray-300 hover:text-white transition-colors">
                Create Profile
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <div className="space-y-2">
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Career Tips
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Interview Prep
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Resume Builder
              </a>
              <a href="#" className="block text-gray-300 hover:text-white transition-colors">
                Skill Assessment
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span className="text-sm">contact@fresherjobs.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+91 98765 43210</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © 2025 FresherJobs. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;