import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Configuration, FrontendApi, Session, Identity } from "@ory/client";

const basePath = process.env.REACT_APP_ORY_URL || "http://localhost:4000";
const ory = new FrontendApi(
  new Configuration({
    basePath,
    baseOptions: {
      withCredentials: true,
    },
  })
);

// Returns either the email or the username depending on the user's Identity Schema
const getUserName = (identity: Identity) =>
  identity.traits.email || identity.traits.username;

const Home = () => {
  const router = useRouter();

  const [session, setSession] = useState<Session | undefined>();
  const [logoutUrl, setLogoutUrl] = useState<string | undefined>();

  useEffect(() => {
    ory
      .toSession()
      .then(({ data }) => {
        // User has a session!
        setSession(data);
        // Create a logout url
        ory.createBrowserLogoutFlow().then(({ data }) => {
          setLogoutUrl(data.logout_url);
        });
      })
      .catch(() => {
        // Redirect to login page
        return router.push(basePath + "/ui/login");
      });
  }, [router]);

  if (!session) {
    // Still loading
    return null;
  }
  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to Ory, {getUserName(session?.identity)}.</p>
        {
          // Our logout link
          <a href={logoutUrl}>Logout</a>
        }
      </header>
    </div>
  );
};

export default Home;
