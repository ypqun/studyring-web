// Firebase Auth는 이메일 형식을 요구하므로, "아이디"를 내부적으로 가짜 이메일로 변환한다.
const EMAIL_DOMAIN = 'studyring.local'

export function idToEmail(id) {
  return `${id.trim().toLowerCase()}@${EMAIL_DOMAIN}`
}
