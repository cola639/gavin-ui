import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from 'store';
import App from 'views/App';
import './index.css';
import './styles/global.scss';
import './styles/override.scss';

const container = document.getElementById('root') as HTMLDivElement;
const root = createRoot(container);

root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
