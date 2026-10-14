/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SettingsProvider } from './context/SettingsContext';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { ListingDetailsPage } from './pages/ListingDetailsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ProjectDetailsPage } from './pages/ProjectDetailsPage';
import { MarketInsightsPage } from './pages/MarketInsightsPage';
import { HelpAndReportPage } from './pages/HelpAndReportPage';
import { MyAdsPage } from './pages/MyAdsPage';
import { AdWizard } from './pages/AdWizard';
import { AdStatusTimelinePage } from './pages/AdStatusTimelinePage';
import { FinancePromotionPage } from './pages/FinancePromotionPage';
import { OrgDashboardPage } from './pages/OrgDashboardPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { AdminReportsPage } from './pages/AdminReportsPage';
import { AdminFinancePage } from './pages/AdminFinancePage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { AdminSettingsPage } from './pages/AdminSettingsPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tabParam, setTabParam] = useState<string>('');
  const [selectedListingId, setSelectedListingId] = useState<string>('lst_1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj_1');

  // Scroll to top on navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentTab, selectedListingId, selectedProjectId]);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    if (param) setTabParam(param);
  };

  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    setCurrentTab('listing-details');
  };

  const handleSelectProject = (id: string) => {
    setSelectedProjectId(id);
    setCurrentTab('project-details');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProject={handleSelectProject}
          />
        );

      case 'search':
        return (
          <SearchPage
            initialQuery={tabParam}
            onSelectListing={handleSelectListing}
          />
        );

      case 'listing-details':
        return (
          <ListingDetailsPage
            listingId={selectedListingId}
            onBack={() => setCurrentTab('search')}
            onSelectListing={handleSelectListing}
          />
        );

      case 'projects':
        return <ProjectsPage onSelectProject={handleSelectProject} />;

      case 'project-details':
        return (
          <ProjectDetailsPage
            projectId={selectedProjectId}
            onBack={() => setCurrentTab('projects')}
          />
        );

      case 'market':
        return <MarketInsightsPage />;

      case 'help':
        return <HelpAndReportPage />;

      case 'my-ads':
        return (
          <MyAdsPage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onViewTimeline={(id) => {
              setSelectedListingId(id);
              setCurrentTab('ad-timeline');
            }}
          />
        );

      case 'create-ad':
        return (
          <AdWizard
            onSuccess={(id) => {
              setSelectedListingId(id);
              setCurrentTab('listing-details');
            }}
            onCancel={() => setCurrentTab('home')}
          />
        );

      case 'ad-timeline':
        return (
          <AdStatusTimelinePage
            listingId={selectedListingId}
            onBack={() => setCurrentTab('my-ads')}
            onSelectListing={handleSelectListing}
          />
        );

      case 'finance-promote':
        return (
          <FinancePromotionPage
            initialListingId={tabParam || selectedListingId}
            onBack={() => setCurrentTab('my-ads')}
            onSuccess={() => setCurrentTab('my-ads')}
          />
        );

      case 'organization':
        return <OrgDashboardPage onSelectListing={handleSelectListing} />;

      case 'favorites':
        return (
          <FavoritesPage
            onSelectListing={handleSelectListing}
            onNavigate={handleNavigate}
          />
        );

      case 'admin':
        return <AdminDashboardPage onNavigateTab={handleNavigate} />;

      case 'admin-moderation':
      case 'admin-compliance':
        return (
          <AdminModerationPage
            onBack={() => setCurrentTab('admin')}
            onSelectListing={handleSelectListing}
          />
        );

      case 'admin-reports':
        return (
          <AdminReportsPage
            onBack={() => setCurrentTab('admin')}
            onSelectListing={handleSelectListing}
          />
        );

      case 'admin-finance':
        return <AdminFinancePage onBack={() => setCurrentTab('admin')} />;

      case 'admin-users':
        return <AdminUsersPage onBack={() => setCurrentTab('admin')} />;

      case 'admin-audit':
        return <AdminAuditPage onBack={() => setCurrentTab('admin')} />;

      case 'admin-settings':
        return <AdminSettingsPage onBack={() => setCurrentTab('admin')} />;

      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            onSelectListing={handleSelectListing}
            onSelectProject={handleSelectProject}
          />
        );
    }
  };

  return (
    <SettingsProvider>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white">
            <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
            <main className="flex-1">{renderContent()}</main>
            <Footer onNavigate={handleNavigate} />
          </div>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
