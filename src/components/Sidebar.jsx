// ==========================================
// SIDEBAR COMPONENT (Day 4 - Dark Dashboard)
// ==========================================
// Left navigation sidebar with:
//   - App logo
//   - Navigation items with icons
//   - Active state highlighting
//   - Collapsible on mobile
// ==========================================

import { useNavigate } from "react-router-dom";
import {
    Home,
    Code,
    Zap,
    BarChart2,
    Settings as SettingsIcon,
    LogOut,
    X,
    Menu,
    Code2,
    Sparkles,
    LayoutDashboard
} from "lucide-react";
import logo from "../assets/logo.png";

function Sidebar({ activeSection = "dashboard", onSectionChange, isOpen, onToggle }) {
    // Navigation items configuration
    const navItems = [
        { id: "home", label: "Create Snippet", icon: Home },
        { id: "snippets", label: "My Snippets", icon: Code2 },
        { id: "recall", label: "Recall Mode", icon: Sparkles },
        { id: "dashboard", label: "Analytics", icon: LayoutDashboard },
        { id: "settings", label: "Settings", icon: SettingsIcon }
    ];

    return (
        <>
            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={onToggle}
                />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
                {/* Logo section */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <img src={logo} alt="CodeRecall" className="logo-img-sidebar" style={{ height: '32px', width: '32px', objectFit: 'cover', objectPosition: 'left center' }} />
                        <span className="logo-text">CodeRecall</span>

                    </div>
                    <button
                        className="sidebar-close"
                        onClick={onToggle}
                        aria-label="Close sidebar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeSection === item.id;

                        return (
                            <button
                                key={item.id}
                                className={`nav-item ${isActive ? "nav-item-active" : ""}`}
                                onClick={() => onSectionChange && onSectionChange(item.id)}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <Icon size={20} className="nav-icon" />
                                <span className="nav-label">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer */}
                <div className="sidebar-footer">
                    <div className="sidebar-version">v1.0.0</div>
                </div>
            </aside>
        </>
    );
}

// Mobile menu button (exported separately for TopBar use)
export function MobileMenuButton({ onClick }) {
    return (
        <button
            className="mobile-menu-btn"
            onClick={onClick}
            aria-label="Open menu"
        >
            <Menu size={24} />
        </button>
    );
}

export default Sidebar;
