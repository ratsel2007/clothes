import {Header} from './components/Header';
import {Home} from './pages/Home';
import './app.css';

export function App() {
    return (
        <div>
            <Header />
            <main>
                <Home />
            </main>
        </div>
    );
}
