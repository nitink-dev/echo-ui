import React, { useState } from 'react';
import { Building2, HelpCircle, User, ChevronDown, Settings, Database, Stethoscope, Monitor, Network, HardDrive, Activity, Microscope, ChevronRight } from 'lucide-react';
import endeavorLogo from 'figma:asset/8d23b78a5fe745720187a8b480f0debc13c0b121.png';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from './ui/breadcrumb';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  onNavigate: (pageId: string) => void;
}

interface NavigationItem {
  label: string;
  icon: React.ComponentType<any>;
  id: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Devices & Adapters',
    icon: Monitor,
    id: 'devices',
    children: [
      { label: 'Slide Scanner', icon: Microscope, id: 'slide-scanner' },
      { label: 'DICOM Receiver', icon: Network, id: 'dicom-receiver' }
    ]
  },
  {
    label: 'Data Stores',
    icon: Database,
    id: 'data-stores',
    children: [
      { label: 'Google DICOM Temp', icon: HardDrive, id: 'google-dicom-temp' },
      { label: 'Google DICOM Final', icon: HardDrive, id: 'google-dicom-final' },
      { label: 'HL7 Store', icon: Database, id: 'hl7-store' }
    ]
  },
  {
    label: 'Clinical Applications',
    icon: Stethoscope,
    id: 'clinical-apps',
    children: [
      { label: 'LIS', icon: Activity, id: 'lis' },
      { label: 'Synapse', icon: Settings, id: 'synapse' },
      { label: 'Slide Image Analysis', icon: Microscope, id: 'qa-analysis' }
    ]
  }
];

interface NavigationProps {
  currentPage: string;
  onNavigate: (pageId: string) => void;
}

