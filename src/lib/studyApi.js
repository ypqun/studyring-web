import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'

// ───────── 스터디 ─────────

export function watchMyStudies(uid, callback) {
  const q = query(collection(db, 'studies'), where('memberIds', 'array-contains', uid))
  return onSnapshot(q, (snap) => {
    const studies = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
    studies.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
    callback(studies)
  })
}

export function watchStudy(studyId, callback) {
  return onSnapshot(doc(db, 'studies', studyId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export async function createStudy({ name, description, ownerId, ownerNickname }) {
  const inviteCode = generateInviteCode()
  const ref = await addDoc(collection(db, 'studies'), {
    name,
    description,
    ownerId,
    memberIds: [ownerId],
    members: [{ uid: ownerId, nickname: ownerNickname, joinedAt: new Date().toISOString() }],
    inviteCode,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateStudy(studyId, data) {
  await updateDoc(doc(db, 'studies', studyId), data)
}

export async function deleteStudy(studyId) {
  // 하위 컬렉션(목표/일정/출석)도 함께 삭제
  const subcols = ['goals', 'schedules', 'attendances']
  for (const col of subcols) {
    const snap = await getDocs(collection(db, 'studies', studyId, col))
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
  }
  await deleteDoc(doc(db, 'studies', studyId))
}

export async function getStudyByInviteCode(code) {
  const q = query(collection(db, 'studies'), where('inviteCode', '==', code))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() }
}

export async function joinStudy(studyId, uid, nickname) {
  const ref = doc(db, 'studies', studyId)
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error('존재하지 않는 스터디입니다.')
  const data = snap.data()
  if (data.memberIds?.includes(uid)) return // 이미 멤버
  await updateDoc(ref, {
    memberIds: arrayUnion(uid),
    members: arrayUnion({ uid, nickname, joinedAt: new Date().toISOString() }),
  })
}

function generateInviteCode() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 5)
}

// ───────── 목표 ─────────

export function watchGoals(studyId, callback) {
  const q = query(collection(db, 'studies', studyId, 'goals'), orderBy('deadline', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function addGoal(studyId, { title, deadline }) {
  await addDoc(collection(db, 'studies', studyId, 'goals'), {
    title,
    deadline,
    done: false,
    createdAt: serverTimestamp(),
  })
}

export async function updateGoal(studyId, goalId, data) {
  await updateDoc(doc(db, 'studies', studyId, 'goals', goalId), data)
}

export async function deleteGoal(studyId, goalId) {
  await deleteDoc(doc(db, 'studies', studyId, 'goals', goalId))
}

// ───────── 일정 ─────────

export function watchSchedules(studyId, callback) {
  const q = query(collection(db, 'studies', studyId, 'schedules'), orderBy('date', 'asc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function addSchedule(studyId, { title, date, time }) {
  await addDoc(collection(db, 'studies', studyId, 'schedules'), {
    title,
    date,
    time,
    createdAt: serverTimestamp(),
  })
}

export async function updateSchedule(studyId, scheduleId, data) {
  await updateDoc(doc(db, 'studies', studyId, 'schedules', scheduleId), data)
}

export async function deleteSchedule(studyId, scheduleId) {
  await deleteDoc(doc(db, 'studies', studyId, 'schedules', scheduleId))
}

// ───────── 출석 ─────────

export function watchAttendances(studyId, scheduleId, callback) {
  const q = query(
    collection(db, 'studies', studyId, 'schedules', scheduleId, 'attendances')
  )
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

export async function checkAttendance(studyId, scheduleId, uid, nickname) {
  await setDoc(doc(db, 'studies', studyId, 'schedules', scheduleId, 'attendances', uid), {
    uid,
    nickname,
    checkedAt: serverTimestamp(),
  })
}

export async function cancelAttendance(studyId, scheduleId, uid) {
  await deleteDoc(doc(db, 'studies', studyId, 'schedules', scheduleId, 'attendances', uid))
}

export async function getAllAttendancesForStudy(studyId, scheduleIds) {
  const results = {}
  for (const sid of scheduleIds) {
    const snap = await getDocs(
      collection(db, 'studies', studyId, 'schedules', sid, 'attendances')
    )
    results[sid] = snap.docs.map((d) => d.id)
  }
  return results
}
