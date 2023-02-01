import { HomeOutlined } from "@ant-design/icons";
import { DecafWebapp } from "@decafhub/decaf-react-webapp";
import { Alert } from "antd";
import pkg from "../package.json";
import Home from "./pages/Home";

const menu = [
  {
    label: "Home",
    to: "/",
    icon: <HomeOutlined />,
  },
];

const routes = [
  {
    path: "/",
    element: <Home />,
  },
];

function App() {
  return (
    <Alert.ErrorBoundary>
      <DecafWebapp
        config={{
          currentVersion: pkg.version,
          versionCheckInterval: 60,
          authCheckInterval: 60,
          basePath: process.env.PUBLIC_URL,
        }}
        appName="--appname--"
        menuItems={menu}
        routes={routes}
      />
    </Alert.ErrorBoundary>
  );
}

export default App;
