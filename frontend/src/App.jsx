import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/navbar.component";
import UserAuthForm from "./pages/userAuthForm.page";
import { createContext, useEffect, useState } from "react";
import { lookInSession } from "./common/session";
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

export const UserContext = createContext({});
export const ThemeContext = createContext({});

const darkThemePreference = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

const App = () => {
    const [userAuth, setUserAuth] = useState(() => {
        const userInSession = lookInSession("user");
        return userInSession ? JSON.parse(userInSession) : { access_token: null };
    });

    const [theme, setTheme] = useState(() => darkThemePreference() ? "dark" : "light");

    useEffect(() => {
        const themeInSession = lookInSession("theme");

        if (themeInSession) {
            setTheme(themeInSession);
            document.body.setAttribute("data-theme", themeInSession);
        } else {
            document.body.setAttribute("data-theme", theme);
        }
    }, [theme]);

    const ProtectedRoute = ({ children }) => {
        return userAuth?.access_token ? children : <Navigate to="/signin" />;
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            <UserContext.Provider value={{ userAuth, setUserAuth }}>
                <SocketContextProvider>
                    <div className="flex flex-col min-h-screen">
                        <div className="flex-grow">
                            <Routes>
                                <Route path="/editor" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                                <Route path="/editor/:blog_id" element={<ProtectedRoute><Editor /></ProtectedRoute>} />
                                <Route path="/" element={<Navbar />}>
                                    <Route index element={<HomePage />} />
                                    <Route path="dashboard" element={<ProtectedRoute><SideNav /></ProtectedRoute>}>
                                        <Route path="blogs" element={<ManageBlogs />} />
                                        <Route path="notifications" element={<Notifications />} />
                                    </Route>
                                    <Route path="settings" element={<ProtectedRoute><SideNav /></ProtectedRoute>}>
                                        <Route path="edit-profile" element={<EditProfile />} />
                                        <Route path="change-password" element={<ChangePassword />} />
                                    </Route>
                                    <Route path="verify" element={<VerifyOtp />} />
                                    <Route path="signin" element={<UserAuthForm type="sign-in" />} />
                                    <Route path="signup" element={<UserAuthForm type="sign-up" />} />
                                    <Route path="new-password" element={<NewPasswordPage />} />
                                    <Route path="forgot-password" element={<ForgotPasswordPage />} />
                                    <Route path="chat" element={<ProtectedRoute><ChatUI /></ProtectedRoute>} />
                                    <Route path="search/:query" element={<SearchPage />} />
                                    <Route path="user/:id" element={<ProfilePage />} />
                                    <Route path="blog/:blog_id" element={<BlogPage />} />
                                    <Route path="privacy" element={<PrivacyPage />} />
                                    <Route path="policy" element={<PolicyPage />} />
                                    <Route path="contact" element={<ContactPage />} />
                                    <Route path="terms-of-service" element={<TermsOfServicePage />} />
                                    <Route path="search-google" element={<SearchGooglePage />} />
                                    <Route path="*" element={<PageNotFound />} />
                                </Route>
                            </Routes>
                        </div>
                        <Footer />
                    </div>
                </SocketContextProvider>

            </UserContext.Provider>
        </ThemeContext.Provider>
    );
};

export default App;
