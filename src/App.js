import HomePage from './pages/HomePage';
import { I18nProvider } from './i18n/i18n';

function App() {
  return (
    <I18nProvider>
      <HomePage />
    </I18nProvider>
  );
}

export default App;
