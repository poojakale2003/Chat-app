import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import assets from "../assets/assets";

const LoginPage = () => {
  const [currState, setCurrState] = useState("Sign up");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");
  const [isDataSubmitted, setIsDataSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (currState === 'Sign up' && !isDataSubmitted) {
        setIsDataSubmitted(true);
        return;
      }

      if (currState === 'Sign up') {
        // Register user
        await register({
          fullName,
          email,
          password,
          bio: bio || 'Hi Everyone, I am Using QuickChat'
        });
        navigate('/');
      } else {
        // Login user
        await login(email, password);
        navigate('/');
      }
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col p-4">
      {/* Logo Section */}
      <div className="flex flex-col items-center text-center max-sm:mb-8">
        <img src={assets.logo_big} alt="logo" className="w-[min(30vw,250px)] mb-4" />
        <p className="text-gray-300 text-lg">Connect with friends instantly</p>
      </div>

      {/* Form Section */}
      <div className="w-full max-w-md">
        <form onSubmit={onSubmitHandler} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {currState}
            </h2>
            {isDataSubmitted && (
              <button
                type="button"
                onClick={() => setIsDataSubmitted(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <img 
                  src={assets.arrow_icon}
                  alt="back"
                  className="w-5 h-5 filter brightness-0 invert"
                />
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
              {error}
            </div>
          )}

              {/* Full Name Field (Sign up only) */}
              {currState === "Sign up" && !isDataSubmitted && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">Full Name</label>
                  <input
                    onChange={(e) => setFullName(e.target.value)}
                    value={fullName}
                    type="text"
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              )}

              {/* Email and Password Fields */}
              {!isDataSubmitted && (
                <>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">Email Address</label>
                    <input
                      onChange={(e) => setEmail(e.target.value)}
                      value={email}
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">Password</label>
                    <input
                      onChange={(e) => setPassword(e.target.value)}
                      value={password}
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                    />
                  </div>
                </>
              )}

              {/* Bio Field (Sign up step 2) */}
              {currState === "Sign up" && isDataSubmitted && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-white transition-colors duration-300 hover:text-purple-200">Bio</label>
                  <textarea
                    onChange={(e) => setBio(e.target.value)}
                    value={bio}
                    rows={4}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-400 resize-none transition-all duration-300 hover:bg-white/10 hover:border-white/30 hover:scale-[1.02]"
                    placeholder="Tell us about yourself..."
                    required
                  />
                </div>
              )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {currState === "Sign up" ? "Creating Account..." : "Signing In..."}
              </div>
            ) : (
              currState === "Sign up" ? "Create Account" : "Login Now"
            )}
          </button>

              {/* Terms Checkbox */}
              <div className="flex items-center gap-3 text-sm text-gray-300 group">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 text-purple-500 bg-white/5 border-white/20 rounded focus:ring-purple-500 focus:ring-2 transition-all duration-300 hover:scale-110 hover:border-purple-400"
                  required
                />
                <p className="transition-colors duration-300 group-hover:text-white">I agree to the terms of use & privacy policy.</p>
              </div>

          {/* Toggle between Login/Sign up */}
          <div className="text-center pt-4 border-t border-white/10">
            {currState === "Sign up" ? (
              <p className="text-sm text-gray-300">
                Already have an account?{" "}
                <span
                  onClick={() => {setCurrState("Login"); setIsDataSubmitted(false)}}
                  className="font-medium text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                >
                  Login here
                </span>
              </p>
            ) : (
              <p className="text-sm text-gray-300">
                Don't have an account?{" "}
                <span 
                  onClick={() => setCurrState("Sign up")}
                  className="font-medium text-purple-400 hover:text-purple-300 cursor-pointer transition-colors"
                >
                  Sign up here
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
