"use client"

import { useState } from "react"
import { boardClient } from "@js/common-ui"

export default function DebugAPI() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    setResult("")

    try {
      const token = localStorage.getItem("token")
      console.log("🔑 토큰:", token ? "있음" : "없음")
      console.log("🔑 토큰 내용:", token?.substring(0, 50) + "...")

      // 1. 기본 요청 테스트
      console.log("📡 기본 요청 테스트 시작...")
      const response = await boardClient.get("", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      })

      console.log("✅ 응답 성공:", response)
      setResult(`성공: ${JSON.stringify(response.data, null, 2)}`)
    } catch (error) {
      console.error("❌ 에러 발생:", error)
      console.error("📋 에러 응답:", error.response?.data)
      console.error("📋 에러 상태:", error.response?.status)
      console.error("📋 에러 헤더:", error.response?.headers)

      setResult(`에러: ${error.message}
상태 코드: ${error.response?.status}
응답 데이터: ${JSON.stringify(error.response?.data, null, 2)}`)
    } finally {
      setLoading(false)
    }
  }

  const testDifferentEndpoints = async () => {
    const endpoints = ["/api/board", "/api/posts", "/api/board/list"]
    const token = localStorage.getItem("token")

    for (const endpoint of endpoints) {
      try {
        console.log(`🧪 테스트 중: ${endpoint}`)
        const response = await fetch(`http://localhost:7100${endpoint}?categoryId=1`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        console.log(`✅ ${endpoint}: ${response.status}`)
      } catch (error) {
        console.log(`❌ ${endpoint}: ${error.message}`)
      }
    }
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>API 디버깅 도구</h2>
      <button onClick={testAPI} disabled={loading}>
        {loading ? "테스트 중..." : "API 테스트"}
      </button>
      <button onClick={testDifferentEndpoints} style={{ marginLeft: "10px" }}>
        다양한 엔드포인트 테스트
      </button>

      <pre
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f0f0f0",
          whiteSpace: "pre-wrap",
          maxHeight: "400px",
          overflow: "auto",
        }}
      >
        {result || "테스트 결과가 여기에 표시됩니다"}
      </pre>

      <div style={{ marginTop: "20px" }}>
        <h3>체크리스트:</h3>
        <ul>
          <li>✅ 백엔드 서버가 7100 포트에서 실행 중인가?</li>
          <li>❓ 백엔드 콘솔에 에러 로그가 있는가?</li>
          <li>❓ Postman에서 같은 요청이 성공하는가?</li>
          <li>❓ JWT 토큰이 유효한가?</li>
        </ul>
      </div>
    </div>
  )
}
