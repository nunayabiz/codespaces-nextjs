// pages/index.js
import Head from 'next/head';
import Image from 'next/image';
import AccessRequestForm from '../components/AccessFormRequest';
import { db, admin } from '../utils/firebaseAdmin';
const Timestamp = admin.firestore.Timestamp;


export async function getServerSideProps(context) {
  const req = context.req;
  const ipAddress = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1').split(',')[0].trim();

  async function getCountryCodeFromIp(ip) {
    if (ip === '127.0.0.1' || ip === '::1') { return 'US'; }
    return 'US';
  }

  const userCountryCode = await getCountryCodeFromIp(ipAddress);
  const isUS = userCountryCode === 'US';
  const isBlocked = !isUS;

  try {
    await db.collection('requestLogs').add({
      timestamp: Timestamp.now(),
      ipAddress: ipAddress,
      countryCode: userCountryCode,
      userAgent: req.headers['user-agent'],
      url: req.url,
      method: req.method,
      isBlocked: isBlocked,
    });
    console.log('Request logged to Firebase!');
  } catch (error) {
    console.error('Error logging request to Firebase:', error);
  }

  return {
    props: {
      isBlocked,
      userIp: ipAddress,
      userCountryCode,
    },
  };
}

export default function Home({ isBlocked, userIp, userCountryCode }) {
  const pictureInfo = {
    title: "Moroccan Woman Looking Forward",
    description: "A close-up, realistic shot of a Moroccan woman looking directly at the viewer, capturing her serene expression and traditional features.",
    date: "May 29, 2025",
    views: "20",
  };

  return (
    <>
      <Head>
        <title>{isBlocked ? 'Access Denied (Non-US)' : 'Welcome (US)'}</title>
        <meta name="description" content="Website access control based on US country" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="main-content-wrapper">
        <div className="image-post-header">
          <p className="shared-by">Shared by: <span className="username">Nuna Yabizniz</span></p>
          <h2 className="picture-title">{pictureInfo.title}</h2>
          <p className="picture-description">{pictureInfo.description}</p>
          <div className="picture-meta">
            <span>Posted: {pictureInfo.date}</span>
            <span>Views: {pictureInfo.views}</span>
          </div>
        </div>

        <div className="card-container">

          {isBlocked ? (
            <div className="access-denied-section">
              <h1 className="access-denied-heading">Access Denied</h1>
              <p className="access-denied-message">
                Unfortunately, access to this website is restricted to users from the United States. You are accessing from (
                <span className="country-code">{userCountryCode || 'Unknown'}</span>).
              </p>
              <AccessRequestForm userIp={userIp} userCountryCode={userCountryCode} />

              <p className="ip-info">
                Your IP address: <span className="ip-address">{userIp}</span>
              </p>
            </div>
          ) : (
            <div className="access-granted-section">
              <h1 className="access-granted-heading">Allowed Access!</h1>
              <p className="access-granted-message">
                You are accessing this website from whitelisted country (
                <span className="country-code">{userCountryCode || 'Unknown'}</span>).
              </p>
              <Image
                src="/images/lady.jpg"
                alt="A Gemini generated image"
                width={500}
                height={500}
                priority
                className="welcome-image"
              />
              <p className="ip-info">
                Your IP address: <span className="ip-address">{userIp}</span>
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <div className="footer-content">
          <p>&copy; 2025 dummy POC application All rights reserved. </p>
          <p className="footer-disclaimer">
            *Disclaimer: This is a demonstration of geographic access control. All images are for illustrative purposes only and do not represent actual user-shared content. We value your privacy and security. By accessing this site, you agree to our <a href="/terms-of-service" className="footer-link">Terms of Service</a> and <a href="/privacy-policy" className="footer-link">Privacy Policy</a>.
          </p>
        </div>
      </footer>
    </>
  );
}
