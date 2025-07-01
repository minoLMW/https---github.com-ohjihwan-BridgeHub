/**
 * RTC 서버 연결 테스트
 */
import { io } from 'socket.io-client'

const SERVER_URL = 'http://localhost:7600'
const TEST_TOKEN = 'development-token'

console.log('🧪 RTC 서버 연결 테스트 시작...')

const socket = io(SERVER_URL, {
  auth: { token: TEST_TOKEN },
  transports: ['websocket', 'polling']
})

socket.on('connect', () => {
  console.log('✅ 서버 연결 성공!')
  console.log('📡 소켓 ID:', socket.id)
  
  // Router RTP Capabilities 테스트
  socket.emit('getRouterRtpCapabilities', (response) => {
    if (response.error) {
      console.error('❌ RTP Capabilities 오류:', response.error)
    } else {
      console.log('✅ RTP Capabilities 수신 성공')
      console.log('📊 지원 코덱 수:', response.routerRtpCapabilities.codecs.length)
    }
    
    // 테스트 완료
    socket.disconnect()
    console.log('🏁 테스트 완료')
  })
})

socket.on('connect_error', (error) => {
  console.error('❌ 연결 실패:', error.message)
})

socket.on('disconnect', () => {
  console.log('👋 연결 해제')
})
