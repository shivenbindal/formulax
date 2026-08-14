import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DashboardContext } from '../context/DashboardContext'
import { useContext } from 'react'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Plus, Flame, Settings2, Bell, BookOpen, Zap } from 'lucide-react'
import { db } from '../firebase/config'
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore'

const SUBJECT_COLORS = {
  Physics: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', dot: 'bg-blue-500' },
  Chemistry: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', dot: 'bg-red-500' },
  Mathematics: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600', dot: 'bg-purple-500' },
  Biology: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', dot: 'bg-green-500' },
}

export default function MySheetsPage() {
  const navigate = useNavigate()
  const { user, darkMode, classLevel, subject, streak } = useContext(DashboardContext)
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterSubject, setFilterSubject] = useState(subject || 'All')
  const [createOpen, setCreateOpen] = useState(false)
  const [newSheetName, setNewSheetName] = useState('')
  const [newSheetSubject, setNewSheetSubject] = useState('Physics')

  useEffect(() => {
    if (!user?.uid) return
    loadSheets()
  }, [user?.uid, filterSubject])

  const loadSheets = async () => {
    try {
      setLoading(true)
      const sheetsRef = collection(db, 'users', user.uid, 'sheets')
      let q = query(sheetsRef)
      if (filterSubject !== 'All') {
        q = query(sheetsRef, where('subject', '==', filterSubject))
      }
      const snapshot = await getDocs(q)
      setSheets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    } catch (err) {
      console.error('Error loading sheets:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSheet = async () => {
    if (!newSheetName.trim() || !user?.uid) return
    try {
      const sheetsRef = collection(db, 'users', user.uid, 'sheets')
      await addDoc(sheetsRef, {
        name: newSheetName,
        subject: newSheetSubject,
        questions: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      setNewSheetName('')
      setNewSheetSubject('Physics')
      setCreateOpen(false)
      loadSheets()
    } catch (err) {
      console.error('Error creating sheet:', err)
    }
  }

  const subjectOptions = Object.keys(SUBJECT_COLORS)

  return (
    <div className={`min-h-screen transition-colors ${darkMode ? 'bg-slate-950' : 'bg-[#F5F5F3]'}`}>
      {/* Header with floating pill cluster */}
      <div className="sticky top-0 z-40 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Sheets</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Organize your practice questions by topic</p>
          </div>

          {/* Floating pill cluster (top-right) */}
          <div className="flex items-center gap-2">
            {/* Streak */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                    <Flame className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{streak || 0}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>Your current streak</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Class level */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-full hidden sm:inline-flex">
                  <span className="text-xs font-medium">{classLevel || 'Class'}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {['9', '10', '11', '12', 'NEET', 'JEE'].map(cls => (
                  <DropdownMenuItem key={cls}>{cls}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Bell className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Settings */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Settings</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filter + Create controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                {filterSubject === 'All' ? 'All Subjects' : filterSubject}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterSubject('All')}>
                All Subjects
              </DropdownMenuItem>
              {subjectOptions.map(subj => (
                <DropdownMenuItem key={subj} onClick={() => setFilterSubject(subj)}>
                  {subj}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 rounded-full">
                <Plus className="w-4 h-4" />
                New Sheet
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl">
              <DialogHeader>
                <DialogTitle>Create New Sheet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Sheet Name</label>
                  <input
                    type="text"
                    value={newSheetName}
                    onChange={(e) => setNewSheetName(e.target.value)}
                    placeholder="e.g., Electromagnetic Induction"
                    className="w-full mt-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Subject</label>
                  <select
                    value={newSheetSubject}
                    onChange={(e) => setNewSheetSubject(e.target.value)}
                    className="w-full mt-2 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {subjectOptions.map(subj => (
                      <option key={subj} value={subj}>{subj}</option>
                    ))}
                  </select>
                </div>
                <Button
                  onClick={handleCreateSheet}
                  disabled={!newSheetName.trim()}
                  className="w-full rounded-lg"
                >
                  Create Sheet
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Bento grid */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-slate-500 dark:text-slate-400">Loading sheets...</div>
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BookOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-center">No sheets yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sheets.map(sheet => {
              const colors = SUBJECT_COLORS[sheet.subject] || SUBJECT_COLORS.Physics
              return (
                <Card
                  key={sheet.id}
                  onClick={() => navigate(`/dashboard/sheets/${sheet.id}`)}
                  className={`p-6 rounded-3xl cursor-pointer transition-all hover:shadow-md ${
                    darkMode
                      ? 'bg-slate-800 border-slate-700'
                      : `${colors.bg} border ${colors.border}`
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-3 h-3 rounded-full ${colors.dot}`} />
                    <span className={`text-xs font-semibold ${colors.text}`}>{sheet.subject}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 line-clamp-2">
                    {sheet.name}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {sheet.questions?.length || 0} questions
                  </p>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
