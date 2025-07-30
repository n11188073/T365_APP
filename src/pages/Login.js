import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode'; // ✅ correct import

const Login = () => {
  const handleSuccess = (credentialResponse) => {
    console.log("✅ Google Login Success", credentialResponse);

    const token = credentialResponse.credential;
    localStorage.setItem('google_token', token);

    // Decode the token to get user info
    const decoded = jwtDecode(token); // ✅ correct usage
    console.log("🔓 Decoded JWT:", decoded);

    // Save name (or email) to localStorage
    localStorage.setItem('user', JSON.stringify({ name: decoded.name || decoded.email }));

    // Redirect to home
    window.location.href = '/';
  };

  const handleError = () => {
    console.error('❌ Google Login Failed');
  };

  return (
    <div className="page" style={{ padding: '2rem' }}>
      <h1>Login</h1>
      <p>Log in with your Google account to continue:</p>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default Login;
