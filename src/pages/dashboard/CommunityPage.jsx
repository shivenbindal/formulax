import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import {
  MessageSquareText,
  Check,
  Send,
  Users,
  Zap,
  Edit,
  LogOut,
  MessageCircle,
  Heart,
  Share2,
  UserPlus,
} from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function CommunityPage() {
  const { user, dark, text, bg, handleLogout } = useDashboard()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'feed'
  const composeOpen = params.get('compose') === 'true'

  const [text_, setText_] = useState('')
  const [posting, setPosting] = useState(false)
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [people, setPeople] = useState([])
  const [following, setFollowing] = useState({})
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)
  const [userProfile, setUserProfile] = useState(null)
  const [bio, setBio] = useState('')
  const [editingBio, setEditingBio] = useState(false)

  useEffect(() => {
    if (tab === 'feed') fetchFeed()
    if (tab === 'feed') fetchPeople()
    if (tab === 'profile') fetchProfile()
  }, [tab, user])

  const fetchFeed = async () => {
    setLoading(true)
    try {
      const q = query(
        collection(db, 'doubts'),
        where('visibility', '==', 'public'),
        orderBy('timestamp', 'desc'),
        limit(30)
      )
      const snap = await getDocs(q)
      setDoubts(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPeople = async () => {
    if (!user) return
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(20)))
      const list = snap.docs
        .map((d) => ({ uid: d.id, ...d.data() }))
        .filter((p) => p.uid !== user.uid)
        .slice(0, 8)
      setPeople(list)
      const followMap = {}
      await Promise.all(
        list.map(async (p) => {
          const f = await getDoc(doc(db, 'users', user.uid, 'following', p.uid))
          followMap[p.uid] = f.exists()
        })
      )
      setFollowing(followMap)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchProfile = async () => {
    if (!user) return
    try {
      const userSnap = await getDoc(doc(db, 'users', user.uid))
      if (userSnap.exists()) {
        setUserProfile(userSnap.data())
        setBio(userSnap.data().bio || '')
      }
      const [fSnap, gSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'followers')),
        getDocs(collection(db, 'users', user.uid, 'following')),
      ])
      setFollowerCount(fSnap.size)
      setFollowingCount(gSnap.size)
    } catch (err) {
      console.error(err)
    }
  }

  const handleFollow = async (p) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid, 'following', p.uid), {
        uid: p.uid,
        name: p.name,
        photo: p.photo,
        followedAt: new Date().toISOString(),
      })
      await setDoc(doc(db, 'users', p.uid, 'followers', user.uid), {
        uid: user.uid,
        name: user.displayName,
        photo: user.photoURL,
        followedAt: new Date().toISOString(),
      })
      setFollowing((prev) => ({ ...prev, [p.uid]: true }))
    } catch (err) {
      console.error(err)
    }
  }

  const handlePost = async () => {
    if (!user || !text_.trim()) return
    setPosting(true)
    try {
      await addDoc(collection(db, 'doubts'), {
        userId: user.uid,
        userName: user.displayName,
        userPhoto: user.photoURL,
        username: user.username || 'user',
        text: text_.trim(),
        visibility: 'public',
        timestamp: new Date().toISOString(),
        likes: 0,
        replies: 0,
      })
      setText_('')
      setParams({})
      fetchFeed()
    } catch (err) {
      console.error(err)
    } finally {
      setPosting(false)
    }
  }

  const updateBio = async () => {
    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid), { bio }, { merge: true })
      setEditingBio(false)
    } catch (err) {
      console.error(err)
    }
  }

  const bgGradient = dark ? 'from-neutral-950 via-neutral-900 to-neutral-950' : 'from-blue-50 via-white to-purple-50'

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgGradient}`}>
      {/* Header */}
      <div className="sticky top-0 z-40 border-b" style={{ borderColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>
        <div className={`backdrop-blur-xl ${dark ? 'bg-neutral-950/80' : 'bg-white/80'}`}>
          <div className="p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center gap-3 mb-4">
                <Users size={24} className={dark ? 'text-green-400' : 'text-green-600'} />
                <span className={`text-xs font-semibold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  Community
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-2">
                {[
                  { id: 'feed', label: 'Feed', icon: MessageSquareText },
                  { id: 'people', label: 'People', icon: Users },
                  { id: 'profile', label: 'Profile', icon: Edit },
                ].map(({ id, label, icon: Icon }) => (
                  <motion.button
                    key={id}
                    onClick={() => setParams({ tab: id })}
                    className={`px-6 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 transition-all ${
                      tab === id
                        ? dark
                          ? 'bg-white text-black'
                          : 'bg-black text-white'
                        : dark
                          ? 'text-neutral-400 hover:bg-white/5'
                          : 'text-neutral-600 hover:bg-black/5'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* FEED TAB */}
          {tab === 'feed' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Feed */}
              <div className="lg:col-span-2 space-y-4">
                {/* Compose */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-2xl border overflow-hidden shadow-lg ${
                    dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                  } backdrop-blur-sm`}
                >
                  <div className="p-6">
                    <textarea
                      value={text_}
                      onChange={(e) => setText_(e.target.value)}
                      autoFocus={composeOpen}
                      placeholder="Share your doubt or solution with the community..."
                      className={`w-full bg-transparent border-0 outline-none resize-none text-sm font-medium placeholder-neutral-400 ${text}`}
                      rows={3}
                    />
                    <div className="flex justify-end mt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePost}
                        disabled={posting || !text_.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold hover:shadow-lg transition-all disabled:opacity-40"
                      >
                        <Send size={16} />
                        Post
                      </motion.button>
                    </div>
                  </div>
                </motion.div>

                {/* Feed Items */}
                {loading && (
                  <motion.div className="flex justify-center py-12">
                    <div className="w-8 h-8 border-3 border-green-400 border-t-transparent rounded-full animate-spin" />
                  </motion.div>
                )}

                {!loading && doubts.length === 0 && (
                  <motion.div
                    className={`rounded-2xl border text-center py-16 ${
                      dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                    } backdrop-blur-sm`}
                  >
                    <MessageSquareText size={40} className={`mx-auto mb-3 ${dark ? 'text-neutral-700' : 'text-neutral-300'}`} />
                    <p className={`text-lg font-semibold ${text}`}>No posts yet</p>
                  </motion.div>
                )}

                {!loading &&
                  doubts.map((d, i) => (
                    <motion.div
                      key={d.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`rounded-2xl border overflow-hidden shadow-lg ${
                        dark ? 'bg-neutral-900/50 border-white/10 hover:border-green-400/30' : 'bg-white/80 border-white/40 hover:border-green-300'
                      } backdrop-blur-sm transition-all`}
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-4">
                          <img src={d.userPhoto} alt="User" className="w-10 h-10 rounded-full ring-2" style={{ ringColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                          <div>
                            <p className={`font-semibold ${text}`}>{d.userName}</p>
                            <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>
                              @{d.username}
                            </p>
                          </div>
                          <div className={`ml-auto text-xs ${dark ? 'text-neutral-500' : 'text-neutral-500'}`}>
                            {new Date(d.timestamp).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </div>
                        </div>

                        {/* Content */}
                        <p className={`text-sm leading-relaxed mb-4 ${text}`}>{d.text}</p>

                        {/* Actions */}
                        <div className="flex items-center gap-6 pt-4 border-t" style={{ borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                              dark ? 'text-neutral-400 hover:text-red-400' : 'text-neutral-600 hover:text-red-600'
                            }`}
                          >
                            <Heart size={16} /> {d.likes || 0}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                              dark ? 'text-neutral-400 hover:text-blue-400' : 'text-neutral-600 hover:text-blue-600'
                            }`}
                          >
                            <MessageCircle size={16} /> {d.replies || 0}
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                              dark ? 'text-neutral-400 hover:text-green-400' : 'text-neutral-600 hover:text-green-600'
                            }`}
                          >
                            <Share2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
              </div>

              {/* Sidebar - People */}
              <div className={`rounded-2xl border overflow-hidden shadow-lg ${
                dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
              } backdrop-blur-sm h-fit`}>
                <div className={`p-6 border-b ${dark ? 'border-white/10 bg-gradient-to-r from-blue-900/20 to-purple-900/20' : 'border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50'}`}>
                  <h3 className={`font-bold flex items-center gap-2 ${text}`}>
                    <Users size={18} />
                    Discover People
                  </h3>
                </div>
                <div className="p-6 space-y-4">
                  {people.length === 0 ? (
                    <p className={`text-sm ${dark ? 'text-neutral-500' : 'text-neutral-500'}`}>No users found</p>
                  ) : (
                    people.map((p) => (
                      <motion.div key={p.uid} className="flex items-center gap-3">
                        <img src={p.photo} alt={p.name} className="w-9 h-9 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${text}`}>{p.name}</p>
                          <p className={`text-xs truncate ${dark ? 'text-neutral-500' : 'text-neutral-600'}`}>@{p.username}</p>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleFollow(p)}
                          disabled={following[p.uid]}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                            following[p.uid]
                              ? dark
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-green-100 text-green-600'
                              : dark
                                ? 'bg-white/10 text-white hover:bg-white/20'
                                : 'bg-black/10 text-black hover:bg-black/20'
                          }`}
                        >
                          {following[p.uid] ? <Check size={14} /> : <UserPlus size={14} />}
                        </motion.button>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PEOPLE TAB */}
          {tab === 'people' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {people.map((p) => (
                <motion.div
                  key={p.uid}
                  whileHover={{ y: -4 }}
                  className={`rounded-2xl border overflow-hidden shadow-lg text-center p-6 ${
                    dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                  } backdrop-blur-sm`}
                >
                  <img src={p.photo} alt={p.name} className="w-16 h-16 rounded-full mx-auto mb-3 ring-2" />
                  <p className={`font-semibold ${text}`}>{p.name}</p>
                  <p className={`text-xs mb-4 ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>@{p.username}</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    onClick={() => handleFollow(p)}
                    disabled={following[p.uid]}
                    className={`w-full px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                      following[p.uid]
                        ? dark
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-green-100 text-green-600'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-lg'
                    }`}
                  >
                    {following[p.uid] ? 'Following' : 'Follow'}
                  </motion.button>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* PROFILE TAB */}
          {tab === 'profile' && userProfile && (
            <div className="max-w-md mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-2xl border overflow-hidden shadow-lg ${
                  dark ? 'bg-neutral-900/50 border-white/10' : 'bg-white/80 border-white/40'
                } backdrop-blur-sm`}
              >
                {/* Header BG */}
                <div className={`h-24 bg-gradient-to-r from-blue-500 to-purple-500`} />

                {/* Content */}
                <div className="px-6 py-8 text-center -mt-8 relative">
                  <img
                    src={user?.photoURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full mx-auto mb-4 ring-4 border-4"
                    style={{
                      borderColor: dark ? 'rgb(20, 20, 20)' : 'white',
                    }}
                  />

                  <p className={`text-2xl font-bold mb-1 ${text}`}>{user?.displayName}</p>
                  <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>@{userProfile.username}</p>

                  {/* Bio */}
                  <div className={`my-6 p-4 rounded-xl ${dark ? 'bg-white/5' : 'bg-black/5'}`}>
                    {editingBio ? (
                      <div className="space-y-3">
                        <textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Add your bio..."
                          className={`w-full border rounded-lg p-2 text-sm resize-none ${
                            dark ? 'bg-neutral-950 border-white/10 text-white' : 'bg-white border-neutral-300'
                          }`}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingBio(false)}
                            className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                              dark ? 'bg-neutral-800 text-white hover:bg-neutral-700' : 'bg-neutral-200 text-black hover:bg-neutral-300'
                            }`}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={updateBio}
                            className="flex-1 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-semibold hover:shadow-lg transition-all"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className={`text-sm ${text} mb-3`}>{bio || 'No bio yet'}</p>
                        <button
                          onClick={() => setEditingBio(true)}
                          className={`text-xs font-semibold flex items-center justify-center gap-1 mx-auto ${
                            dark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                          }`}
                        >
                          <Edit size={14} />
                          Edit Bio
                        </button>
                      </>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className={`p-4 rounded-xl ${dark ? 'bg-blue-500/10' : 'bg-blue-100'}`}>
                      <p className={`text-2xl font-bold ${text}`}>{followerCount}</p>
                      <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>Followers</p>
                    </div>
                    <div className={`p-4 rounded-xl ${dark ? 'bg-purple-500/10' : 'bg-purple-100'}`}>
                      <p className={`text-2xl font-bold ${text}`}>{followingCount}</p>
                      <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-600'}`}>Following</p>
                    </div>
                  </div>

                  {/* Logout */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-full px-4 py-3 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </motion.button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
