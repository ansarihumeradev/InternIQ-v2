import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Mail, MapPin } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-100 text-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-xl shadow-sm">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">InternIQ</span>
            </div>
            <p className="text-slate-500 text-sm">
              Empowering freshers with smarter job and internship discovery.
              Your career journey starts here.
            </p>

          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link to="/internships" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Explore Internships
              </Link>
              <Link to="/companies" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Partner Companies
              </Link>
              <Link to="/profile" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Create Profile
              </Link>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Resources</h3>
            <div className="space-y-2">
              <Link to="/career-guidance" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Career Tips
              </Link>
              <Link to="/interview-prep" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Interview Prep
              </Link>
              <Link to="/resume-builder" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Resume Builder
              </Link>
              <Link to="/skill-development" className="block text-slate-500 hover:text-teal-600 transition-colors">
                Skill Assessment
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-500">
                <Mail className="h-4 w-4 text-teal-500" />
                <span className="text-sm">contact.interniq@gmail.com</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-500">
                <MapPin className="h-4 w-4 text-teal-500" />
                <span className="text-sm">Mumbai, India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">
            © 2026 InternIQ. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;