function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['devices', 'data-stores', 'clinical-apps']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  return (
    <TooltipProvider>
      <nav className="space-y-3" role="navigation" aria-label="Main navigation">
        {navigationItems.map((section, index) => {
        const isExpanded = expandedSections.includes(section.id);
        
        return (
          <div key={section.id} className="space-y-1">
            {index > 0 && <div className="h-px bg-[#E2E8F0] mx-2 my-3"></div>}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left transition-all duration-200 hover:bg-[#E0F0FF] rounded-lg group focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2 focus:ring-offset-[#F1F5F9]"
              aria-expanded={isExpanded}
              aria-controls={`section-${section.id}`}
              tabIndex={0}
            >
              <div className="flex items-center gap-3">
                <section.icon className="h-4 w-4 text-[#64748B] group-hover:text-[#007BFF] transition-colors duration-200" />
                <span className="text-sm font-semibold text-[#64748B] group-hover:text-[#007BFF] uppercase tracking-wider transition-colors duration-200">
                  {section.label}
                </span>
              </div>
              <ChevronRight 
                className={`h-4 w-4 text-[#64748B] group-hover:text-[#007BFF] transition-transform duration-200 ${
                  isExpanded ? 'rotate-90' : ''
                }`}
              />
            </button>
            
            {section.children && (
              <div 
                id={`section-${section.id}`}
                className={`overflow-hidden transition-all duration-300 ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pl-6 space-y-1">
                  {section.children.map((item) => (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => onNavigate(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative focus:outline-none focus:ring-2 focus:ring-[#007BFF] focus:ring-offset-2 focus:ring-offset-[#F1F5F9] ${
                            currentPage === item.id
                              ? 'bg-[#B0D4FF] text-[#2C3E50] border-l-4 border-[#007BFF] shadow-sm'
                              : 'text-[#2C3E50] hover:bg-[#E0F0FF] hover:shadow-sm hover:border-l-2 hover:border-[#C7E2FF]'
                          }`}
                          aria-current={currentPage === item.id ? 'page' : undefined}
                          tabIndex={0}
                        >
                          <item.icon className={`h-4 w-4 transition-colors duration-200 ${
                            currentPage === item.id 
                              ? 'text-[#007BFF]' 
                              : 'text-[#64748B] group-hover:text-[#007BFF]'
                          }`} />
                          <span className={`font-medium text-sm ${
                            currentPage === item.id ? 'text-[#2C3E50] font-semibold' : ''
                          }`}>
                            {item.label}
                          </span>
                          {currentPage === item.id && (
                            <div className="ml-auto w-2 h-2 bg-[#007BFF] rounded-full"></div>
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="bg-[#2C3E50] text-white border-[#64748B]">
                        <p>Navigate to {item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      </nav>
    </TooltipProvider>
  );
}

export function Layout({ children, currentPage, breadcrumbs = [], onNavigate }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#fafbff]">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-[#2C3E50] text-white shadow-sm z-50 border-b border-[#34495E]">
        <div className="h-full flex items-center justify-between bg-[rgba(35,95,248,1)]">
          {/* Left: Logo - Aligned with sidebar */}
          <div className="flex items-center pl-6 w-72 lg:w-72 md:w-64 sm:w-auto sm:pr-4">
            <img 
              src={endeavorLogo} 
              alt="Endeavor Health - Configuration Management Console" 
              className="h-8 sm:h-7 object-contain transition-all duration-200 hover:opacity-90 header-logo"
            />
          </div>

          {/* Right: Navigation Items */}
          <div className="flex items-center gap-2 pr-6 sm:pr-4 header-nav-buttons">
            {/* Help Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[rgba(255,255,255,1)] hover:text-white hover:bg-[#34495E] border border-transparent hover:border-[#5D6D7E] transition-all duration-200 font-medium nav-button"
                  aria-label="Help menu"
                >
                  <HelpCircle className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Help</span>
                  <ChevronDown className="h-3 w-3 ml-2 sm:ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-[#E2E8F0] shadow-lg">
                <DropdownMenuItem className="hover:bg-[#F8FAFF] transition-colors">
                  User Manual
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#F8FAFF] transition-colors">
                  FAQs
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                <DropdownMenuItem className="hover:bg-[#F8FAFF] transition-colors">
                  Contact Support
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-[#BDC3C7] hover:text-white hover:bg-[#34495E] border border-transparent hover:border-[#5D6D7E] transition-all duration-200 font-medium max-w-[200px] nav-button bg-[rgba(255,255,255,0)]"
                  aria-label="User profile menu"
                >
                  <div className="w-6 h-6 bg-[rgba(38,101,101,0)] hover:bg-[#007BFF] rounded-full flex items-center justify-center mr-2 sm:mr-2 transition-colors duration-200">
                    <User className="h-3 w-3 text-white" />
                  </div>
                  <span className="hidden md:inline text-sm truncate text-[rgba(255,255,255,1)]">Dr. Sarah Johnson</span>
                  <span className="md:hidden sm:hidden text-sm">Profile</span>
                  <ChevronDown className="h-3 w-3 ml-2 flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-[#E2E8F0] shadow-lg">
                <div className="px-3 py-2 border-b border-[#E2E8F0]">
                  <p className="text-sm font-medium text-[#2C3E50]">Dr. Sarah Johnson</p>
                  <p className="text-xs text-[#64748B]">Endeavor Health</p>
                  <p className="text-xs text-[#64748B]">System Administrator</p>
                </div>
                <DropdownMenuItem className="hover:bg-[#F8FAFF] transition-colors">
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-[#F8FAFF] transition-colors">
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#E2E8F0]" />
                <DropdownMenuItem className="hover:bg-[#FEF2F2] text-[#DC2626] hover:text-[#991B1B] transition-colors">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className="fixed left-0 top-16 bottom-0 w-72 bg-[#F1F5F9] shadow-sm z-40 border-r border-[#E2E8F0]">
          <div className="h-full overflow-y-auto p-6 bg-[#F1F5F9] nav-scrollbar">
            <Navigation currentPage={currentPage} onNavigate={onNavigate} />
          </div>
        </aside>

        {/* Main Content */}
        <main className="ml-72 flex-1 bg-[#fafbff]">
          {/* Content Area with improved spacing */}
          <div className="px-6 py-4">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="mb-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    {breadcrumbs.map((crumb, index) => (
                      <React.Fragment key={index}>
                        <BreadcrumbItem>
                          {crumb.href && (
                            <BreadcrumbLink href={crumb.href} className="text-gray-600 hover:text-[#007BFF]">{crumb.label}</BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
                      </React.Fragment>
                    ))}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            )}

            {/* Page Content - Remove card wrapper for maximum flexibility */}
            <div className="min-h-[calc(100vh-8rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}