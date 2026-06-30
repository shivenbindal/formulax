import { useEffect, useState } from 'react'
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const ADMIN_EMAIL = 'shivenbindal@gmail.com'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const syllabus = {
  'Class 9': { Physics: ['Motion', 'Laws of Motion', 'Gravitation', 'Work & Energy', 'Sound'], Chemistry: ['Matter in Our Surroundings', 'Is Matter Around Us Pure', 'Atoms & Molecules', 'Structure of Atom'], Mathematics: ['Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations', 'Triangles', 'Circles', 'Surface Areas & Volumes', 'Statistics'], Biology: ['Cell — Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms', 'Why Do We Fall Ill'] },
  'Class 10': { Physics: ['Light — Reflection & Refraction', 'Human Eye & Colourful World', 'Electricity', 'Magnetic Effects of Current'], Chemistry: ['Chemical Reactions & Equations', 'Acids Bases & Salts', 'Metals & Non-Metals', 'Carbon & Its Compounds', 'Periodic Classification'], Mathematics: ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry', 'Circles', 'Surface Areas & Volumes', 'Statistics', 'Probability'], Biology: ['Life Processes', 'Control & Coordination', 'Reproduction', 'Heredity & Evolution'] },
  'Class 11': { Physics: ['Units & Measurement', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion', 'Work Energy & Power', 'Gravitation', 'Mechanical Properties of Solids', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves'], Chemistry: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'States of Matter', 'Thermodynamics', 'Equilibrium', 'Redox Reactions', 'Organic Chemistry Basics', 'Hydrocarbons'], Mathematics: ['Sets', 'Relations & Functions', 'Trigonometry', 'Complex Numbers', 'Linear Inequalities', 'Permutations & Combinations', 'Binomial Theorem', 'Sequences & Series', 'Straight Lines', 'Conic Sections', 'Limits & Derivatives', 'Statistics', 'Probability'], Biology: ['Cell Biology', 'Biomolecules', 'Cell Division', 'Transport in Plants', 'Mineral Nutrition', 'Photosynthesis', 'Respiration in Plants', 'Plant Growth', 'Digestion & Absorption', 'Breathing & Exchange of Gases', 'Body Fluids & Circulation', 'Excretory Products', 'Locomotion & Movement', 'Neural Control', 'Chemical Coordination'] },
  'Class 12': { Physics: ['Electric Charges & Fields', 'Electrostatic Potential', 'Current Electricity', 'Moving Charges & Magnetism', 'Magnetism & Matter', 'Electromagnetic Induction', 'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics', 'Dual Nature of Radiation', 'Atoms', 'Nuclei', 'Semiconductor Electronics'], Chemistry: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Surface Chemistry', 'Coordination Compounds', 'Haloalkanes & Haloarenes', 'Alcohols Phenols & Ethers', 'Aldehydes Ketones & Acids', 'Amines', 'Biomolecules', 'Polymers'], Mathematics: ['Relations & Functions', 'Inverse Trigonometry', 'Matrices', 'Determinants', 'Continuity & Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals', 'Differential Equations', 'Vector Algebra', 'Three Dimensional Geometry', 'Linear Programming', 'Probability'], Biology: ['Reproduction in Organisms', 'Sexual Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance', 'Molecular Basis of Inheritance', 'Evolution', 'Human Health & Disease', 'Microbes in Human Welfare', 'Biotechnology Principles', 'Biotechnology Applications', 'Organisms & Populations', 'Ecosystem', 'Biodiversity', 'Environmental Issues'] },
  'NEET': { Physics: ['Units & Measurement', 'Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'Properties of Matter', 'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EMI & AC', 'Optics', 'Modern Physics', 'Semiconductors'], Chemistry: ['Basic Concepts', 'Atomic Structure', 'Chemical Bonding', 'Equilibrium', 'Thermodynamics', 'Electrochemistry', 'Chemical Kinetics', 'Solutions', 'Surface Chemistry', 'Coordination Compounds', 'Organic Chemistry', 'Biomolecules', 'Polymers'], Biology: ['Cell Biology', 'Genetics & Evolution', 'Human Physiology', 'Plant Physiology', 'Reproduction', 'Ecology', 'Biotechnology'] },
  'JEE': { Physics: ['Kinematics', 'Laws of Motion', 'Work Energy Power', 'Rotational Motion', 'Gravitation', 'SHM', 'Waves', 'Electrostatics', 'Current Electricity', 'Magnetism', 'EMI', 'Optics', 'Modern Physics', 'Thermodynamics'], Chemistry: ['Mole Concept', 'Atomic Structure', 'Chemical Bonding', 'Thermodynamics', 'Equilibrium', 'Electrochemistry', 'Kinetics', 'Coordination Compounds', 'Organic Chemistry', 'Hydrocarbons', 'GOC'], Mathematics: ['Algebra', 'Trigonometry', 'Coordinate Geometry', 'Calculus', 'Vectors & 3D', 'Probability', 'Matrices & Determinants', 'Complex Numbers'] },
}

export default function Admin() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('users')
  const [users, setUsers] = useState([])
  const [sheets, setSheets] = useState([])
  const [loading, setLoading] = useState(true)

  // Upload form state
  const [selClass, setSelClass] = useState('Class 11')
  const [selSubject, setSelSubject] = useState('Physics')
  const [selChapter, setSelChapter] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  useEffect(() => {
    if (user?.email !== ADMIN_EMAIL) {
      navigate('/dashboard')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    setLoading(true)
    const usersSnap = await getDocs(collection(db, 'users'))
    setUsers(usersSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    const sheetsSnap = await getDocs(collection(db, 'sheets'))
    setSheets(sheetsSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    setLoading(false)
  }

  const handleUpload = async () => {
    if (!file || !selChapter) return
    setUploading(true)
    setUploadSuccess(false)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', `formulax/${selClass}/${selSubject}`)

      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()

      await addDoc(collection(db, 'sheets'), {
        class: selClass,
        subject: selSubject,
        chapter: selChapter,
        fileUrl: data.secure_url,
        fileType: data.format === 'pdf' ? 'pdf' : 'image',
        uploadedAt: new Date().toISOString(),
      })

      setUploadSuccess(true)
      setFile(null)
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Upload failed: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this sheet?')) return
    await deleteDoc(doc(db, 'sheets', id))
    fetchData()
  }

  if (user?.email !== ADMIN_EMAIL) return null

  const currentSubjects = Object.keys(syllabus[selClass] || {})
  const currentChapters = syllabus[selClass]?.[selSubject] || []

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-['Inter']">

      {/* HEADER */}
      <div className="border-b border-black/6 bg-white px-8 py-4 flex items-center justify-between sticky top-0 z-10">
        <span className="font-black text-black tracking-tight">Formula X — Admin</span>
        <div className="flex items-center gap-6">
          {['users', 'upload', 'sheets'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm capitalize transition-colors ${activeTab === tab ? 'text-black font-semibold' : 'text-neutral-400 hover:text-black'}`}
            >
              {tab}
            </button>
          ))}
          <span className="text-xs text-neutral-400">{user?.email}</span>
          <button onClick={() => { logout(); navigate('/') }} className="text-sm text-neutral-400 hover:text-black transition-colors">Sign out</button>
        </div>
      </div>

      <div className="p-8">

        {/* USERS TAB */}
        {activeTab === 'users' && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-black text-black">Users</h1>
                <p className="text-sm text-neutral-400">{users.length} total users</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Users', value: users.length },
                { label: 'NEET Prep', value: users.filter(u => u.exam === 'NEET').length },
                { label: 'JEE Prep', value: users.filter(u => u.exam?.includes('JEE')).length },
                { label: 'Class 12', value: users.filter(u => u.class === 'Class 12').length },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-black/8 rounded-2xl p-6">
                  <p className="text-3xl font-black text-black mb-1">{value}</p>
                  <p className="text-xs text-neutral-400 uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>

            <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/6">
                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">User</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Email</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Class</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Exam</th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-black/4 hover:bg-neutral-50 transition-colors ${i === users.length - 1 ? 'border-0' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={u.photo} className="w-8 h-8 rounded-full" onError={e => e.target.style.display = 'none'} />
                          <span className="text-sm font-medium text-black">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">{u.email}</td>
                      <td className="px-6 py-4"><span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">{u.class || '—'}</span></td>
                      <td className="px-6 py-4"><span className="text-xs bg-black text-white px-3 py-1 rounded-full">{u.exam || '—'}</span></td>
                      <td className="px-6 py-4 text-xs text-neutral-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className="text-center py-16 text-neutral-400 text-sm">No users yet.</div>}
            </div>
          </div>
        )}

        {/* UPLOAD TAB */}
        {activeTab === 'upload' && (
          <div className="max-w-xl">
            <h1 className="text-2xl font-black text-black mb-2">Upload Formula Sheet</h1>
            <p className="text-sm text-neutral-400 mb-8">Upload a PDF or image for any chapter.</p>

            {/* CLASS */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Class</p>
              <div className="flex flex-wrap gap-2">
                {Object.keys(syllabus).map(c => (
                  <button key={c} onClick={() => { setSelClass(c); setSelSubject(Object.keys(syllabus[c])[0]); setSelChapter('') }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selClass === c ? 'bg-black text-white border-black' : 'border-black/10 text-neutral-600 hover:border-black/30'}`}>
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* SUBJECT */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Subject</p>
              <div className="flex flex-wrap gap-2">
                {currentSubjects.map(s => (
                  <button key={s} onClick={() => { setSelSubject(s); setSelChapter('') }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all ${selSubject === s ? 'bg-black text-white border-black' : 'border-black/10 text-neutral-600 hover:border-black/30'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* CHAPTER */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">Chapter</p>
              <select
                value={selChapter}
                onChange={e => setSelChapter(e.target.value)}
                className="w-full border border-black/10 rounded-xl px-4 py-3 text-sm text-black bg-white focus:outline-none focus:border-black/30"
              >
                <option value="">Select chapter...</option>
                {currentChapters.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* FILE */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">File</p>
              <label className="block w-full border-2 border-dashed border-black/10 rounded-2xl p-8 text-center cursor-pointer hover:border-black/30 transition-all">
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={e => setFile(e.target.files[0])} />
                {file ? (
                  <div>
                    <p className="text-2xl mb-2">📄</p>
                    <p className="text-sm font-medium text-black">{file.name}</p>
                    <p className="text-xs text-neutral-400 mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-2xl mb-2">⬆️</p>
                    <p className="text-sm text-neutral-500">Click to upload PDF or image</p>
                    <p className="text-xs text-neutral-400 mt-1">PDF, PNG, JPG supported</p>
                  </div>
                )}
              </label>
            </div>

            {uploadSuccess && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 bg-green-50 border border-green-100 rounded-xl p-4 text-sm text-green-700">
                ✓ Sheet uploaded successfully!
              </motion.div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || !selChapter || uploading}
              className="w-full bg-black text-white py-3.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Uploading...</>
              ) : 'Upload Sheet →'}
            </button>
          </div>
        )}

        {/* SHEETS TAB */}
        {activeTab === 'sheets' && (
          <div>
            <h1 className="text-2xl font-black text-black mb-8">Uploaded Sheets ({sheets.length})</h1>
            {sheets.length === 0 ? (
              <div className="text-center py-20 text-neutral-400 text-sm">No sheets uploaded yet.</div>
            ) : (
              <div className="bg-white border border-black/8 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-black/6">
                      <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Chapter</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Class</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Subject</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Uploaded</th>
                      <th className="text-left px-6 py-4 text-xs font-semibold text-neutral-400 uppercase tracking-widest">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheets.map((s, i) => (
                      <tr key={s.id} className={`border-b border-black/4 hover:bg-neutral-50 ${i === sheets.length - 1 ? 'border-0' : ''}`}>
                        <td className="px-6 py-4 text-sm font-medium text-black">{s.chapter}</td>
                        <td className="px-6 py-4"><span className="text-xs bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full">{s.class}</span></td>
                        <td className="px-6 py-4 text-sm text-neutral-500">{s.subject}</td>
                        <td className="px-6 py-4 text-xs text-neutral-400">{s.uploadedAt ? new Date(s.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                        <td className="px-6 py-4 flex items-center gap-3">
                          <a href={s.fileUrl} target="_blank" rel="noreferrer" className="text-xs text-black underline">View</a>
                          <button onClick={() => handleDelete(s.id)} className="text-xs text-red-500 hover:text-red-700">Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}