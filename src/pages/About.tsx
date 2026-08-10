import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Award,
  Heart,
  Mail,
  MessageCircle,
  Share2,
  Download,
  ExternalLink,
  Star,
  CheckCircle,
  TrendingUp,
  Globe
} from 'lucide-react';
import Button from '../components/ui/Button';
import { useNotifications } from '../components/NotificationSystem';

const About: React.FC = () => {
  const [activeTab, setActiveTab] = useState('mission');
  const { addNotification } = useNotifications();

  const handleContact = () => {
    addNotification({
      type: 'info',
      title: 'Contact Us',
      message: 'Opening contact form...'
    });
    // In a real app, this would open a contact form or navigate to contact page
  };

  const handleShare = () => {
    const shareText = 'Check out this amazing job platform for freshers!';
    const shareUrl = window.location.href;
    
    if (navigator.share) {
      navigator.share({
        title: 'Job Platform for Freshers',
        text: shareText,
        url: shareUrl
      });
    } else {
      navigator.clipboard.writeText(`${shareText} - ${shareUrl}`);
      addNotification({
        type: 'success',
        title: 'Link copied!',
        message: 'Page link copied to clipboard'
      });
    }
  };

  const handleDownloadReport = () => {
    addNotification({
      type: 'info',
      title: 'Download Started',
      message: 'Preparing annual report for download...'
    });
    // Simulate download
    setTimeout(() => {
      addNotification({
        type: 'success',
        title: 'Download Complete',
        message: 'Annual report downloaded successfully'
      });
    }, 2000);
  };

  const stats = [
    { label: 'Jobs Posted', value: '10,000+', icon: <Target className="h-6 w-6" /> },
    { label: 'Companies', value: '500+', icon: <Users className="h-6 w-6" /> },
    { label: 'Success Stories', value: '2,500+', icon: <Award className="h-6 w-6" /> },
    { label: 'Happy Users', value: '50,000+', icon: <Heart className="h-6 w-6" /> }
  ];

  const values = [
    {
      title: 'Innovation',
      description: 'We constantly innovate to provide the best job search experience for freshers.',
      icon: <TrendingUp className="h-8 w-8" />
    },
    {
      title: 'Trust',
      description: 'Building trust through transparency and reliable job opportunities.',
      icon: <CheckCircle className="h-8 w-8" />
    },
    {
      title: 'Growth',
      description: 'Supporting career growth with learning resources and mentorship.',
      icon: <Star className="h-8 w-8" />
    },
    {
      title: 'Community',
      description: 'Creating a supportive community for freshers to connect and grow.',
      icon: <Users className="h-8 w-8" />
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Founder',
      image: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Former HR professional with 10+ years experience in talent acquisition.'
    },
    {
      name: 'Michael Chen',
      role: 'CTO',
      image: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Tech enthusiast passionate about building scalable solutions for job seekers.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Head of Product',
      image: 'https://images.pexels.com/photos/3777943/pexels-photo-3777943.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      bio: 'Product strategist focused on creating intuitive user experiences.'
    }
  ];

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Empowering Freshers to Build Their Careers
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            We're dedicated to connecting talented freshers with amazing opportunities. 
            Our platform makes job hunting simple, efficient, and successful.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={handleContact}
              icon={<Mail className="h-5 w-5" />}
            >
              Get in Touch
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              icon={<Share2 className="h-5 w-5" />}
            >
              Share Our Story
            </Button>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg p-6 text-center"
            >
              <div className="flex justify-center mb-3">
                <div className="p-3 bg-primary-50 rounded-full text-primary-600">
                  {stat.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Mission & Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex flex-wrap gap-2 mb-8">
              {['mission', 'values', 'team'].map((tab) => (
                <Button
                  key={tab}
                  variant={activeTab === tab ? 'primary' : 'ghost'}
                  onClick={() => setActiveTab(tab)}
                  className="capitalize"
                >
                  {tab}
                </Button>
              ))}
            </div>

            {activeTab === 'mission' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    To bridge the gap between talented freshers and innovative companies, 
                    making the job search process seamless and successful for everyone.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">For Job Seekers</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Access to verified job opportunities</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Career guidance and mentorship</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Skill development resources</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Direct connection with employers</span>
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">For Companies</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Access to fresh talent pool</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Streamlined hiring process</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Verified candidate profiles</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                        <span>Cost-effective recruitment</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'values' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    These core values guide everything we do and shape our culture.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {values.map((value, index) => (
                    <motion.div
                      key={value.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-6"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="p-3 bg-primary-100 rounded-full text-primary-600">
                          {value.icon}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{value.title}</h3>
                      </div>
                      <p className="text-gray-600">{value.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'team' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8"
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    The passionate individuals behind our mission to transform job hunting for freshers.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {team.map((member, index) => (
                    <motion.div
                      key={member.name}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 rounded-xl p-6 text-center"
                    >
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                      />
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">{member.name}</h3>
                      <p className="text-primary-600 font-medium mb-3">{member.role}</p>
                      <p className="text-gray-600 text-sm">{member.bio}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of freshers who have found their dream jobs through our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              onClick={handleContact}
              icon={<MessageCircle className="h-5 w-5" />}
            >
              Get Started Today
            </Button>
            <Button
              variant="outline"
              onClick={handleDownloadReport}
              icon={<Download className="h-5 w-5" />}
            >
              Download Annual Report
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About; 