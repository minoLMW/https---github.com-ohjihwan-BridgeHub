"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createPost } from "@js/common-ui" // import 추가

export default function BoardWrite() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [message, setMessage] = useState("")
  const [image, setImage] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    if (!title || !content) {
      setMessage("제목과 내용을 모두 입력하세요 💡")
      return
    }

    setMessage("등록 중...") // 로딩 메시지

    try {
      // 이미지가 있는 경우 FormData 사용
      if (image) {
        const formData = new FormData()
        const post = { title, content }
        const blob = new Blob([JSON.stringify(post)], { type: "application/json" })
        formData.append("post", blob)
        formData.append("image", image)

        // boardClient 사용 (common-ui.jsx와 일치)
        const token = localStorage.getItem("token")
        const response = await fetch("/api/board", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("서버 응답 오류")
        }
      } else {
        // 이미지가 없는 경우 JSON으로 전송
        await createPost({ title, content })
      }

      setMessage("글이 성공적으로 등록되었습니다! 🎉")
      setTimeout(() => navigate("/board"), 1000)
    } catch (error) {
      console.error("글쓰기 에러:", error)
      setMessage("글쓰기 실패 😵‍💫")
    }
  }

  return (
    <div>
      <h2>글쓰기</h2>
      <p>
        제목:
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginLeft: "10px", width: "300px" }}
        />
      </p>
      <p>
        내용:
        <br />
        <textarea
          rows="8"
          cols="50"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          style={{ marginTop: "5px" }}
        />
      </p>
      <p>
        이미지 첨부:
        <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      </p>
      <button onClick={handleSubmit}>등록</button>
      <button onClick={() => navigate("/board")} style={{ marginLeft: "10px" }}>
        취소
      </button>
      <p style={{ color: message.includes("실패") ? "red" : "green" }}>{message}</p>
    </div>
  )
}
