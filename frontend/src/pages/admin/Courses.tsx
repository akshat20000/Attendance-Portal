import { useState, useEffect } from 'react'
import type { JSX } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchCourses, createCourse } from '../../features/course/courseSlice'
import { fetchUsers } from '../../features/user/userslice'


export function AdminCourses(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()
  const { courses, status } = useSelector((state: RootState) => state.course)
  const { users, status: usersStatus } = useSelector((state: RootState) => state.user)
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseDuration, setNewCourseDuration] = useState('')
  const [newCourseDescription, setNewCourseDescription] = useState('')
  const [selectedCoordinator, setSelectedCoordinator] = useState('');


  const [filter, setFilter] = useState('')
  const visible = courses.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()))


  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchCourses())
    }
  }, [dispatch, status])


  useEffect(() => {
    if (usersStatus === 'idle') {
      dispatch(fetchUsers())
    }
  }, [dispatch, usersStatus])


  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCourseName && newCourseDuration) {
      const courseData = {
        name: newCourseName,
        description: newCourseDescription,
        duration: newCourseDuration,
        coordinator: selectedCoordinator || null,
      };
      // Dispatch the action to create the course
      dispatch(createCourse(courseData)).then(() => {
        // Reset form and hide it
        setNewCourseName('');
        setNewCourseDuration('');
        setNewCourseDescription('');
        setSelectedCoordinator('');
        setShowCreateForm(false);
        // Optionally, refetch courses
        dispatch(fetchCourses());
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Program Management</h1>
            <p className="text-gray-600">Create and manage educational programs</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`rounded-lg px-6 py-2.5 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
              showCreateForm 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
            }`}
          >
            {showCreateForm ? '❌ Cancel' : '➕ New Program'}
          </button>
        </div>

        {/* Creation Form */}
        {showCreateForm && (
          <div className="animate-fadeIn border-2 border-purple-200 rounded-xl shadow-xl bg-gradient-to-br from-purple-50 to-indigo-50">
            <form onSubmit={handleCreateCourse} className="space-y-8 p-8">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🎓</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Program</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="courseName" className="block text-sm font-semibold text-gray-700">
                    Program Name *
                  </label>
                  <input
                    id="courseName"
                    type="text"
                    value={newCourseName}
                    onChange={(e) => setNewCourseName(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="e.g., Bachelor of Science in Computer Science"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="courseDuration" className="block text-sm font-semibold text-gray-700">
                    Duration *
                  </label>
                  <input
                    id="courseDuration"
                    type="text"
                    value={newCourseDuration}
                    onChange={(e) => setNewCourseDuration(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                    placeholder="e.g., 4 Years, 2 Semesters"
                    required
                  />
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <label htmlFor="courseDescription" className="block text-sm font-semibold text-gray-700">
                    Program Description *
                  </label>
                  <textarea
                    id="courseDescription"
                    value={newCourseDescription}
                    onChange={(e) => setNewCourseDescription(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200 min-h-[100px] resize-y"
                    placeholder="Provide a comprehensive description of the program objectives, outcomes, and key features..."
                    required
                  />
                </div>

                <div className="lg:col-span-2 space-y-2">
                  <label htmlFor="coordinator" className="block text-sm font-semibold text-gray-700">
                    Program Coordinator
                  </label>
                  <select
                    id="coordinator"
                    value={selectedCoordinator}
                    onChange={(e) => setSelectedCoordinator(e.target.value)}
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
                  >
                    <option value="">Select Program Coordinator (Optional)</option>
                    {users.filter(teacher => teacher.id != null)
                      .map(teacher => (
                        <option key={teacher.id} value={teacher.id!}>
                          {teacher.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💾 Save Program
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Search programs by name..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">Found:</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full font-semibold">
                {visible.length} program{visible.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        {/* Programs Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">All Programs</h3>
            <p className="text-sm text-gray-600">
              Manage your educational programs and their coordinators
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Program Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Duration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Coordinator</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {visible.length > 0 ? (
                  visible.map(p => (
                    <tr key={p.id} className="hover:bg-purple-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-lg">🎓</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{p.name}</div>
                            <div className="text-xs text-gray-500">Program</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 max-w-xs truncate" title={p.description}>
                          {p.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {p.duration}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {(p.coordinator as any)?.name ? (
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-xs">👤</span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {(p.coordinator as any).name}
                              </div>
                              <div className="text-xs text-gray-500">Coordinator</div>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic text-sm">No coordinator assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md">
                          ✏️ Edit
                        </button>
                        <button className="bg-red-100 hover:bg-red-200 text-red-800 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md">
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="text-gray-400 mb-4">
                        <div className="text-4xl mb-2">🎓</div>
                        <div className="text-lg font-medium text-gray-600">
                          {filter ? 'No programs match your search' : 'No programs available'}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {filter 
                            ? 'Try adjusting your search terms' 
                            : 'Create your first program using the "New Program" button'
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading State */}
        {status === 'loading' && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600 font-medium">Loading programs...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
