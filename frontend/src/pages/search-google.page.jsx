import React from 'react';
import googleLogo from '../imgs/google-logo.png';

const SearchGooglePage = () => {
return (
    <div className="text-center mt-12 mb-4">
        <div className="mb-8">
            <img src={googleLogo} alt="Google Logo" className="mx-auto w-1/4" />
        </div>
        <div className="flex items-center justify-center mb-8">
            <div className="relative w-3/5">
                <input type="text" className="w-full py-3 px-5 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                <i className="fas fa-microphone absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
                <i className="fas fa-camera absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
            </div>
        </div>
        <div className="flex justify-center space-x-4">
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200">Google Search</button>
            <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200">I'm Feeling Lucky</button>
        </div>
    </div>
);
}

export default SearchGooglePage;
