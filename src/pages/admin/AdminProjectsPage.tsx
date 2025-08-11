import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  ChevronDown, 
  MoreHorizontal,
  Filter,
  FileText,
  Presentation,
  FileSpreadsheet,
  Package,
  BarChart3
} from 'lucide-react';
import { useProjects } from '../../context/ProjectContext';
import AdminLayout from '../../components/admin/AdminLayout';
import ProjectDocumentsManager from '../../components/admin/ProjectDocumentsManager';
import { Project } from '../../types';

const AdminProjectsPage = () => {
  const { projects, addProject, updateProject, deleteProject, getProjectDocuments, getDocumentsByReviewStage } = useProjects();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [isDocumentBreakdownOpen, setIsDocumentBreakdownOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [sortField, setSortField] = useState<keyof Project>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
  
  // Form state for add/edit
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    title: '',
    description: '',
    category: 'IoT',
    price: 0,
    image: '',
    imageUpload: null,
    features: [],
    technical_details: '',
    featured: false,
    is_active: true,
    updated_at: new Date().toISOString()
  });

  const categories = ['All', 'IoT', 'Blockchain', 'Web', 'Mobile', 'Other'];
  
  // Calculate project counts by domain/category
  const domainStats = categories
    .filter(cat => cat !== 'All')
    .map(cat => ({
      category: cat,
      count: projects.filter(p => p.category === cat).length
    }));

  // Main stats
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.is_active).length;
  const featuredProjects = projects.filter(p => p.featured).length;
  const inactiveProjects = projects.filter(p => !p.is_active).length;
  
  // Filter projects based on category and search term
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = 
        !selectedCategory || 
        selectedCategory === 'All' || 
        project.category === selectedCategory;
      // Show all projects in admin, including inactive
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        return sortDirection === 'asc' 
          ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
          : (bValue ? 1 : 0) - (aValue ? 1 : 0);
      }
      
      return 0;
    });

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category === 'All' ? null : category);
    setIsCategoryDropdownOpen(false);
  };

  // Handle sorting
  const handleSort = (field: keyof Project) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get document count for a project
  const getDocumentCount = (projectId: string): number => {
    const documents = getProjectDocuments(projectId);
    return documents.length;
  };

  // Get document breakdown by review stage
  const getDocumentBreakdown = (projectId: string) => {
    const reviewStages = [
      { 
        value: 'review_1', 
        label: 'Review 1', 
        description: 'Initial project review',
        icon: FileText,
        color: 'blue'
      },
      { 
        value: 'review_2', 
        label: 'Review 2', 
        description: 'Mid-project assessment',
        icon: Presentation,
        color: 'purple'
      },
      { 
        value: 'review_3', 
        label: 'Review 3', 
        description: 'Final review & completion',
        icon: FileSpreadsheet,
        color: 'green'
      }
    ];

    return reviewStages.map(stage => ({
      ...stage,
      count: getDocumentsByReviewStage(projectId, stage.value).length
    }));
  };

  // Handle document breakdown click
  const handleDocumentBreakdownClick = (project: Project) => {
    setSelectedProject(project);
    setIsDocumentBreakdownOpen(true);
  };

  // Reset and open add modal
  const openAddModal = () => {
    setFormData({
      title: '',
      description: '',
      category: 'IoT',
      price: 0,
      image: '',
      imageUpload: null,
      features: [''],
      technical_details: '',
      featured: false,
      is_active: true,
      updated_at: new Date().toISOString()
    });
    setIsAddModalOpen(true);
  };

  // Open edit modal with project data
  const openEditModal = (project: Project) => {
    setCurrentProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      price: project.price,
      image: project.image,
      imageUpload: project.imageUpload,
      features: [...project.features],
      technical_details: project.technical_details || '',
      featured: project.featured || false,
      is_active: typeof project.is_active === 'boolean' ? project.is_active : true,
      updated_at: new Date().toISOString()
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (project: Project) => {
    setCurrentProject(project);
    setIsDeleteModalOpen(true);
  };

  // Open documents modal
  const openDocumentsModal = (project: Project) => {
    setCurrentProject(project);
    setIsDocumentsModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData({
        ...formData,
        [name]: checkbox.checked
      });
    } else if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files[0]) {
        setFormData({
          ...formData,
          imageUpload: fileInput.files[0]
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle feature list changes
  const handleFeatureChange = (index: number, value: string) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index] = value;
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  // Add new feature input
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, '']
    });
  };

  // Remove feature input
  const removeFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };

  // Handle form submission for new project
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty features
    const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
    
    addProject({
      ...formData,
      features: filteredFeatures,
      updated_at: new Date().toISOString()
    });
    
    setIsAddModalOpen(false);
  };

  // Handle form submission for edit project
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) return;
    
    // Filter out empty features
    const filteredFeatures = formData.features.filter(feature => feature.trim() !== '');
    
    updateProject(currentProject.id, {
      ...formData,
      features: filteredFeatures,
      updated_at: new Date().toISOString()
    });
    
    setIsEditModalOpen(false);
  };

  // Handle project deletion
  const handleDeleteConfirm = () => {
    if (!currentProject) return;
    
    deleteProject(currentProject.id);
    setIsDeleteModalOpen(false);
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 py-8 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Projects</h1>
            <p className="text-gray-500 dark:text-gray-400">Add, edit, or remove projects from your portfolio.</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Project
          </button>
        </div>

        {/* Stats Bar - All in one line, scrollable on small screens, with unique colors */}
        <div className="flex flex-row gap-4 overflow-x-auto mb-8 pb-2 hide-scrollbar">
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg shadow-sm px-6 py-4 flex flex-col items-center min-w-[140px]">
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Total Projects</span>
            <span className="text-xl font-bold text-blue-700 dark:text-blue-300">{totalProjects}</span>
          </div>
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg shadow-sm px-6 py-4 flex flex-col items-center min-w-[140px]">
            <span className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Active Projects</span>
            <span className="text-xl font-bold text-green-700 dark:text-green-300">{activeProjects}</span>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg shadow-sm px-6 py-4 flex flex-col items-center min-w-[140px]">
            <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300 mb-1">Featured Projects</span>
            <span className="text-xl font-bold text-yellow-700 dark:text-yellow-300">{featuredProjects}</span>
          </div>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg shadow-sm px-6 py-4 flex flex-col items-center min-w-[140px]">
            <span className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Inactive Projects</span>
            <span className="text-xl font-bold text-red-700 dark:text-red-300">{inactiveProjects}</span>
          </div>
          {domainStats.map(stat => {
            let colorClasses = '';
            switch (stat.category) {
              case 'IoT':
                colorClasses = 'bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300';
                break;
              case 'Blockchain':
                colorClasses = 'bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 text-purple-800 dark:text-purple-300';
                break;
              case 'Web':
                colorClasses = 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-800 dark:text-blue-300';
                break;
              case 'Mobile':
                colorClasses = 'bg-pink-100 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-700 text-pink-800 dark:text-pink-300';
                break;
              case 'Other':
                colorClasses = 'bg-gray-100 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-300';
                break;
              default:
                colorClasses = 'bg-slate-100 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-300';
            }
            return (
              <div key={stat.category} className={`rounded-lg shadow-sm px-6 py-4 flex flex-col items-center min-w-[140px] ${colorClasses}`}>
                <span className="text-xs font-medium mb-1">{stat.category}</span>
                <span className="text-xl font-bold">{stat.count}</span>
              </div>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm dark:shadow-gray-700">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex flex-row gap-4 w-full justify-between items-center">
              <div className="flex-grow min-w-0">
                <input
                  type="text"
                  id="project-search"
                  name="project-search"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                />
              </div>
              <div className="relative flex-shrink-0 min-w-[170px] max-w-[320px] ml-4">
                <button
                  type="button"
                  className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-200 w-full flex items-center justify-between gap-2 focus:ring-2 focus:ring-blue-500 transition-colors duration-200 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={() => setIsCategoryDropdownOpen((v) => !v)}
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryDropdownOpen ? 'true' : 'false'}
                  id="categoryFilterDropdown"
                >
                  <span className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-slate-400" />
                    <span className={
                      !selectedCategory || selectedCategory === 'All' ? 'text-blue-600 font-bold' :
                      ['IoT', 'Blockchain', 'Web', 'Mobile', 'Other'].includes(selectedCategory) ? 'text-blue-600 font-bold' : ''
                    }>
                      {!selectedCategory || selectedCategory === 'All' ? 'All Categories' : selectedCategory}
                    </span>
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>
                {isCategoryDropdownOpen && (
                  <ul
                    className="absolute left-0 mt-2 w-full z-10 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-lg py-1"
                    role="listbox"
                    aria-labelledby="categoryFilterDropdown"
                    tabIndex={-1}
                  >
                    {categories.map((category) => {
                      const isSelected = (!selectedCategory && category === 'All') || selectedCategory === category;
                      return (
                        <li
                          key={category}
                          role="option"
                          aria-selected={isSelected ? 'true' : 'false'}
                          tabIndex={0}
                          onClick={() => handleCategorySelect(category)}
                          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { handleCategorySelect(category); } }}
                          className={
                            `cursor-pointer px-8 py-2 flex items-center transition-colors duration-150 ` +
                            (isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 font-bold'
                              : 'hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600')
                          }
                        >
                        {category === 'All' ? 'All Categories' : category}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Projects Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm dark:shadow-gray-700 overflow-hidden mb-8">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center">
                      Project Title
                      {sortField === 'title' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    <div className="flex items-center">
                      Category
                      {sortField === 'category' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort('price')}
                  >
                    <div className="flex items-center">
                      Price
                      {sortField === 'price' && (
                        <ChevronDown 
                          className={`ml-1 h-4 w-4 ${sortDirection === 'desc' ? 'rotate-180' : ''}`}
                        />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1" />
                      Documents
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      Status
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No projects found
                    </td>
                  </tr>
                ) : (
                  filteredProjects.map((project) => {
                    const documentCount = getDocumentCount(project.id);
                    
                    return (
                      <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <img 
                                className="h-10 w-10 rounded-md object-cover" 
                                src={project.imageUpload ? URL.createObjectURL(project.imageUpload) : project.image} 
                                alt={project.title} 
                              />
                            </div>
                            <div className="ml-4">
                              <div
                                className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                                style={
                                  expandedProjectId === project.id
                                    ? { whiteSpace: 'normal', overflow: 'visible', display: 'block' }
                                    : {
                                        display: '-webkit-box',
                                        WebkitLineClamp: 1,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        whiteSpace: 'normal',
                                        textOverflow: 'ellipsis',
                                        maxWidth: '180px',
                                        cursor: 'pointer'
                                      }
                                }
                                title={expandedProjectId === project.id ? "Click to collapse" : "Click to expand"}
                                onClick={() =>
                                  setExpandedProjectId(expandedProjectId === project.id ? null : project.id)
                                }
                              >
                                {project.title}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            project.category.toLowerCase() === 'iot' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : project.category.toLowerCase() === 'blockchain'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                                : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {project.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          ₹{project.price.toLocaleString('en-IN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <button
                              onClick={() => handleDocumentBreakdownClick(project)}
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors hover:shadow-md ${
                                documentCount > 0 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              title="Click to see document breakdown by review stage"
                            >
                              <FileText className="h-3 w-3 mr-1" />
                              {documentCount} {documentCount === 1 ? 'doc' : 'docs'}
                              <BarChart3 className="h-3 w-3 ml-1 opacity-60" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {project.is_active === false ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              Inactive
                            </span>
                          ) : (
                            <>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                                Active
                              </span>
                              {project.featured === true && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                  Featured
                                </span>
                              )}
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openDocumentsModal(project)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 p-1"
                              title="Manage Documents"
                            >
                              <FileText className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => updateProject(project.id, { featured: !project.featured })}
                              className={`p-1 ${project.featured ? 'text-yellow-500 hover:text-yellow-600 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400'}`}
                              title={project.featured ? 'Unmark as Featured' : 'Mark as Featured'}
                            >
                              {project.featured ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245 1.179-6.881-5-4.868 6.9-1.002L12 2.25l3.093 6.994 6.9 1.002-5 4.868 1.179 6.881z"/></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 17.75l-6.172 3.245 1.179-6.881-5-4.868 6.9-1.002L12 2.25l3.093 6.994 6.9 1.002-5 4.868 1.179 6.881z"/></svg>
                              )}
                            </button>
                            <button
                              onClick={() => updateProject(project.id, { is_active: !project.is_active })}
                              className={`p-1 ${project.is_active ? 'text-green-500 hover:text-green-600 dark:text-green-400 dark:hover:text-green-300' : 'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300'}`}
                              title={project.is_active ? 'Mark as Inactive' : 'Mark as Active'}
                            >
                              {project.is_active ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l2 2 4-4" stroke="#fff" strokeWidth="2" fill="none"/></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="8" y1="12" x2="16" y2="12" stroke="#fff" strokeWidth="2"/></svg>
                              )}
                            </button>
                            <button
                              onClick={() => openEditModal(project)}
                              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 p-1"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(project)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <div className="relative group">
                              <button className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300 p-1">
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                <Link 
                                  to={`/projects/${project.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  View Project
                                </Link>
                                <button 
                                  onClick={() => updateProject(project.id, { featured: !project.featured })}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                                >
                                  {project.featured ? 'Remove from Featured' : 'Mark as Featured'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Document Breakdown Modal */}
      {isDocumentBreakdownOpen && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Package className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Document Breakdown
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedProject.title}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDocumentBreakdownOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {getDocumentBreakdown(selectedProject.id).map((stage) => {
                  const StageIcon = stage.icon;
                  const stageColors = {
                    blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300',
                    purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-300',
                    green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
                  };

                  const iconColors = {
                    blue: 'text-blue-600 dark:text-blue-400',
                    purple: 'text-purple-600 dark:text-purple-400',
                    green: 'text-green-600 dark:text-green-400'
                  };

                  return (
                    <div
                      key={stage.value}
                      className={`border rounded-lg p-4 ${stageColors[stage.color as keyof typeof stageColors]}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <StageIcon className={`h-6 w-6 mr-3 ${iconColors[stage.color as keyof typeof iconColors]}`} />
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {stage.label}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {stage.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            stage.count > 0 
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          }`}>
                            {stage.count} {stage.count === 1 ? 'document' : 'documents'}
                          </span>
                          {stage.count > 0 ? (
                            <div className="flex items-center text-green-600 dark:text-green-400">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : (
                            <div className="flex items-center text-gray-400">
                              <X className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Summary */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 text-gray-600 dark:text-gray-400 mr-2" />
                    <span className="font-medium text-gray-900 dark:text-white">Total Documents</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900 dark:text-white">
                    {getDocumentCount(selectedProject.id)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {getDocumentCount(selectedProject.id) > 0 
                    ? 'Ready for customer delivery after purchase'
                    : 'No documents available - customers will receive "coming soon" notification'
                  }
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsDocumentBreakdownOpen(false);
                    openDocumentsModal(selectedProject);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Manage Documents
                </button>
                <button
                  onClick={() => setIsDocumentBreakdownOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Project</h2>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="project-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="project-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="project-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      id="project-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="IoT">IoT</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Web">Web Development</option>
                      <option value="Mobile">Mobile App</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="project-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="project-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      id="project-price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="project-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        id="project-image-url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Image URL"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                      <input
                        type="file"
                        id="project-image-upload"
                        name="imageUpload"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white dark:hover:file:bg-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        id={`project-feature-${index}`}
                        name={`feature-${index}`}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder={`Feature ${index + 1}`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 flex items-center justify-center h-10 w-10 rounded-md bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
                
                <div>
                  <label htmlFor="project-technical-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Technical Details
                  </label>
                  <textarea
                    id="project-technical-details"
                    name="technical_details"
                    value={formData.technical_details}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Technologies used, implementation details, etc."
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="project-featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="project-featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Mark as featured project
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Add Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Edit Project Modal */}
      {isEditModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Edit Project</h2>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit-project-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Title
                    </label>
                    <input
                      type="text"
                      id="edit-project-title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-project-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      id="edit-project-category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    >
                      <option value="IoT">IoT</option>
                      <option value="Blockchain">Blockchain</option>
                      <option value="Web">Web Development</option>
                      <option value="Mobile">Mobile App</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="edit-project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    id="edit-project-description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  ></textarea>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="edit-project-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      id="edit-project-price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="edit-project-image" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Image
                    </label>
                    <div className="space-y-2">
                      <input
                        type="url"
                        id="edit-project-image-url"
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Image URL"
                      />
                      <div className="text-sm text-gray-500 dark:text-gray-400">or</div>
                      <input
                        type="file"
                        id="edit-project-image-upload"
                        name="imageUpload"
                        onChange={handleInputChange}
                        accept="image/*"
                        className="w-full text-gray-700 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-gray-600 dark:file:text-white dark:hover:file:bg-gray-500"
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Features
                  </label>
                  
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex mb-2">
                      <input
                        type="text"
                        id={`edit-project-feature-${index}`}
                        name={`feature-${index}`}
                        value={feature}
                        onChange={(e) => handleFeatureChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder={`Feature ${index + 1}`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="ml-2 flex items-center justify-center h-10 w-10 rounded-md bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 text-gray-700 hover:bg-gray-100 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Feature
                  </button>
                </div>
                
                <div>
                  <label htmlFor="edit-project-technical-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Technical Details
                  </label>
                  <textarea
                    id="edit-project-technical-details"
                    name="technical_details"
                    value={formData.technical_details}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Technologies used, implementation details, etc."
                  ></textarea>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="edit-project-featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="edit-project-featured" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Mark as featured project
                  </label>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Delete Project</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Are you sure you want to delete "{currentProject.title}"? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-white bg-white hover:bg-gray-50 dark:bg-gray-700 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Documents Management Modal */}
      {isDocumentsModalOpen && currentProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Documents - {currentProject.title}
                </h2>
                <button 
                  onClick={() => setIsDocumentsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <ProjectDocumentsManager project={currentProject} />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminProjectsPage;