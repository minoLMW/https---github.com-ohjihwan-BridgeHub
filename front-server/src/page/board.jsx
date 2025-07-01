"use client"

import { useState, useEffect, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import Header from "@common/Header"
import ListSearch from "@components/ListSearch"

function Board() {
  const studyInfo = location.state?.studyRoom || location.state
  const [showSearch, setShowSearch] = useState(false)
  const [posts, setPosts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("")
  const [searchKeyword, setSearchKeyword] = useState("")
  const [sortType, setSortType] = useState("recent")
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  const [loadingContent, setLoadingContent] = useState(new Set())
  const navigate = useNavigate()

  // 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/board/categories", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        })
        if (response.ok) {
          const result = await response.json()
          if (result.success && Array.isArray(result.data)) {
            setCategories(result.data)
          }
        }
      } catch (error) {
        console.error("카테고리 조회 에러:", error)
      }
    }
    fetchCategories()
  }, [])

  // 개별 게시글의 content 가져오기
  const fetchPostContent = async (boardId) => {
    if (loadingContent.has(boardId)) return null

    setLoadingContent((prev) => new Set([...prev, boardId]))

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/board/${boardId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          console.log(`📋 게시글 ${boardId} content 가져옴:`, result.data.content)
          return result.data.content
        }
      }
    } catch (error) {
      console.error(`게시글 ${boardId} content 조회 에러:`, error)
    } finally {
      setLoadingContent((prev) => {
        const newSet = new Set(prev)
        newSet.delete(boardId)
        return newSet
      })
    }

    return null
  }

  // 게시글 목록 가져오기
  const fetchPosts = async (page = 0, reset = false) => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const params = new URLSearchParams({
        page: page.toString(),
        size: "10",
        sort: sortType,
      })
      if (selectedCategory) {
        params.append("categoryId", selectedCategory.toString())
      }
      if (searchKeyword.trim()) {
        params.append("search", searchKeyword.trim())
      }
      const url = `/api/board?${params.toString()}`

      const response = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          const newPosts = result.data.boards || []
          console.log("📋 게시글 목록 가져옴:", newPosts.length, "개")

          // 각 게시글의 content를 개별적으로 가져오기
          const postsWithContent = await Promise.all(
            newPosts.map(async (post) => {
              const content = await fetchPostContent(post.boardId)
              return {
                ...post,
                content: content || "내용을 불러오는 중...",
              }
            }),
          )

          if (reset) {
            setPosts(postsWithContent)
          } else {
            setPosts((prev) => [...prev, ...postsWithContent])
          }
          setTotalPages(result.data.totalPages || 0)
          setCurrentPage(result.data.currentPage || 0)
          setTotalElements(result.data.totalElements || 0)

          console.log(`✅ 게시글 ${postsWithContent.length}개 로드 완료 (content 포함)`)
        }
      } else {
        console.error("❌ API 응답 실패:", response.status)
      }
    } catch (error) {
      console.error("❌ 게시글 조회 에러:", error)
    } finally {
      setLoading(false)
    }
  }

  // 게시글 상세 조회
  const fetchPostDetail = async (boardId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/board/${boardId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        credentials: "include",
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setSelectedPost(result.data)
          setShowDetail(true)
        }
      }
    } catch (error) {
      console.error("게시글 상세 조회 에러:", error)
    }
  }

  // 좋아요 토글
  const toggleLike = async (boardId) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("로그인이 필요합니다.")
        return
      }
      const response = await fetch(`/api/board/${boardId}/like`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      })
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setPosts((prev) =>
            prev.map((post) =>
              post.boardId === boardId
                ? { ...post, isLiked: result.data.liked, likeCount: result.data.likeCount }
                : post,
            ),
          )
          if (selectedPost && selectedPost.boardId === boardId) {
            setSelectedPost((prev) => ({
              ...prev,
              isLiked: result.data.liked,
              likeCount: result.data.likeCount,
            }))
          }
        }
      }
    } catch (error) {
      console.error("좋아요 처리 실패:", error)
    }
  }

  // useMemo로 필터링된 게시글 목록 계산
  const filteredPosts = useMemo(() => {
    if (!searchKeyword.trim()) return posts
    return posts.filter((post) => {
      const searchLower = searchKeyword.toLowerCase()
      return (
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.authorNickname?.toLowerCase().includes(searchLower) ||
        post.categoryName?.toLowerCase().includes(searchLower)
      )
    })
  }, [posts, searchKeyword])

  // useMemo로 카테고리 옵션 계산
  const categoryOptions = useMemo(() => {
    return categories.map((category) => ({
      value: category.categoryId,
      label: category.categoryName,
    }))
  }, [categories])

  // useMemo로 검색 결과 메시지 계산
  const searchResultMessage = useMemo(() => {
    if (!searchKeyword.trim()) {
      return posts.length === 0 ? "게시글이 없습니다." : null
    }
    if (filteredPosts.length === 0) {
      return `"${searchKeyword}"에 대한 검색 결과가 없습니다.`
    }
    return `"${searchKeyword}" 검색 결과 ${filteredPosts.length}개`
  }, [searchKeyword, posts.length, filteredPosts.length])

  // useMemo로 페이지네이션 정보 계산
  const paginationInfo = useMemo(() => {
    return {
      hasMore: currentPage + 1 < totalPages,
      currentCount: posts.length,
      totalCount: totalElements,
      currentPageDisplay: currentPage + 1,
      totalPagesDisplay: totalPages,
    }
  }, [currentPage, totalPages, posts.length, totalElements])

  // useMemo로 게시글 표시 목록 계산 (검색어 하이라이팅 포함)
  const displayPosts = useMemo(() => {
    return filteredPosts.map((post) => {
      // 내용 미리보기 생성 (150자로 제한)
      const getPreview = (content, maxLength = 150) => {
        if (!content || content.trim() === "" || content === "내용을 불러오는 중...") {
          return content || "내용이 없습니다."
        }
        const cleanContent = content.replace(/\n/g, " ").trim()
        if (cleanContent.length <= maxLength) return cleanContent
        return cleanContent.substring(0, maxLength) + "..."
      }

      const preview = getPreview(post.content)

      // 검색어 하이라이팅을 위한 처리
      const highlightText = (text, keyword) => {
        if (!text || !keyword) return text
        const regex = new RegExp(`(${keyword})`, "gi")
        return text.replace(regex, `<mark>$1</mark>`)
      }

      // 모든 경우에 대해 속성 설정
      return {
        ...post,
        contentPreview: preview,
        highlightedTitle: searchKeyword.trim() ? highlightText(post.title, searchKeyword) : post.title,
        highlightedContent: searchKeyword.trim() ? highlightText(preview, searchKeyword) : preview,
        highlightedAuthor: searchKeyword.trim()
          ? highlightText(post.authorNickname, searchKeyword)
          : post.authorNickname,
      }
    })
  }, [filteredPosts, searchKeyword])

  // 초기 로드 및 필터 변경 시 게시글 가져오기
  useEffect(() => {
    fetchPosts(0, true)
  }, [selectedCategory, sortType])

  // 더 보기
  const loadMore = () => {
    if (paginationInfo.hasMore && !loading) {
      fetchPosts(currentPage + 1, false)
    }
  }

  return (
    <>
      <Header showSearch={true} title="게시판" onSearch={() => setShowSearch(true)} />
      <div className="board-list">
        {showSearch && (
          <ListSearch value={searchKeyword} onChange={(e) => setSearchKeyword(e.target.value)} onClose={() => setShowSearch(false)}/>
        )}

        <div className="board-list__content">
          {displayPosts.length > 0 ? (
            <>
              {displayPosts.map((post) => (
                <div
                  key={post.boardId}
                  className="board-list__item"
                  onClick={() => fetchPostDetail(post.boardId)}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    padding: "20px",
                    marginBottom: "16px",
                    cursor: "pointer",
                    backgroundColor: post.isNotice ? "#fff3cd" : "white",
                    transition: "all 0.2s ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)"
                    e.target.style.transform = "translateY(-2px)"
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)"
                    e.target.style.transform = "translateY(0)"
                  }}
                >
                  {/* 헤더 영역 */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                    {post.isNotice && (
                      <span
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        공지
                      </span>
                    )}
                    {post.categoryName && (
                      <span
                        style={{
                          color: "#6c757d",
                          fontSize: "14px",
                          backgroundColor: "#f8f9fa",
                          padding: "2px 6px",
                          borderRadius: "3px",
                        }}
                      >
                        [{post.categoryName}]
                      </span>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3
                    className="board-list__title"
                    style={{
                      margin: "0 0 12px 0",
                      fontSize: "18px",
                      fontWeight: "600",
                      lineHeight: "1.4",
                      color: "#333",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post.highlightedTitle || post.title,
                    }}
                  />

                  {/* 내용 미리보기 */}
                  <div
                    style={{
                      color: post.contentPreview === "내용을 불러오는 중..." ? "#999" : "#666",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      marginBottom: "16px",
                      minHeight: "40px",
                      fontStyle: post.contentPreview === "내용을 불러오는 중..." ? "italic" : "normal",
                    }}
                    dangerouslySetInnerHTML={{
                      __html: post.highlightedContent || post.contentPreview,
                    }}
                  />

                  {/* 메타 정보 */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderTop: "1px solid #f0f0f0",
                      paddingTop: "12px",
                    }}
                  >
                    {/* 작성자 및 시간 */}
                    <div style={{ color: "#6c757d", fontSize: "13px" }}>
                      <span
                        dangerouslySetInnerHTML={{
                          __html: post.highlightedAuthor || post.authorNickname,
                        }}
                      />
                      <span style={{ margin: "0 8px" }}>•</span>
                      <span>{new Date(post.createdAt).toLocaleString()}</span>
                    </div>

                    {/* 상호작용 정보 */}
                    <div style={{ display: "flex", gap: "16px", fontSize: "13px", color: "#6c757d" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>👁 {post.viewCount}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLike(post.boardId)
                        }}
                        style={{
                          cursor: "pointer",
                          color: post.isLiked ? "#dc3545" : "#6c757d",
                          fontWeight: post.isLiked ? "bold" : "normal",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                          transition: "color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          if (!post.isLiked) e.target.style.color = "#dc3545"
                        }}
                        onMouseLeave={(e) => {
                          if (!post.isLiked) e.target.style.color = "#6c757d"
                        }}
                      >
                        ❤ {post.likeCount}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>💬 {post.commentCount}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* 더 보기 버튼 */}
              {paginationInfo.hasMore && (
                <div style={{ textAlign: "center", marginTop: "20px" }}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: loading ? "#6c757d" : "#28a745",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: loading ? "not-allowed" : "pointer",
                      fontSize: "14px",
                      fontWeight: "500",
                      transition: "background-color 0.2s",
                    }}
                  >
                    {loading ? "로딩 중..." : `더 보기 (${paginationInfo.currentCount}/${paginationInfo.totalCount})`}
                  </button>
                </div>
              )}
            </>
          ) : (
            !loading && (
              <div
                style={{
                  textAlign: "center",
                  color: "#6c757d",
                  padding: "60px 20px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "8px",
                  margin: "20px 0",
                }}
              >
                {searchResultMessage}
              </div>
            )
          )}
        </div>

        <button
          onClick={() => navigate("/board/write")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            marginTop: "20px",
            fontSize: "14px",
            fontWeight: "500",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
        >
          글쓰기
        </button>

        {/* 게시글 상세보기 모달 */}
        {showDetail && selectedPost && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={() => setShowDetail(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "8px",
                padding: "24px",
                maxWidth: "600px",
                maxHeight: "80vh",
                overflow: "auto",
                margin: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    {selectedPost.isNotice && (
                      <span
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                        }}
                      >
                        공지
                      </span>
                    )}
                    {selectedPost.categoryName && (
                      <span style={{ color: "#6c757d", fontSize: "14px" }}>[{selectedPost.categoryName}]</span>
                    )}
                  </div>
                  <h2 style={{ margin: "0 0 8px 0" }}>{selectedPost.title}</h2>
                  <div style={{ color: "#6c757d", fontSize: "14px" }}>
                    {selectedPost.authorNickname} • {new Date(selectedPost.createdAt).toLocaleString()}
                  </div>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#6c757d",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ borderTop: "1px solid #ddd", paddingTop: "16px", marginBottom: "16px" }}>
                <div style={{ lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                  {selectedPost.content || "내용이 없습니다."}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  fontSize: "14px",
                  color: "#6c757d",
                  borderTop: "1px solid #ddd",
                  paddingTop: "16px",
                }}
              >
                <span>👁 {selectedPost.viewCount}</span>
                <span
                  onClick={() => toggleLike(selectedPost.boardId)}
                  style={{
                    cursor: "pointer",
                    color: selectedPost.isLiked ? "#dc3545" : "#6c757d",
                    fontWeight: selectedPost.isLiked ? "bold" : "normal",
                  }}
                >
                  ❤ {selectedPost.likeCount}
                </span>
                <span>💬 {selectedPost.commentCount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default Board
