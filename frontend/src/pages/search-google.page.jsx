/* eslint-disable no-unused-vars */
import { useState, useContext } from "react";
import axios from "axios";
import { getTranslations } from "../../translations";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";

const SearchGooglePage = () => {
  const [text, setText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [nextPage, setNextPage] = useState(null);
  const [previousPage, setPreviousPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [timeTaken, setTimeTaken] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchType, setSearchType] = useState("google"); // 'google' or 'scholar'

  const { userAuth } = useContext(UserContext);
  const { language } = userAuth;
  const translations = getTranslations(language);

  const handleSearchGoogle = async (start = 1, queryOverride = null) => {
    const query = queryOverride || text;
    if (!query.trim()) return setError("Nhập nội dung bạn cần tìm...");

    setSearching(true);
    setError(null);
    setSearchType("google");

    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN +
          `/search/google?query=${query}&start=${start}`,
      );
      const { items, searchInformation, queries } = response.data;
      setSearchResults(items || []);
      setTotalResults(searchInformation?.totalResults || 0);
      setTimeTaken(searchInformation?.searchTime || 0);
      setNextPage(queries?.nextPage?.[0]?.startIndex || null);
      setPreviousPage(
        queries?.request?.[0]?.startIndex > 1
          ? queries.request[0].startIndex - 10
          : null,
      );
      setCurrentPage(Math.floor(start / 10) + 1);
      setHasSearched(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Không thể kết nối đến máy chủ tìm kiếm.");
    } finally {
      setSearching(false);
    }
  };

  const handleSearchGoogleScholar = async () => {
    if (!text.trim()) return setError("Nhập nội dung bạn cần tìm...");
    setSearching(true);
    setError(null);
    setSearchType("scholar");

    try {
      const response = await axios.get(
        import.meta.env.VITE_SERVER_DOMAIN + `/search/scholar?query=${text}`,
      );
      setSearchResults(response.data.scholar_results || []);
      setTotalResults(response.data.scholar_results?.length || 0);
      setHasSearched(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError("Lỗi truy vấn dữ liệu học thuật.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <AnimationWrapper>
      <div className="min-h-screen bg-[#fafafa] font-inter">
        {/* Immersive Search Header */}
        <div className="relative pt-20 pb-16 px-6 overflow-hidden">
          {/* Abstract background elements */}
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[60%] bg-indigo-100/40 rounded-full blur-[120px] -z-10 animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[50%] bg-violet-100/40 rounded-full blur-[100px] -z-10"></div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white shadow-sm border border-slate-100 mb-8 animate-fade-in">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-xs font-bold text-slate-600 tracking-wide uppercase">
                AI-Powered Academic Search
              </span>
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
              Khám phá <span className="text-indigo-600">Tri thức</span> <br />
              <span className="text-slate-400/80 italic">Toàn cầu</span>
            </h1>

            <div className="max-w-2xl mx-auto relative group mt-10">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] blur opacity-15 group-focus-within:opacity-30 transition duration-1000"></div>

              <div className="relative flex items-center bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200 p-2 focus-within:border-indigo-400 transition-all">
                <i className="fi fi-rr-search ml-6 text-xl text-slate-400"></i>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none outline-none px-4 py-4 text-lg text-slate-800 placeholder:text-slate-400 font-medium"
                  placeholder="Bạn đang tìm kiếm tài liệu gì?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearchGoogle(1)}
                />
                <div className="hidden md:flex gap-1 pr-1">
                  <button
                    onClick={() => handleSearchGoogle(1)}
                    className={`px-6 py-3.5 rounded-full font-bold text-sm transition-all ${searchType === "google" ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Google
                  </button>
                  <button
                    onClick={handleSearchGoogleScholar}
                    className={`px-6 py-3.5 rounded-full font-bold text-sm transition-all ${searchType === "scholar" ? "bg-indigo-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-50"}`}
                  >
                    Scholar
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Buttons */}
            <div className="flex md:hidden justify-center gap-3 mt-4 px-2">
              <button
                onClick={() => handleSearchGoogle(1)}
                className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold text-sm shadow-xl"
              >
                Google Search
              </button>
              <button
                onClick={handleSearchGoogleScholar}
                className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-bold text-sm shadow-xl"
              >
                Scholar
              </button>
            </div>

            {error && (
              <p className="mt-6 text-rose-500 font-bold text-sm flex items-center justify-center gap-2 animate-shake">
                <i className="fi fi-rr-info"></i> {error}
              </p>
            )}
          </div>
        </div>

        {/* Main Results Area */}
        <div className="max-w-5xl mx-auto px-6 pb-32">
          {searching ? (
            <div className="py-24 flex flex-col items-center animate-fade-in">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <i className="fi fi-rr-search-alt text-indigo-300 animate-pulse"></i>
                </div>
              </div>
              <p className="mt-6 text-slate-400 font-bold tracking-widest text-[10px] uppercase">
                Searching global knowledge base...
              </p>
            </div>
          ) : hasSearched ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Results Column */}
              <div className="lg:col-span-8 space-y-12">
                <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Kết quả
                  </h2>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    {totalResults.toLocaleString()} Items Found
                  </span>
                </div>

                <div className="space-y-16">
                  {searchResults.map((result, index) => (
                    <AnimationWrapper
                      key={index}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="group relative">
                        {/* Line indicator */}
                        <div className="absolute -left-6 top-0 bottom-0 w-0.5 bg-slate-100 group-hover:bg-indigo-500 transition-colors duration-500"></div>

                        <div className="flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                              SOURCE {index + 1}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                              {result.displayed_link || result.link}
                            </span>
                          </div>

                          <a
                            href={result.title_link || result.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group-hover:text-indigo-600 transition-all inline-block"
                          >
                            <h3 className="text-2xl font-bold text-slate-800 leading-tight tracking-tight">
                              {result.title}
                            </h3>
                          </a>

                          <p className="text-slate-500 text-base leading-relaxed max-w-2xl">
                            {result.snippet}
                          </p>

                          {result.resources && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {result.resources.map((res, i) => (
                                <a
                                  key={i}
                                  href={res.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2.5 px-4 py-2 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all shadow-sm"
                                >
                                  <i className="fi fi-rr-file-download text-indigo-500"></i>
                                  <span className="opacity-40 font-black">
                                    {res.type}
                                  </span>
                                  {res.title}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </AnimationWrapper>
                  ))}
                </div>

                {searchType === "google" && (
                  <div className="flex items-center gap-4 pt-10 mt-20 border-t border-slate-100">
                    <button
                      onClick={() =>
                        previousPage && handleSearchGoogle(previousPage)
                      }
                      disabled={!previousPage}
                      className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 transition-all"
                    >
                      <i className="fi fi-rr-arrow-left"></i> Previous
                    </button>
                    <div className="w-14 h-14 rounded-full bg-white border-2 border-indigo-600 text-indigo-600 flex items-center justify-center font-black text-sm shadow-xl shadow-indigo-100">
                      {currentPage}
                    </div>
                    <button
                      onClick={() => nextPage && handleSearchGoogle(nextPage)}
                      disabled={!nextPage}
                      className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl border-2 border-slate-100 font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:border-slate-300 disabled:opacity-30 transition-all"
                    >
                      Next <i className="fi fi-rr-arrow-right"></i>
                    </button>
                  </div>
                )}
              </div>

              {/* Info Sidebar */}
              <div className="lg:col-span-4 space-y-8">
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/20 sticky top-[160px]">
                  <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
                    <i className="fi fi-rr-info text-xl"></i>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-3 tracking-tight">
                    Về công cụ này
                  </h4>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6">
                    Công cụ này sử dụng API từ Google Search và Google Scholar
                    để mang lại cho bạn những kết quả chính xác nhất trong thế
                    giới học thuật.
                  </p>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                      <span className="text-xs font-bold text-slate-700">
                        Tốc độ: {timeTaken}s
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                      <span className="text-xs font-bold text-slate-700">
                        Chế độ:{" "}
                        {searchType === "google" ? "General" : "Academic"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-xs font-bold text-slate-700">
                        Phân loại: Tự động
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      window.scrollTo({ top: 0, behavior: "smooth" })
                    }
                    className="w-full mt-8 py-4 bg-slate-50 text-slate-400 rounded-2xl text-xs font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-slate-900 transition-all"
                  >
                    Cuộn lên đầu
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center animate-fade-in">
              <div className="flex justify-center gap-8 opacity-20 grayscale">
                <i className="fi fi-brands-google text-6xl"></i>
                <i className="fi fi-rr-graduation-cap text-6xl"></i>
                <i className="fi fi-rr-microchip text-6xl"></i>
              </div>
              <p className="mt-8 text-slate-300 font-bold text-sm tracking-widest uppercase">
                Global Knowledge Database
              </p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        .font-inter {
          font-family: "Inter", sans-serif;
        }
      `}</style>
    </AnimationWrapper>
  );
};

export default SearchGooglePage;
