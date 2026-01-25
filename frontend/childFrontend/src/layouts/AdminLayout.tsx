import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '../components/DashboardHeader';
import SidebarNavigation from '../components/SidebarNavigation';
import AdminFooter from '../components/AdminFooter';
import './AdminLayout.css';

const AdminLayout: React.FC = () => {
  return (
    <div className="admin-dashboard-layout">
      {/* 🧭 Top Navigation Strip */}
      <DashboardHeader />

      <div className="admin-main-wrapper">
        {/* 🛡️ Fixed/Collapsible Sidebar */}
        <SidebarNavigation userType="ADMIN" />

        {/* 💻 Primary Content Area */}
        <main className="admin-content-area">
          <div className="admin-page-content">
            <Outlet />
          </div>

          {/* 🏁 System Footer */}
          <div className="admin-footer-wrapper">
            <AdminFooter />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;