import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          {/* About Section */}
          <div className="w-full sm:w-1/3 mb-6 sm:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">About Us</h3>
            <p className="text-sm leading-relaxed">
              EduBlog is a platform for students to share knowledge, explore tutorials, and learn together. Join us for more educational content.
            </p>
          </div>

          {/* Quick Links Section */}
          <div className="w-full sm:w-1/3 mb-6 sm:mb-0">
            <h3 className="text-white text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a href="/about" className="hover:text-gray-400">About Us</a>
              </li>
              <li>
                <a href="/contact" className="hover:text-gray-400">Contact</a>
              </li>
              <li>
                <a href="/privacy" className="hover:text-gray-400">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms" className="hover:text-gray-400">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div className="w-full sm:w-1/3">
            <h3 className="text-white text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-6">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
              >
                <i className="fab fa-facebook fa-lg"></i>
              </a>
              <a
                href="https://www.twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
              >
                <i className="fab fa-twitter fa-lg"></i>
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
              >
                <i className="fab fa-instagram fa-lg"></i>
              </a>
              <a
                href="https://www.linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:text-white transition"
              >
                <i className="fa fa-linkedin fa-lg"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-8"></div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} EduBlog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
