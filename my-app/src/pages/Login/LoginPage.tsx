import React, { useEffect, useMemo } from 'react';
import { PublicClientApplication } from '@azure/msal-browser';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const MicrosoftLogin: React.FC = () => {
  const navigate = useNavigate();
  const redirectUri = `${window.location.origin}/login`;

  const msalInstance = useMemo(() => new PublicClientApplication({
    auth: {
      clientId: '8f9050de-6d0b-46b3-bb6c-e83bb135c7e9',
      authority: 'https://login.microsoftonline.com/bcae9d43-a345-4476-ab58-2497d91ce396',
      redirectUri: redirectUri,
      postLogoutRedirectUri: redirectUri
    },
    cache: {
      cacheLocation: 'sessionStorage'
    }
  }), [redirectUri]);

  useEffect(() => {
    msalInstance.initialize()
      .then(() => {
        msalInstance.handleRedirectPromise()
          .then(response => {
            if (response) {
              navigate('/host');
            }
          });
      });
  }, [msalInstance, navigate]);

  const handleLogin = async () => {
    try {
      await msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        redirectUri: redirectUri
      });
      navigate('/host');
    } catch (error) {
      console.error('Error durante el login:', error);
    }
  };

  return (
    <div className="retro-login-container">
      <h1 className="login-title">Autenticar</h1>
      <div className="pixel-divider"></div>
      <p className="login-subtitle">INGRESE CON SU PERFIL<br />DE AZURE</p>
      
      <button onClick={handleLogin} className="retro-login-button">
        <i className="fab fa-microsoft"></i> MICROSOFT
      </button>
      
      <div className="pixel-divider"></div>
      <p className="login-footer">SYSTEM 1984 © AZURE ARCADE</p>
    </div>
  );
};

export default MicrosoftLogin;