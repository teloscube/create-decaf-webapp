import Home from '@/pages/Home';
import { HomeOutlined } from '@ant-design/icons';
import { DecafMenuItemsBuilder, DecafRouteItemsBuilder, DecafWebapp } from '@decafhub/decaf-react-webapp';
import { Alert } from 'antd';
import pkg from '../package.json';

const buildMenu: DecafMenuItemsBuilder = (_context) => {
  return [
    {
      label: 'Home',
      to: '/',
      icon: <HomeOutlined />,
    },
  ];
};

const buildRoutes: DecafRouteItemsBuilder = (_context) => {
  return [
    {
      path: '/',
      element: <Home />,
    },
  ];
};

function App() {
  return (
    <Alert.ErrorBoundary>
      <DecafWebapp
        config={{
          currentVersion: pkg.version,
          basePath: import.meta.env.BASE_URL,
        }}
        appName="--appname--"
        buildMenuItems={buildMenu}
        buildRouteItems={buildRoutes}
      />
    </Alert.ErrorBoundary>
  );
}

export default App;
