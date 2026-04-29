/* eslint-disable react/prop-types */
import { useMemo, createContext, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { lookInSession, removeFromSession } from "./common/session";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import Editor from "./pages/editor.pages";
import HomePage from "./pages/home.page";
import SearchPage from "./pages/search.page";
import PageNotFound from "./pages/404.page";
import ProfilePage from "./pages/profile.page";
import BlogPage from "./pages/blog.page";
import SideNav from "./components/sidenavbar.component";
import ChangePassword from "./pages/change-password.page";
import EditProfile from "./pages/edit-profile.page";
import Notifications from "./pages/notifications.page";
import ManageBlogs from "./pages/manage-blogs.page";
import VerifyOtp from "./pages/verifyOtp.page";
import NewPasswordPage from "./pages/new-password.page";
import ForgotPasswordPage from "./pages/forgot-password.page";
import ChatUI from "./pages/chat.page";
import { SocketContextProvider } from "./socket/SocketContext.jsx";
import Footer from "./components/footer.component.jsx";
import PrivacyPage from "./pages/privacy.page";
import PolicyPage from "./pages/policy.page";
import ContactPage from "./pages/contact.page";
import TermsOfServicePage from "./pages/terms-of-service.page";
import SearchGooglePage from "./pages/search-google.page.jsx";
import LandingPage from "./pages/landing.page.jsx";

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkThemePreference = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const ProtectedRoute = ({ children, access_token }) => {
  return access_token ? children : <Navigate to="/signin" />;
};

const App = () => {
  const location = useLocation();
  const [userAuth, setUserAuth] = useState(() => {
    const userInSession = lookInSession("user");

    if (userInSession) {
      const parsedUser = JSON.parse(userInSession);

      if (parsedUser.access_token) {
        try {
          const decoded = jwtDecode(parsedUser.access_token);
          const currentTime = Date.now() / 1000;

          if (decoded.exp < currentTime) {
            removeFromSession("user");
            return { access_token: null };
          }
        } catch (error) {
          removeFromSession("user");
          return { access_token: null };
        }
      }
      return parsedUser;
    }

    return { access_token: null };
  });

  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (
          error.response &&
          (error.response.status === 403 || error.response.status === 401)
        ) {
          removeFromSession("user");
          setUserAuth({ access_token: null });
        }
        return Promise.reject(error);
      },
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  const [fullScreenImage, setFullScreenImage] = useState(null);

  const [theme, setTheme] = useState(() =>
    darkThemePreference() ? "dark" : "light",
  );

  useEffect(() => {
    const themeInSession = lookInSession("theme");

    if (themeInSession) {
      setTheme(themeInSession);
      document.body.setAttribute("data-theme", themeInSession);
    } else {
      document.body.setAttribute("data-theme", theme);
    }
  }, [theme]);

  const themeContextValue = useMemo(() => ({ theme, setTheme }), [theme]);
  const userContextValue = useMemo(
    () => ({
      userAuth,
      setUserAuth,
      fullScreenImage,
      setFullScreenImage,
    }),
    [userAuth, fullScreenImage],
  );

  const excludedPaths = [
    "/dashboard",
    "/settings",
    "/chat",
    "/editor",
    "/landing",
    "/feed",
  ];
  const shouldShowFooter = !excludedPaths.some((path) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path),
  );

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <UserContext.Provider value={userContextValue}>
        <SocketContextProvider>
          <div className="flex flex-col min-h-screen text-black transition-colors duration-300">
            <div className="flex-grow">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route
                  path="/editor"
                  element={
                    <ProtectedRoute access_token={userAuth.access_token}>
                      <Editor />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/editor/:blog_id"
                  element={
                    <ProtectedRoute access_token={userAuth.access_token}>
                      <Editor />
                    </ProtectedRoute>
                  }
                />
                <Route path="/" element={<Navbar />}>
                  <Route path="feed" element={<HomePage />}>
                    <Route path="following" element={<HomePage />} />
                    <Route path="saved" element={<HomePage />} />
                  </Route>
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute access_token={userAuth.access_token}>
                        <SideNav />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="blogs" element={<ManageBlogs />} />
                    <Route path="notifications" element={<Notifications />} />
                  </Route>
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute access_token={userAuth.access_token}>
                        <SideNav />
                      </ProtectedRoute>
                    }
                  >
                    <Route path="edit-profile" element={<EditProfile />} />
                    <Route
                      path="change-password"
                      element={<ChangePassword />}
                    />
                  </Route>
                  <Route path="verify" element={<VerifyOtp />} />
                  <Route
                    path="signin"
                    element={<UserAuthForm type="sign-in" />}
                  />
                  <Route
                    path="signup"
                    element={<UserAuthForm type="sign-up" />}
                  />
                  <Route path="new-password" element={<NewPasswordPage />} />
                  <Route
                    path="forgot-password"
                    element={<ForgotPasswordPage />}
                  />
                  <Route
                    path="chat"
                    element={
                      <ProtectedRoute access_token={userAuth.access_token}>
                        <ChatUI />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="search/:query" element={<SearchPage />} />
                  <Route path="user/:id" element={<ProfilePage />} />
                  <Route path="blog/:blog_id" element={<BlogPage />} />
                  <Route path="privacy" element={<PrivacyPage />} />
                  <Route path="policy" element={<PolicyPage />} />
                  <Route path="contact" element={<ContactPage />} />
                  <Route
                    path="terms-of-service"
                    element={<TermsOfServicePage />}
                  />
                  <Route
                    path="search-google"
                    element={
                      <ProtectedRoute access_token={userAuth.access_token}>
                        <SearchGooglePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<PageNotFound />} />
                </Route>
              </Routes>
            </div>
            {shouldShowFooter && <Footer />}
          </div>

          {/* Global Full Screen Image Modal */}
          {fullScreenImage && (
            <div
              className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-fade-in"
              onClick={() => setFullScreenImage(null)}
            >
              <button
                className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all duration-300 z-10"
                onClick={() => setFullScreenImage(null)}
              >
                <i className="fi fi-br-cross text-xl"></i>
              </button>

              <div className="relative max-w-5xl max-h-full flex items-center justify-center">
                <img
                  src={fullScreenImage}
                  className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-zoom-in"
                  alt="Full View"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          )}
        </SocketContextProvider>
      </UserContext.Provider>
    </ThemeContext.Provider>
  );
};

export default App;
