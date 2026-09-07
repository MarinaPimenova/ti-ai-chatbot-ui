import Logo from './ti-logo.svg?react'; // React component import via vite-plugin-svgr
import { login } from '../../utils/user-util';
import './header.scss';

export const Index = () => {
    return (

        <header className="app-header">
            <div className="app-header__brand">
                <div className="app-header__logo">
                    <Logo className="app-header__logo-svg" aria-label="TI Logo" />
                </div>
                <span className="app-header__title">
                    TI Knowledge Platform
                </span>
            </div>
            <div className="app-header__actions">
                {login}
            </div>
        </header>
    );
};