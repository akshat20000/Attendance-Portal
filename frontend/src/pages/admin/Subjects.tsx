import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import type { JSX } from 'react'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchSubjects, createSubject } from '../../features/subject/subjectSlice'
import { fetchCourses } from '../../features/course/courseSlice'


export function AdminSubjects(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>()
  
  const { subjects, status: subjectsStatus } = useSelector((state: RootState) => state.subject)
  const { courses, status: coursesStatus } = useSelector((state: RootState) => state.course)

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectCode, setNewSubjectCode] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newSubjectType, setNewSubjectType] = useState('Theory');
  const [newSubjectCredits, setNewSubjectCredits] = useState('');

  // Fetch data on mount
  useEffect(() => {
    if (subjectsStatus === 'idle') {
      dispatch(fetchSubjects())
    }
    if (coursesStatus === 'idle') {
      dispatch(fetchCourses())
    }
  }, [dispatch, subjectsStatus, coursesStatus])

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubjectName && selectedCourseId && newSubjectCode && newSubjectType && newSubjectCredits) {
      const subjectData = {
        name: newSubjectName,
        code: newSubjectCode,
        program: selectedCourseId,
        type: newSubjectType,
        credits: parseInt(newSubjectCredits, 10),
      };
      
      dispatch(createSubject(subjectData)).then(() => {
        setShowCreateForm(false);
        setNewSubjectName('');
        setNewSubjectCode('');
        setSelectedCourseId('');
        setNewSubjectType('Theory');
        setNewSubjectCredits('');
        dispatch(fetchSubjects());
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Subject Management</h1>
            <p className="text-gray-600">Create and manage academic subjects and courses</p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={`rounded-lg px-6 py-2.5 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
              showCreateForm 
                ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
            }`}
          >
            {showCreateForm ? '❌ Cancel' : '➕ New Subject'}
          </button>
        </div>

        {/* Creation Form */}
        {showCreateForm && (
          <div className="animate-fadeIn border-2 border-emerald-200 rounded-xl shadow-xl bg-gradient-to-br from-emerald-50 to-teal-50">
            <form onSubmit={handleCreateSubject} className="space-y-8 p-8">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">📚</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Create New Subject</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="subjectName" className="block text-sm font-semibold text-gray-700">
                    Subject Name *
                  </label>
                  <input 
                    id="subjectName" 
                    type="text" 
                    value={newSubjectName} 
                    onChange={(e) => setNewSubjectName(e.target.value)} 
                    required 
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                    placeholder="e.g., Data Structures and Algorithms"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="subjectCode" className="block text-sm font-semibold text-gray-700">
                    Subject Code *
                  </label>
                  <input 
                    id="subjectCode" 
                    type="text" 
                    value={newSubjectCode} 
                    onChange={(e) => setNewSubjectCode(e.target.value)} 
                    required 
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200 uppercase"
                    placeholder="e.g., CS301, MATH101"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="course" className="block text-sm font-semibold text-gray-700">
                    Program *
                  </label>
                  <select 
                    id="course" 
                    value={selectedCourseId} 
                    onChange={(e) => setSelectedCourseId(e.target.value)} 
                    required 
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                  >
                    <option value="" disabled>Select a program</option>
                    {courses.map(course => (
                      <option key={course._id} value={course._id}>{course.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subjectType" className="block text-sm font-semibold text-gray-700">
                    Subject Type *
                  </label>
                  <select 
                    id="subjectType" 
                    value={newSubjectType} 
                    onChange={(e) => setNewSubjectType(e.target.value)} 
                    required 
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                  >
                    <option value="Theory">📖 Theory</option>
                    <option value="Lab">🔬 Laboratory</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subjectCredits" className="block text-sm font-semibold text-gray-700">
                    Credit Hours *
                  </label>
                  <input 
                    id="subjectCredits" 
                    type="number" 
                    min="1"
                    max="10"
                    value={newSubjectCredits} 
                    onChange={(e) => setNewSubjectCredits(e.target.value)} 
                    required 
                    className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all duration-200"
                    placeholder="e.g., 3, 4"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-gray-200">
                <button 
                  type="submit" 
                  className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  💾 Save Subject
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

        {/* Subjects Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-1">Subject Catalog</h3>
                <p className="text-sm text-gray-600">
                  Showing {subjects.length} subject{subjects.length !== 1 ? 's' : ''} across all programs
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 font-medium">Total Credits:</span>
                <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full font-semibold text-sm">
                  {subjects.reduce((total, subject) => total + (subject.credits || 0), 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subjects.length > 0 ? (
                  subjects.map(s => (
                    <tr key={s.id} className="hover:bg-emerald-50 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-lg flex items-center justify-center ${
                            s.type === 'Lab' 
                              ? 'bg-gradient-to-br from-orange-500 to-red-600' 
                              : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                          }`}>
                            <span className="text-white font-bold text-lg">
                              {s.type === 'Lab' ? '🔬' : '📖'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{s.name}</div>
                            <div className="text-xs text-gray-500">Academic Subject</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800 uppercase tracking-wide">
                          {s.code ?? '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700 font-medium">
                          {(s.program as any)?.name ?? courses.find(c => c.id === s.program)?.name ?? '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          s.type === 'Lab' 
                            ? 'bg-orange-100 text-orange-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {s.type === 'Lab' ? '🔬 Laboratory' : '📖 Theory'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="text-sm font-semibold text-gray-900">
                            {s.credits ?? '-'}
                          </div>
                          {s.credits && (
                            <div className="ml-2 text-xs text-gray-500">
                              credit{s.credits !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
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
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-gray-400 mb-4">
                        <div className="text-4xl mb-2">📚</div>
                        <div className="text-lg font-medium text-gray-600">No subjects available</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Create your first subject using the "New Subject" button
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
        {subjectsStatus === 'loading' && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600 font-medium">Loading subjects...</span>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-100">
                <span className="text-2xl">📖</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Theory Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.filter(s => s.type === 'Theory').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-100">
                <span className="text-2xl">🔬</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lab Subjects</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.filter(s => s.type === 'Lab').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-emerald-100">
                <span className="text-2xl">🎯</span>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Credits</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subjects.reduce((total, subject) => total + (subject.credits || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
