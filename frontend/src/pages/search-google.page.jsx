import React, { useState } from 'react';
import axios from 'axios';
import googleLogo from '../imgs/google-logo.png';

const SearchGooglePage = () => {
    const [text, setText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);

    const handleSearchGoogle = async (start = 1) => {
        if (!text) {
            setError('Search term is required');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:3000/search/google?query=${text}&start=${start}`
            );

            setSearchResults(response.data.items || []);

            setNextPage(response.data.nextPage || null);
            setPreviousPage(response.data.previousPage || null);
            setCurrentStart(start);

            console.log('Google response: ', response);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                'Something went wrong with Google search'
            );
        }
    };

    return (
        <div className="mt-12 mb-4 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                {/* <img src={googleLogo} alt="Google Logo" className="mx-auto w-1/4" /> */}
                <h1 className="text-3xl font-bold text-gray-800">Kho Tài Liệu</h1>
            </div>
            <div className="flex items-center justify-center mb-8">
                <div className="relative w-full max-w-lg">
                    <input type="text" className="w-full py-3 px-5 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" value={text} onChange={(e) => setText(e.target.value)} />
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                    <i className="fas fa-microphone absolute right-12 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
                    <i className="fas fa-camera absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-500"></i>
                </div>
            </div>
            <div className="flex justify-center space-x-4 mb-8">
                <button className="bg-gray-100 text-gray-70</div>0 py-2 px-4 rounded-md hover:bg-gray-200" onClick={() => handleSearchGoogle(1)} >Google Search</button>
                <button className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200">Google Scholar</button>
            </div>

            <div className="flex justify-center">
                {/* Display search results here */}
                <div className="w-full max-w-3xl">
                    <ul>
                        {searchResults.map((result, index) => (
                            <li key={index} className="mb-4">
                                <a href={result.link} target="_blank" rel="noopener noreferrer">
                                    <h4 className="text-blue-700">{result.title}</h4>
                                </a>
                                <p className="text-gray-600">{result.snippet}</p>
                                <small className="text-gray-500">{result.link}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Pagination Controls for Google Search */}
            <div className="flex justify-center mt-4">
                {previousPage && (
                    <button
                        onClick={() => handleSearchGoogle(previousPage)}
                        className="bg-gray-100 text-gray-700 py-2 px-4 rou</a>nded-md hover:bg-gray-200 mx-2"
                    >
                        Previous
                    </button>
                )}
                {nextPage && (
                    <button
                        onClick={() => handleSearchGoogle(nextPage)}
                        className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mx-2"
                    >
                        Next
                    </button>
                )}
            </div>
        </div>
    );
}

export default SearchGooglePage;
