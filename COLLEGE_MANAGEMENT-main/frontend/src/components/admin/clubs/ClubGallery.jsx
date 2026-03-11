import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  PhotoIcon, 
  PlusIcon, 
  TrashIcon, 
  XMarkIcon,
  ArrowUpTrayIcon,
  FunnelIcon,
  XCircleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import ApiService from '../../../services/api';

const mediaTypes = {
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  video: ['video/mp4', 'video/webm', 'video/ogg'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

const getMediaType = (fileType) => {
  if (mediaTypes.image.includes(fileType)) return 'image';
  if (mediaTypes.video.includes(fileType)) return 'video';
  if (mediaTypes.document.some(type => fileType.includes(type))) return 'document';
  return 'other';
};

const ClubGallery = () => {
  const { id: clubId } = useParams();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    event_id: ''
  });
  const [events, setEvents] = useState([]);
  const [filterEvent, setFilterEvent] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchMedia();
    fetchEvents();
  }, [clubId]);

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getClubGallery(clubId, {
        eventId: filterEvent === 'all' ? undefined : filterEvent
      });
      
      if (response.success) {
        // Process media items to include type
        const processedMedia = response.data.map(item => ({
          ...item,
          type: getMediaType(item.file_type),
          formattedDate: format(new Date(item.uploaded_at), 'MMM d, yyyy')
        }));
        
        setMedia(processedMedia);
      } else {
        setError(response.message || 'Failed to load gallery');
      }
    } catch (error) {
      console.error('Error fetching gallery:', error);
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await ApiService.getClubEvents(clubId);
      if (response.success) {
        setEvents(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      // Set default title to filename without extension
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      setUploadData(prev => ({
        ...prev,
        title: fileName
      }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadProgress(0);

      const response = await ApiService.uploadClubMedia({
        clubId,
        eventId: uploadData.event_id || null,
        file: selectedFile,
        title: uploadData.title,
        description: uploadData.description
      });

      if (response.success) {
        // Refresh the gallery
        await fetchMedia();
        // Reset form
        setShowUploadModal(false);
        setSelectedFile(null);
        setUploadData({
          title: '',
          description: '',
          event_id: ''
        });
      } else {
        setError(response.message || 'Failed to upload media');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      setError('Failed to upload media');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    try {
      setIsDeleting(true);
      const response = await ApiService.deleteClubMedia(mediaId);
      
      if (response.success) {
        // Remove the media from the local state
        setMedia(prev => prev.filter(item => item.id !== mediaId));
      } else {
        setError(response.message || 'Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      setError('Failed to delete media');
    } finally {
      setShowDeleteModal(null);
      setIsDeleting(false);
    }
  };

  const filteredMedia = media.filter(item => {
    const matchesEvent = filterEvent === 'all' || item.event_id === filterEvent;
    const matchesType = filterType === 'all' || item.type === filterType;
    return matchesEvent && matchesType;
  });

  const getMediaPreview = (item) => {
    switch (item.type) {
      case 'image':
        return (
          <img
            src={item.file_url}
            alt={item.title}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        );
      case 'video':
        return (
          <div className="w-full h-48 bg-gray-200 flex items-center justify-center rounded-t-lg">
            <video className="max-h-full max-w-full">
              <source src={item.file_url} type={item.file_type} />
              Your browser does not support the video tag.
            </video>
          </div>
        );
      case 'document':
        return (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
            <div className="text-center p-4">
              <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600 truncate">{item.title}</p>
              <p className="text-xs text-gray-500">{item.file_type}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-48 bg-gray-100 flex items-center justify-center rounded-t-lg">
            <div className="text-center p-4">
              <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">Unsupported file type</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Club Gallery</h1>
          <p className="mt-2 text-sm text-gray-700">
            Upload and manage media files for your club.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Upload Media
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <label htmlFor="event-filter" className="block text-sm font-medium text-gray-700">
                Filter by Event
              </label>
              <select
                id="event-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterEvent}
                onChange={(e) => setFilterEvent(e.target.value)}
              >
                <option value="all">All Events</option>
                {events.map(event => (
                  <option key={event.id} value={event.id}>
                    {event.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">
                Filter by Type
              </label>
              <select
                id="type-filter"
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Grid */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <XCircleIcon className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      ) : filteredMedia.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredMedia.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden">
              {getMediaPreview(item)}
              <div className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 truncate">{item.title}</h3>
                    {item.event_name && (
                      <p className="text-xs text-blue-600 mt-1">{item.event_name}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(item.id)}
                    className="text-gray-400 hover:text-red-500"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
                {item.description && (
                  <p className="mt-1 text-xs text-gray-500 line-clamp-2">{item.description}</p>
                )}
                <div className="mt-2 flex items-center text-xs text-gray-500">
                  <span>{item.formattedDate}</span>
                  <span className="mx-1">•</span>
                  <span>{item.file_type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow sm:rounded-lg">
          <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No media found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filterEvent !== 'all' || filterType !== 'all'
              ? 'No media matches your filters.'
              : 'Get started by uploading some media.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowUploadModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Upload Media
            </button>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
                  <ArrowUpTrayIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-3 text-center sm:mt-5">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Upload Media</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Upload images, videos, or documents to your club's gallery.
                    </p>
                  </div>
                </div>
              </div>
              
              <form onSubmit={handleUpload} className="mt-5 space-y-4">
                <div>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      {selectedFile ? (
                        <div className="text-sm text-gray-600">
                          <p>{selectedFile.name}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                          >
                            Change file
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex text-sm text-gray-600">
                            <label
                              htmlFor="file-upload"
                              className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                            >
                              <span>Upload a file</span>
                              <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF, PDF, MP4 up to 10MB
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows={3}
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="event_id" className="block text-sm font-medium text-gray-700">
                    Associate with Event (Optional)
                  </label>
                  <select
                    id="event_id"
                    name="event_id"
                    value={uploadData.event_id}
                    onChange={(e) => setUploadData({ ...uploadData, event_id: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">Select an event (optional)</option>
                    {events.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.title}
                      </option>
                    ))}
                  </select>
                </div>

                {uploading && (
                  <div className="pt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {Math.round(uploadProgress)}% Complete
                    </p>
                  </div>
                )}

                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={!selectedFile || uploading}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm ${(!selectedFile || uploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal !== null && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <TrashIcon className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Delete Media</h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this media? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => handleDeleteMedia(showDeleteModal)}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubGallery;
