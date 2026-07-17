import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  collection, addDoc, query, where, orderBy, limit, getDocs, doc, getDoc, setDoc,
} from 'firebase/firestore'
import { MessageSquareText, UserPlus, Check, Send } from 'lucide-react'
import { db } from '../../firebase/config'
import { useDashboard } from '../../context/DashboardContext'

export default function CommunityPage() {
  const { user, dark, text, surface } = useDashboard()
  const [params, setParams] = useSearchParams()
  const tab = params.get('tab') || 'feed'
  const composeOpen = params.get('compose') === 'true'

  const cardC = dark ? 'bg-neutral-900 border-white/[0.06]' : 'bg-white border-black/[0.04]'

  const [text_, setText_] = useState('')
  const [posting, setPosting] = useState(false)
  const [doubts, setDoubts] = useState([])
  const [loadingFeed, setLoadingFeed] = useState(true)
  const [people, setPeople] = useState([])
  const [following, setFollowing] = useState({})
  const [followerCount, setFollowerCount] = useState(0)
  const [followingCount, setFollowingCount] = useState(0)

  useEffect(() => { if (tab === 'feed') fetchFeed() }, [tab])
  useEffect(() => { if (tab === 'feed') fetchPeople() }, [tab, user])
  useEffect(() => { if (tab === 'profile') fetchCounts() }, [tab, user])

  const fetchFeed = async () => {
    setLoadingFeed(true)
    try {
      const q = query(
        collection(db, 'doubts'),
        where('visibility', '==', 'public'),
        orderBy('timestamp', 'desc'),
        limit(30)
      )
      const snap = await getDocs(q)
      setDoubts(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error(err)
      // First run: Firestore will throw a "needs an index" error with a console link — click it once, wait ~1 min, retry.
    } finally { setLoadingFeed(false) }
  }

  const fetchPeople = async () => {
    if (!user) return
    try {
      const snap = await getDocs(query(collection(db, 'users'), limit(12)))
      const list = snap.docs.map(d => ({ uid: d.id, ...d.data() })).filter(p => p.uid !== user.uid).slice(0, 6)
      setPeople(list)
      const followMap = {}
      await Promise.all(list.map(async p => {
        const f = await getDoc(doc(db, 'users', user.uid, 'following', p.uid))
        followMap[p.uid] = f.exists()
      }))
      setFollowing(followMap)
    } catch (err) { console.error(err) }
  }

  const fetchCounts = async () => {
    if (!user) return
    try {
      const [fSnap, gSnap] = await Promise.all([
        getDocs(collection(db, 'users', user.uid, 'followers')),
        getDocs(collection(db, 'users', user.uid, 'following')),
      ])
      setFollowerCount(fSnap.size)
      setFollowingCount(gSnap.size)
    } catch (err) { console.error(err) }
  }

  const handleFollow = async (p) => {
    if (!user) return
    try {
      await setDoc(doc(db, 'users', user.uid, 'following', p.uid), {
        uid: p.uid, name: p.displayName || p.name, photo: p.photoURL || p.photo, followedAt: new Date().toISOString(),
      })
      await setDoc(doc(db, 'users', p.uid, 'followers', user.uid), {
        uid: user.uid, name: user.displayName, photo: user.photoURL, followedAt: new Date().toISOString(),
      })
      setFollowing(prev => ({ ...prev, [p.uid]: true }))
    } catch (err) { console.error(err) }
  }

  const handlePost = async () => {
    if (!user || !text_.trim()) return
    setPosting(true)
    try {
      await addDoc(collection(db, 'doubts'), {
        userId: user.uid, userName: user.displayName, userPhoto: user.photoURL,
        text: text_.trim(), visibility: 'public', timestamp: new Date().toISOString(),
      })
      setText_('')
      setParams({})
      fetchFeed()
    } catch (err) { console.error(err) }
    finally { setPosting(false) }
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <div className="flex gap-2 mb-8">
        {['feed', 'chat', 'profile'].map(t => (
          <button key={t} onClick={() => setParams({ tab: t })}
            className={`px-4 py-2 rounded-full text-[13px] font-medium capitalize transition-all ${
              tab === t ? (dark ? 'bg-white text-black' : 'bg-black text-white') : (dark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-500 hover:bg-black/[0.03]')
            }`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className={`border shadow-sm rounded-2xl p-5 ${cardC}`}>
              <textarea
                value={text_} onChange={e => setText_(e.target.value)}
                autoFocus={composeOpen}
                placeholder="Share a doubt with the community — everyone can see this for now."
                className={`w-full bg-transparent border-0 outline-none resize-none text-[13px] placeholder-neutral-400 ${text}`}
                rows={3}
              />
              <div className="flex justify-end">
                <button onClick={handlePost} disabled={posting || !text_.trim()}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-medium disabled:opacity-40 transition-colors ${dark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                  <Send size={12} strokeWidth={2} /> Post
                </button>
              </div>
            </div>

            {loadingFeed && <div className="text-center py-12"><div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin mx-auto ${dark ? 'border-white' : 'border-black'}`} /></div>}
            {!loadingFeed && doubts.length === 0 && (
              <div className={`text-center py-16 border shadow-sm rounded-2xl ${cardC}`}>
                <MessageSquareText size={20} strokeWidth={1.5} className="mx-auto mb-2 text-neutral-400" />
                <p className="text-[13px] text-neutral-400">No doubts posted yet — be the first.</p>
              </div>
            )}
            {doubts.map(d => (
              <motion.div key={d.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className={`border shadow-sm rounded-2xl p-5 ${cardC}`}>
                <div className="flex items-center gap-2.5 mb-3">
                  <img src={d.userPhoto} className="w-7 h-7 rounded-full" />
                  <div>
                    <p className={`text-[12px] font-medium ${text}`}>{d.userName}</p>
                    <p className="text-[10px] text-neutral-400">{new Date(d.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <p className={`text-[13px] ${text}`}>{d.text}</p>
              </motion.div>
            ))}
          </div>

          <div className="space-y-4">
            <div className={`border shadow-sm rounded-2xl p-5 ${cardC}`}>
              <p className="text-[11px] font-semibold tracking-widest uppercase text-neutral-400 mb-4">People</p>
              <div className="space-y-3">
                {people.length === 0 && <p className="text-[12px] text-neutral-400">No one else here yet.</p>}
                {people.map(p => (
                  <div key={p.uid} className="flex items-center gap-2.5">
                    <img src={p.photoURL || p.photo} className="w-8 h-8 rounded-full shrink-0" />
                    <p className={`text-[12px] font-medium flex-1 truncate ${text}`}>{p.displayName || p.name}</p>
                    <button onClick={() => handleFollow(p)} disabled={following[p.uid]}
                      className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${following[p.uid] ? 'text-green-500' : dark ? 'text-neutral-400 hover:bg-white/5' : 'text-neutral-400 hover:bg-black/[0.03]'}`}>
                      {following[p.uid] ? <Check size={13} /> : <UserPlus size={13} />}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'chat' && (
        <div className={`border shadow-sm rounded-2xl p-10 text-center ${cardC}`}>
          <MessageSquareText size={20} strokeWidth={1.5} className="mx-auto mb-3 text-neutral-400" />
          <p className={`text-[13px] font-medium mb-1 ${text}`}>Direct messages are next</p>
          <p className="text-[12px] text-neutral-400">Chat unlocks between people who follow each other back — building this right after profiles.</p>
        </div>
      )}

      {tab === 'profile' && (
        <div className={`border shadow-sm rounded-2xl p-8 max-w-md ${cardC}`}>
          <div className="flex items-center gap-4 mb-6">
            <img src={user?.photoURL} className="w-14 h-14 rounded-full" />
            <div>
              <p className={`text-[15px] font-semibold ${text}`}>{user?.displayName}</p>
              <p className="text-[12px] text-neutral-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-6">
            <div>
              <p className={`text-[18px] font-semibold ${text}`}>{followerCount}</p>
              <p className="text-[11px] text-neutral-400">Followers</p>
            </div>
            <div>
              <p className={`text-[18px] font-semibold ${text}`}>{followingCount}</p>
              <p className="text-[11px] text-neutral-400">Following</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
