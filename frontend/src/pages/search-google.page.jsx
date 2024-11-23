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
    const [searching, setSearching] = useState(false);

    const { userAuth } = useContext(UserContext);
    const { language } = userAuth;
    const translations = getTranslations(language);


    const handleSearchGoogle = async (start = 1) => {
        if (!text.trim()) {
            setError('Search term is required');
            return;
        }
        setSearching(true);
        setError(null);

        try {
            const response = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + `/search/google?query=${text}&start=${start}`
            );

            const { items, searchInformation, queries } = response.data;

            setSearchResults(items || []);
            setTotalResults(searchInformation?.totalResults || 0);
            setTimeTaken(searchInformation?.searchTime || 0);
            setNextPage(queries?.nextPage?.[0]?.startIndex || null);
            setPreviousPage(queries?.request?.[0]?.startIndex > 1 ? queries.request[0].startIndex - 10 : null);
            setCurrentPage(start / 10 + 1);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong with Google search');
        } finally {
            setSearching(false);
        }
    };

    const handleSearchGoogleScholar = async () => {
        if (!text.trim()) {
            setError('Search term is required');
            return;
        }
        setSearching(true);
        setError(null);

        try {
            const response = await axios.get(import.meta.env.VITE_SERVER_DOMAIN + `/search/scholar?query=${text}`);
            setSearchResults(response.data.scholar_results || []);
            setHasSearched(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong with Google Scholar search');
        } finally {
            setSearching(false);
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
                </div>
            </div>

            {/* Search Buttons */}
            <div className="flex justify-center space-x-4 mb-8">
                <button
                    className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                    onClick={() => handleSearchGoogle(1)}
                    disabled={searching}
                >
                    {searching ? 'Searching...' : 'Google Search'}
                </button>
                <button
                    className="bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600"
                    onClick={() => handleSearchGoogleScholar()}
                    disabled={searching}
                >
                    {searching ? 'Searching Scholar...' : 'Google Scholar'}
                </button>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-600 text-center mb-4">{error}</p>}

            {/* Search Results */}
            {hasSearched && (
                <div className="flex flex-col items-center">
                    {totalResults > 0 && (
                        <div className="mb-4 text-center">
                            <p>
                                About <strong>{totalResults}</strong> results (<strong>{timeTaken}</strong> seconds)
                            </p>
                        </div>
                    )}
                    <ul className="w-full max-w-3xl">
                        {searchResults.map((result, index) => (
                            <li key={index} className="border-b border-gray-200 py-4">
                                <a href={result.title_link || result.link} target="_blank" rel="noopener noreferrer">
                                    <h4 className="text-blue-700 font-semibold"><strong>{result.title}</strong></h4>
                                </a>
                                <p className="text-gray-600">{result.snippet}</p>
                                {result.resources && (
                                    <ul className="mt-2">
                                        {result.resources.map((resource, i) => (
                                            <li key={i} className="text-sm text-gray-500">
                                                <a href={resource.link} target="_blank" rel="noopener noreferrer">
                                                    <strong className='text-x text-lime-600 '>[{resource.type}] {resource.title}</strong>
                                                </a>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                                <small className="text-gray-500">{result.displayed_link || result.link}</small>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Pagination */}
            {hasSearched && (
                <div className="flex justify-center mt-4">
                    {previousPage && (
                        <button
                            onClick={() => handleSearchGoogle(previousPage)}
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mx-2"
                            disabled={searching}
                        >
                            Previous
                        </button>
                    )}
                    <span className="mx-4">Page {currentPage}</span>
                    {nextPage && (
                        <button
                            onClick={() => handleSearchGoogle(nextPage)}
                            className="bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 mx-2"
                            disabled={searching}
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
