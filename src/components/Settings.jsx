// ==========================================
// SETTINGS COMPONENT (Day 7)
// ==========================================
// Simple settings page with:
//   - User email display
//   - Logout button
//   - "Coming soon" placeholder
// ==========================================

import { Settings as SettingsIcon, LogOut, Mail, Shield } from "lucide-react";

function Settings({ user, onLogout }) {
    return (
        <div className="settings-page">
            <div className="settings-header">
                <SettingsIcon size={24} />
                <h2>Settings</h2>
            </div>

            {/* Account section */}
            <div className="settings-section">
                <h3 className="settings-section-title">Account</h3>

                <div className="settings-card">
                    <div className="settings-row">
                        <div className="settings-row-icon">
                            <Mail size={18} />
                        </div>
                        <div className="settings-row-content">
                            <span className="settings-label">Email</span>
                            <span className="settings-value">{user?.email || "Not available"}</span>
                        </div>
                    </div>

                    <div className="settings-divider" />

                    <div className="settings-row">
                        <div className="settings-row-icon">
                            <Shield size={18} />
                        </div>
                        <div className="settings-row-content">
                            <span className="settings-label">Account ID</span>
                            <span className="settings-value settings-uid">{user?.uid?.slice(0, 12)}...</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="settings-section">
                <h3 className="settings-section-title">Actions</h3>
                <div className="settings-card">
                    <button className="settings-logout-btn" onClick={onLogout}>
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </div>

            {/* Coming soon */}
            <p className="settings-coming-soon">
                More account features coming soon.
            </p>
        </div>
    );
}

export default Settings;
