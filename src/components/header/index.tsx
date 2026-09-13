import { Alert } from 'antd';
import Logo from './ti-logo.svg?react'; // React component import via vite-plugin-svgr
import { useNetworkStore } from '../../store/network/network.store';
import './header.scss';

export const Header = () => {
    const hasNetworkError = useNetworkStore((state) => state.hasNetworkError);

    return (
        <>
            {hasNetworkError && (
                <Alert
                    className="header-network-banner"
                    type="error"
                    banner
                    showIcon
                    message="Unable to reach the server. Some features may not work."
                />
            )}
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
                    <span className="username-space">User</span>
                </div>
            </header>
        </>
    );
};
