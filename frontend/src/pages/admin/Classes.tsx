import { useState, useEffect } from "react";
import type { JSX } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState, AppDispatch } from "../../store/store";
import { fetchClasses, createClass, updateClass, deleteClass } from "../../features/class/classSlice";
import { fetchSubjects } from "../../features/subject/subjectSlice";
import { fetchCourses } from "../../features/course/courseSlice";
import { fetchUsers, type User } from "../../features/user/userslice";
import { authService } from '../../services/authServices';
import type { ClassOffering } from "../../types";



type Semester = "Fall" | "Spring" | "Summer" | "Odd" | "Even" | "Yearly";
type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";


interface ScheduleEntry {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
}


interface StudentEntry {
  cmsId: string;
  userId: string;
  name: string;
  isValid: boolean;
  isLoading: boolean;
}


export function AdminClasses(): JSX.Element {
  const dispatch = useDispatch<AppDispatch>();
  
  // Redux state
  const { offerings: classOfferings, status: classesStatus } = useSelector(
    (state: RootState) => state.class
  );
  const { subjects, status: subjectsStatus } = useSelector(
    (state: RootState) => state.subject
  );
  const { courses, status: coursesStatus } = useSelector(
    (state: RootState) => state.course
  );
  const { users, status: usersStatus } = useSelector(
    (state: RootState) => state.user
  );
  
  // Form State
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassOffering | null>(null);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [semester, setSemester] = useState<Semester>("Fall");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedule, setSchedule] = useState<ScheduleEntry[]>([]);
  
  // Teacher CMS ID Validation
  const [teacherCmsId, setTeacherCmsId] = useState("");
  const [cmsIdValid, setCmsIdValid] = useState<boolean | null>(null);
  const [cmsIdLoading, setCmsIdLoading] = useState(false);
  const [matchedTeacherId, setMatchedTeacherId] = useState("");
  
  // Student Management State
  const [students, setStudents] = useState<StudentEntry[]>([]);
  const [newStudentCmsId, setNewStudentCmsId] = useState("");
  
  // Fetch data on mount
  useEffect(() => {
    if (classesStatus === "idle") dispatch(fetchClasses());
    if (subjectsStatus === "idle") dispatch(fetchSubjects());
    if (coursesStatus === "idle") dispatch(fetchCourses());
    if (usersStatus === "idle") dispatch(fetchUsers());
  }, [dispatch, classesStatus, subjectsStatus, coursesStatus, usersStatus]);
  
  // Validate teacher CMS ID with debounce
  useEffect(() => {
    if (!teacherCmsId) {
      setCmsIdValid(null);
      setMatchedTeacherId('');
      return;
    }


    setCmsIdLoading(true);
    const debounce = setTimeout(() => { 
      authService.checkUserByCmsid(teacherCmsId, 'teacher')
        .then(data => {
          setCmsIdValid(data.found);
          if (data.found && data.user) {
            setMatchedTeacherId(data.user._id); 
          } else {
            setMatchedTeacherId('');
          }
        })
        .catch(() => {
          setCmsIdValid(false);
          setMatchedTeacherId('');
        })
        .finally(() => {
          setCmsIdLoading(false);
        });
    }, 400);


    return () => clearTimeout(debounce);
  }, [teacherCmsId]);


  // Student validation functions
  const validateStudentCmsId = async (cmsId: string): Promise<StudentEntry> => {
    try {
      const response = await authService.checkUserByCmsid(cmsId, 'student');
      
      if (!response.found) {
        return {
          cmsId,
          userId: '',
          name: 'Student not found',
          isValid: false,
          isLoading: false
        };
      }
      
      return {
        cmsId,
        userId: response.user?._id,
        name: response.user.name,
        isValid: true,
        isLoading: false
      };
    } catch (error) {
      return {
        cmsId,
        userId: '',
        name: 'Validation error',
        isValid: false,
        isLoading: false
      };
    }
  };


  const addStudent = async () => {
    if (!newStudentCmsId.trim()) return;
    
    // Check if student already added
    if (students.some(s => s.cmsId === newStudentCmsId)) {
      alert('Student already added to the class');
      return;
    }


    // Add loading entry
    const loadingEntry: StudentEntry = {
      cmsId: newStudentCmsId,
      userId: '',
      name: 'Validating...',
      isValid: false,
      isLoading: true
    };
    
    setStudents(prev => [...prev, loadingEntry]);
    setNewStudentCmsId('');


    // Validate the student
    const validatedStudent = await validateStudentCmsId(newStudentCmsId);
    setStudents(prev => 
      prev.map(s => s.cmsId === newStudentCmsId ? validatedStudent : s)
    );
  };


  const removeStudent = (cmsId: string) => {
    setStudents(prev => prev.filter(s => s.cmsId !== cmsId));
  };


  // Helper functions for schedule management
  const addSchedule = () => {
    setSchedule([...schedule, { dayOfWeek: "Monday", startTime: "", endTime: "", room: "" }]);
  };


  const removeSchedule = (index: number) => {
    setSchedule(schedule.filter((_, i) => i !== index));
  };


  const handleScheduleChange = (index: number, field: keyof ScheduleEntry, value: string) => {
    const updated = [...schedule];
    if (field === "dayOfWeek") {
      updated[index][field] = value as DayOfWeek;
    } else {
      updated[index][field] = value;
    }
    setSchedule(updated);
  };


  // Reset form function
  const resetForm = () => {
    setSelectedSubject("");
    setSectionName("");
    setTeacherCmsId("");
    setMatchedTeacherId("");
    setAcademicYear("");
    setSemester("Fall");
    setSchedule([]);
    setStartDate("");
    setEndDate("");
    setCmsIdValid(null);
    setStudents([]);
    setNewStudentCmsId("");
  };


  // Create class handler
  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject || !matchedTeacherId || !academicYear || !semester || !startDate || !endDate) return;


    // Get valid student IDs
    const validStudentIds = students
      .filter(s => s.isValid)
      .map(s => s.userId);


    const classData = {
      subject: selectedSubject,
      program: subject.program,
      sectionName,
      primaryTeacher: matchedTeacherId,
      academicYear,
      semester,
      schedule,
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      students: validStudentIds,
    };


    dispatch(createClass(classData)).then(() => {
      setShowCreateForm(false);
      resetForm();
      dispatch(fetchClasses());
    });
  };
  
  // Edit class handler
  const handleEditClass = (cls: ClassOffering) => {
    setEditingClass(cls);
    setSelectedSubject(cls.subject._id || cls.subject);
    setSectionName(cls.sectionName);
    setAcademicYear(cls.academicYear);
    setSemester(cls.semester);
    setSchedule(cls.schedule || []);
    setStartDate(cls.startDate);
    setEndDate(cls.endDate);
    
    // Find teacher's CMS ID if available
    const teacher = users.find(user => user._id === (cls.primaryTeacher._id || cls.primaryTeacher));
    if (teacher) {
      setTeacherCmsId(teacher.cmsId || "");
      setMatchedTeacherId(teacher._id);
      setCmsIdValid(true);
    }


    // Load existing students
    const existingStudents: StudentEntry[] = cls.students.map(studentId => {
      const student = users.find(u => u._id === studentId);
      return {
        cmsId: student?.cmsId || '',
        userId: studentId,
        name: student?.name || 'Unknown Student',
        isValid: true,
        isLoading: false
      };
    });
    setStudents(existingStudents);
    
    setShowEditForm(true);
    setShowCreateForm(false);
  };


  // Update class handler
  const handleUpdateClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClass || !matchedTeacherId) return;


    const subject = subjects.find((s) => s._id === selectedSubject);
    if (!subject) return;


    // Get valid student IDs
    const validStudentIds = students
      .filter(s => s.isValid)
      .map(s => s.userId);


    const updateData = {
      subject: selectedSubject,
      program: subject.program,
      sectionName,
      primaryTeacher: matchedTeacherId,
      academicYear,
      semester,
      schedule,
      startDate: startDate.split('T')[0],
      endDate: endDate.split('T')[0],
      students: validStudentIds,
    };
    
    console.log(updateData)
    dispatch(updateClass({ id: editingClass._id, data: updateData })).then(() => {
      setShowEditForm(false);
      setEditingClass(null);
      resetForm();
      dispatch(fetchClasses());
    });
  };
 
  // console.log('Start Date:', startDate.split('T')[0], 'Type:', typeof startDate);
  // console.log('End Date:', endDate.split('T')[0], 'Type:', typeof endDate);
  // Delete class handler
  const handleDeleteClass = (classId: string) => {
    if (window.confirm('Are you sure you want to delete this class? This action cannot be undone.')) {
      dispatch(deleteClass(classId)).then(() => {
        dispatch(fetchClasses());
      });
    }
  };


  // Cancel handlers
  const handleCancelEdit = () => {
    setShowEditForm(false);
    setEditingClass(null);
    resetForm();
  };


  const handleCancelCreate = () => {
    setShowCreateForm(false);
    resetForm();
  };


  // Student enrollment section component
  const renderStudentSection = () => (
    <div className="space-y-4">
      <label className="block text-sm font-semibold text-gray-700 mb-3">Student Enrollment</label>
      
      {/* Add student input */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={newStudentCmsId}
          onChange={(e) => setNewStudentCmsId(e.target.value)}
          placeholder="Enter student CMS ID"
          className="flex-1 rounded-lg border-2 border-gray-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStudent())}
        />
        <button
          type="button"
          onClick={addStudent}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!newStudentCmsId.trim()}
        >
          Add Student
        </button>
      </div>


      {/* Students list */}
      <div className="space-y-3 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50">
        {students.map((student, index) => (
          <div
            key={`${student.cmsId}-${index}`}
            className={`flex items-center justify-between p-3 rounded-lg border-l-4 shadow-sm transition-all duration-200 ${
              student.isLoading
                ? 'bg-white border-l-gray-400 border border-gray-200'
                : student.isValid
                ? 'bg-green-50 border-l-green-500 border border-green-200 hover:bg-green-100'
                : 'bg-red-50 border-l-red-500 border border-red-200 hover:bg-red-100'
            }`}
          >
            <div className="flex-1">
              <div className="font-semibold text-sm text-gray-800">
                CMS ID: {student.cmsId}
              </div>
              <div className={`text-xs font-medium ${student.isLoading ? 'text-gray-500' : student.isValid ? 'text-green-700' : 'text-red-700'}`}>
                {student.name}
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeStudent(student.cmsId)}
              className="text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
              disabled={student.isLoading}
            >
              Remove
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-sm text-gray-500 text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <div className="mb-2">📚</div>
            <div>No students added yet</div>
            <div className="text-xs mt-1">Use the input above to add students by their CMS ID</div>
          </div>
        )}
      </div>


      <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-200">
        <strong>Valid students:</strong> {students.filter(s => s.isValid).length} of {students.length} total
      </div>
    </div>
  );


  // Form JSX component for reusability
  const renderForm = (isEdit: boolean) => (
    <div className={`border-2 rounded-xl shadow-xl ${isEdit ? 'border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50' : 'border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <form 
        onSubmit={isEdit ? handleUpdateClass : handleCreateClass} 
        className="space-y-8 p-8"
      >
        <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isEdit ? 'bg-orange-600' : 'bg-blue-600'}`}>
            <span className="text-white font-bold text-lg">{isEdit ? '✏️' : '➕'}</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            {isEdit ? 'Edit Class' : 'Create New Class'}
          </h2>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700">
              Subject *
            </label>
            <select
              id="subject"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="" disabled>
                Select Subject
              </option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>


          <div className="space-y-2">
            <label htmlFor="teacher" className="block text-sm font-semibold text-gray-700">
              Teacher (CMS ID) *
            </label>
            <div className="relative">
              <input
                id="teacher"
                type="text"
                value={teacherCmsId}
                onChange={(e) => setTeacherCmsId(e.target.value)}
                placeholder="Enter teacher CMS ID"
                className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
                required
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                {cmsIdLoading ? (
                  <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                ) : cmsIdValid === true ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                ) : cmsIdValid === false ? (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">✗</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>


          <div className="space-y-2">
            <label htmlFor="section" className="block text-sm font-semibold text-gray-700">
              Section *
            </label>
            <input
              id="section"
              type="text"
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
              placeholder="e.g., A, B, C-1"
            />
          </div>


          <div className="space-y-2">
            <label htmlFor="year" className="block text-sm font-semibold text-gray-700">
              Academic Year *
            </label>
            <input
              id="year"
              type="text"
              placeholder="e.g., 2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>


          <div className="space-y-2">
            <label htmlFor="semester" className="block text-sm font-semibold text-gray-700">
              Semester *
            </label>
            <select
              id="semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value as Semester)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            >
              <option value="Fall">Fall</option>
              <option value="Spring">Spring</option>
              <option value="Summer">Summer</option>
              <option value="Odd">Odd</option>
              <option value="Even">Even</option>
              <option value="Yearly">Yearly</option>
            </select>
          </div>


          <div className="space-y-2">
            <label htmlFor="startDate" className="block text-sm font-semibold text-gray-700">Start Date *</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>


          <div className="space-y-2">
            <label htmlFor="endDate" className="block text-sm font-semibold text-gray-700">End Date *</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200"
            />
          </div>
        </div>


        {/* Schedule Section */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-700">Class Schedule</label>
            <button
              type="button"
              onClick={addSchedule}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              + Add Time Slot
            </button>
          </div>
          <div className="space-y-4">
            {schedule.map((entry, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-5 gap-3 p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
              >
                <select
                  value={entry.dayOfWeek}
                  onChange={(e) =>
                    handleScheduleChange(index, "dayOfWeek", e.target.value)
                  }
                  className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                >
                  <option>Monday</option>
                  <option>Tuesday</option>
                  <option>Wednesday</option>
                  <option>Thursday</option>
                  <option>Friday</option>
                  <option>Saturday</option>
                  <option>Sunday</option>
                </select>
                <input
                  type="time"
                  value={entry.startTime}
                  onChange={(e) =>
                    handleScheduleChange(index, "startTime", e.target.value)
                  }
                  required
                  className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <input
                  type="time"
                  value={entry.endTime}
                  onChange={(e) =>
                    handleScheduleChange(index, "endTime", e.target.value)
                  }
                  required
                  className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <input
                  type="text"
                  placeholder="Room (e.g., 101, Lab-A)"
                  value={entry.room}
                  onChange={(e) =>
                    handleScheduleChange(index, "room", e.target.value)
                  }
                  required
                  className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                />
                <button
                  type="button"
                  onClick={() => removeSchedule(index)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center"
                >
                  Delete
                </button>
              </div>
            ))}
            {schedule.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                <div className="mb-2">⏰</div>
                <div>No schedule added yet</div>
                <div className="text-xs mt-1">Click "Add Time Slot" to create a schedule</div>
              </div>
            )}
          </div>
        </div>


        {/* Students Section */}
        <div className="bg-white rounded-xl p-6 border-2 border-gray-100 shadow-sm">
          {renderStudentSection()}
        </div>


        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            className={`rounded-lg text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isEdit 
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
            }`}
            disabled={cmsIdValid !== true}
          >
            {isEdit ? '📝 Update Class' : '💾 Save Class'}
          </button>
          <button
            type="button"
            onClick={isEdit ? handleCancelEdit : handleCancelCreate}
            className="rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Class Management</h1>
            <p className="text-gray-600">Create, edit, and manage class offerings</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            {showEditForm && (
              <button
                onClick={handleCancelEdit}
                className="rounded-lg bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 px-4 py-2.5 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                Cancel Edit
              </button>
            )}
            <button
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setShowEditForm(false);
                setEditingClass(null);
                if (showCreateForm) resetForm();
              }}
              className={`rounded-lg px-6 py-2.5 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 ${
                showCreateForm 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                  : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              }`}
            >
              {showCreateForm ? "❌ Cancel" : "➕ New Class"}
            </button>
          </div>
        </div>


        {/* Create Form */}
        {showCreateForm && !showEditForm && (
          <div className="animate-fadeIn">
            {renderForm(false)}
          </div>
        )}


        {/* Edit Form */}
        {showEditForm && editingClass && (
          <div className="animate-fadeIn">
            {renderForm(true)}
          </div>
        )}


        {/* Classes Table */}
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-1">All Classes</h3>
            <p className="text-sm text-gray-600">
              Showing {classOfferings.length} class{classOfferings.length !== 1 ? 'es' : ''}
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Program</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Section</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Teacher</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Students</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Schedule</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Term</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classOfferings.length > 0 ? (
                  classOfferings.map((cls, index) => {
                    let programName = "";
                    courses.forEach((c) => {
                      if (c._id === cls.program) programName = c.name;
                    });


                    return (
                      <tr key={cls._id ?? `class-${index}`} className="hover:bg-blue-50 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">
                            {cls.subject?.name ?? "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{programName}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            {cls.sectionName}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{cls.primaryTeacher?.name ?? "N/A"}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {cls.students?.length || 0} students
                          </span>
                        </td>


                        <td className="px-6 py-4 text-sm text-gray-700">
                          {cls.schedule && cls.schedule.length > 0 ? (
                            <div className="space-y-1">
                              {cls.schedule.map((s, si) => (
                                <div key={`sched-${index}-${si}`} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                  <span className="font-medium">{s.dayOfWeek}</span> {s.startTime}-{s.endTime}
                                  <div className="text-gray-600">Room: {s.room}</div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">No schedule</span>
                          )}
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="font-medium">{cls.academicYear}</div>
                          <div className="text-xs text-gray-500">{cls.semester}</div>
                        </td>


                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button 
                            onClick={() => handleEditClass(cls)}
                            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            disabled={showEditForm || showCreateForm}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClass(cls._id)}
                            className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50"
                            disabled={showEditForm || showCreateForm}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="text-gray-400 mb-4">
                        <div className="text-4xl mb-2">📚</div>
                        <div className="text-lg font-medium text-gray-600">No classes available</div>
                        <div className="text-sm text-gray-500 mt-1">Create your first class using the "New Class" button</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>


        {/* Loading states */}
        {classesStatus === 'loading' && (
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              <span className="text-gray-600 font-medium">Loading classes...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
