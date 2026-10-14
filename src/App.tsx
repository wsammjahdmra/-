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
import { BottomNavBar } from './components/BottomNavBar';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';

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
import { BookingsPage } from './pages/BookingsPage';
import { ChatsPage } from './pages/ChatsPage';
import { ServicesHubPage } from './pages/ServicesHubPage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [tabParam, setTabParam] = useState<string>('');
  const [selectedListingId, setSelectedListingId] = useState<string>('lst_1');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('prj_1');
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Quota Exceeded event listener for Google Maps Platform
  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  // Scroll to top on navigation except home map
  useEffect(() => {
    if (currentTab !== 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
            onBack={() => setCurrentTab('home')}
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

      case 'bookings':
        return (
          <BookingsPage
            onSelectListing={handleSelectListing}
            onNavigateHome={() => setCurrentTab('home')}
          />
        );

      case 'chats':
        return <ChatsPage onSelectListing={handleSelectListing} />;

      case 'services':
        return <ServicesHubPage onNavigate={handleNavigate} />;

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
          <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans antialiased selection:bg-emerald-600 selection:text-white pb-14">
            {/* Google Maps Quota Defense Sticky Top Banner */}
            {quotaExceeded && (
              <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
                <span>
                  Google Maps Platform quota reached. If you are the app owner, visit{' '}
                  <a
                    href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-semibold text-amber-950 hover:text-amber-800"
                  >
                    maps developer site
                  </a>{' '}
                  for instructions to update your account.
                </span>
              </div>
            )}

            <Navbar currentTab={currentTab} onNavigate={handleNavigate} />
            
            <main className="flex-1 flex flex-col">{renderContent()}</main>

            {currentTab !== 'home' && <Footer onNavigate={handleNavigate} />}

            {/* Mobile / Screen Bottom Navigation Bar matching screenshot */}
            <BottomNavBar
              currentTab={currentTab}
              onNavigate={handleNavigate}
              onOpenAccount={() => setRoleModalOpen(true)}
            />

            {/* Role Switcher & Account Profile Modal */}
            <RoleSwitcherModal
              isOpen={roleModalOpen}
              onClose={() => setRoleModalOpen(false)}
            />
          </div>
        </ToastProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}
