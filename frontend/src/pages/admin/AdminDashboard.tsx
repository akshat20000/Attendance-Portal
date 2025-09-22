import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import type { RootState, AppDispatch } from '../../store/store'
import { fetchCourses } from '../../features/course/courseSlice'
import { fetchSubjects } from '../../features/subject/subjectSlice.ts'
import { fetchClasses } from '../../features/class/classSlice.ts'
import { Card, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/Button.tsx"
import { PlusCircle, BookOpen, BookMarked, Users } from "lucide-react"
import { motion } from "framer-motion"

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  // Redux state
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user)
  const { courses } = useSelector((state: RootState) => state.course)
  const { subjects } = useSelector((state: RootState) => state.subject)
  const { offerings } = useSelector((state: RootState) => state.class)

  // Create dropdown state
  const [showCreateDropdown, setShowCreateDropdown] = useState(false)
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      navigate('/login', { replace: true })
    } else {
      // Fetch data
      dispatch(fetchCourses())
      dispatch(fetchSubjects())
      dispatch(fetchClasses())
    }
  }, [isAuthenticated, user, navigate, dispatch])

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-extrabold text-purple-700 tracking-tight">Admin Dashboard</h1>

        {/* Create button */}
        <div className="relative">
          <Button
            onClick={() => setShowCreateDropdown(!showCreateDropdown)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700"
          >
            <PlusCircle size={18} /> Create
          </Button>

          {showCreateDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-52 bg-white border shadow-xl rounded-lg overflow-hidden z-10"
            >
              <button onClick={() => navigate('/admin/courses')}
                className="block w-full text-left px-4 py-3 hover:bg-purple-100 transition">📘 New Course</button>
              <button onClick={() => navigate('/admin/subjects')}
                className="block w-full text-left px-4 py-3 hover:bg-purple-100 transition">📖 New Subject</button>
              <button onClick={() => navigate('/admin/classes')}
                className="block w-full text-left px-4 py-3 hover:bg-purple-100 transition">👥 New Class</button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div whileHover={{ scale: 1.03 }}>
          <Card className="bg-gradient-to-br from-purple-100 to-purple-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <BookOpen className="text-purple-700" />
                <h2 className="text-xl font-semibold text-purple-800">Courses ({courses.length})</h2>
              </div>
              <ul className="mt-2 text-gray-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {courses.map((course: any) => (
                  <li key={course.id}>{course.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }}>
          <Card className="bg-gradient-to-br from-blue-100 to-blue-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <BookMarked className="text-blue-700" />
                <h2 className="text-xl font-semibold text-blue-800">Subjects ({subjects.length})</h2>
              </div>
              <ul className="mt-2 text-gray-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {subjects.map((subject: any) => (
                  <li key={subject.id}>{subject.name}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.03 }}>
          <Card className="bg-gradient-to-br from-green-100 to-green-200 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Users className="text-green-700" />
                <h2 className="text-xl font-semibold text-green-800">Classes ({offerings.length})</h2>
              </div>
              <ul className="mt-2 text-gray-700 list-disc list-inside space-y-1 max-h-40 overflow-y-auto">
                {offerings.map((cls: any) => {
                  const subjectName = subjects.find(s => s._id === cls.subject._id)?.name || 'Unnamed Class'
                  return <li key={cls.id}>{subjectName}</li>
                })}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

export default AdminDashboard
