// ==========================================
// TOPBAR COMPONENT (Day 4 - Dark Dashboard)
// ==========================================
// Sticky header bar with:
//   - Mobile menu button
//   - Search input
//   - User info and logout
// ==========================================

import { Search, LogOut, Calendar, X } from "lucide-react";
import { MobileMenuButton } from "./Sidebar";

function TopBar({
    user,
    onLogout,
    searchTerm,
    onSearchChange,
    filterDate,
    onFilterDateChange,
    onMenuToggle
}) {
    return (
        <header className="topbar">
            {/* Left section - Mobile menu + Search */}
            <div className="topbar-left">
                <MobileMenuButton onClick={onMenuToggle} />

                <div className="topbar-search">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search snippets..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="search-input-dark"
                    />
                </div>
            </div>

            {/* Center/Right section - Date filter + User */}
            <div className="topbar-right">
                {/* Date filter */}
                <div className="topbar-date-filter">
                    <Calendar size={16} className="date-icon" />
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => onFilterDateChange(e.target.value)}
                        className="date-input-dark"
                    />
                    {filterDate && (
                        <button
                            onClick={() => onFilterDateChange("")}
                            className="date-clear"
                            title="Clear date filter"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* User section */}
                <div className="topbar-user">
                    <span className="user-email-dark">{user?.email}</span>
                    <button
                        onClick={onLogout}
                        className="btn-logout"
                        title="Logout"
                    >
                        <LogOut size={18} />
                        <span className="logout-text">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}

export default TopBar;
