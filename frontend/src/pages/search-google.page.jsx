import React, { useState } from 'react';
import axios from 'axios';
import { useContext } from "react";
import { getTranslations } from "../../translations";
import { UserContext } from "../App";

const SearchGooglePage = () => {
    const [text, setText] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [error, setError] = useState(null);
    const [nextPage, setNextPage] = useState(null);
    const [previousPage, setPreviousPage] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [timeTaken, setTimeTaken] = useState(0);
    const [hasSearched, setHasSearched] = useState(false);

    const { userAuth } = useContext(UserContext);
    const { language } = userAuth;
    const translations = getTranslations(language);


    const handleSearchGoogle = async (start = 1) => {
        if (!text) {
            setError('Search term is required');
            return;
        }

        try {
            const response = await axios.get(
                `http://localhost:3000/search/google?query=${text}&start=${start}`
            );

            const { items, searchInformation, queries } = response.data;

            setSearchResults(items || []);
            setTotalResults(searchInformation.totalResults || 0);
            setTimeTaken(searchInformation.searchTime || 0);
            setNextPage(queries?.nextPage?.[0]?.startIndex || null);
            setPreviousPage(queries?.request?.[0]?.startIndex > 1 ? queries.request[0].startIndex - 10 : null);
            setCurrentPage(start / 10 + 1);
            setError(null);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong with Google search');
        }
    };

    return (
        <div className="mt-12 mb-4 px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray">{translations.searchGoogle}</h1>
            </div>

            {/* Search Input */}
            <div className="flex items-center justify-center mb-8">
                <div className="relative w-full max-w-lg">
                    <input
                        type="text"
                        className="w-full py-3 px-5 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Enter your search term"
                    />
                    <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"></i>
                </div>
            </div>

            {/* Search Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
                <button
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                    onClick={() => handleSearchGoogle(1)}
                >
                    Google Search
                </button>
                <button
                    className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200"
                    onClick={() => setError('Google Scholar is not implemented yet')}
                >
                    Google Scholar
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {/* Search Results */}
            {hasSearched && (
                <div className="flex justify-center">
                    <div className="w-full max-w-3xl">
                        {totalResults > 0 && (
                            <div className="mb-4 text-center">
                                <p>
                                    About {totalResults} results ({timeTaken} seconds)
                                </p>
                            </div>
                        )}
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
            )}

            {/* Pagination */}
            {hasSearched && (
                <div className="flex justify-center mt-4">
                    {previousPage && (
                        <button
                            onClick={() => handleSearchGoogle(previousPage)}
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mx-2"
                        >
                            Previous
                        </button>
                    )}
                    <span className="mx-4">
                        Page {currentPage}
                    </span>
                    {nextPage && (
                        <button
                            onClick={() => handleSearchGoogle(nextPage)}
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mx-2"
                        >
                            Next
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchGooglePage;
