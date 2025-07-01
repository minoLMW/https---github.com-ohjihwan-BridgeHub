package com.koreait.apiserver.service.Impl;

import com.koreait.apiserver.dto.LinkPreviewDTO;
import com.koreait.apiserver.service.LinkPreviewService;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class LinkPreviewServiceImpl implements LinkPreviewService {
    
    private static final String USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36";
    private static final int TIMEOUT = 5000; // 5초 타임아웃
    
    // URL 정규식 패턴
    private static final Pattern URL_PATTERN = Pattern.compile(
        "https?://(?:[-\\w.])+(?:[:\\d]+)?(?:/(?:[\\w/_.])*(?:\\?(?:[;&\\w\\d%_.~+=-])*)?(?:#(?:[\\w\\d%_.~+=-]*))?)?"
    );
    
    @Override
    public LinkPreviewDTO extractLinkPreview(String url) {
        LinkPreviewDTO preview = new LinkPreviewDTO();
        preview.setUrl(url);
        
        try {
            // URL 유효성 검사
            if (!isValidUrl(url)) {
                preview.setSuccess(false);
                preview.setError("유효하지 않은 URL입니다.");
                return preview;
            }
            
            log.info("URL 메타데이터 추출 시작: {}", url);
            
            // HTML 문서 가져오기
            Document doc = Jsoup.connect(url)
                    .userAgent(USER_AGENT)
                    .timeout(TIMEOUT)
                    .followRedirects(true)
                    .get();
            
            // 기본 정보 추출
            preview.setTitle(extractTitle(doc));
            preview.setDescription(extractDescription(doc));
            preview.setImage(extractImage(doc, url));
            preview.setSiteName(extractSiteName(doc, url));
            preview.setFavicon(extractFavicon(doc, url));
            preview.setType(extractType(doc));
            preview.setSuccess(true);
            
            log.info("URL 메타데이터 추출 성공: {} - {}", url, preview.getTitle());
            
        } catch (Exception e) {
            log.error("URL 메타데이터 추출 실패: {}", url, e);
            preview.setSuccess(false);
            preview.setError("메타데이터 추출 실패: " + e.getMessage());
        }
        
        return preview;
    }
    
    @Override
    public List<String> extractUrls(String text) {
        List<String> urls = new ArrayList<>();
        Matcher matcher = URL_PATTERN.matcher(text);
        
        while (matcher.find()) {
            urls.add(matcher.group());
        }
        
        return urls;
    }
    
    @Override
    public boolean isValidUrl(String url) {
        try {
            new URL(url);
            return url.startsWith("http://") || url.startsWith("https://");
        } catch (Exception e) {
            return false;
        }
    }
    
    // 제목 추출
    private String extractTitle(Document doc) {
        // Open Graph title
        Element ogTitle = doc.selectFirst("meta[property=og:title]");
        if (ogTitle != null && !ogTitle.attr("content").isEmpty()) {
            return ogTitle.attr("content");
        }
        
        // Twitter title
        Element twitterTitle = doc.selectFirst("meta[name=twitter:title]");
        if (twitterTitle != null && !twitterTitle.attr("content").isEmpty()) {
            return twitterTitle.attr("content");
        }
        
        // HTML title
        Element title = doc.selectFirst("title");
        if (title != null && !title.text().isEmpty()) {
            return title.text();
        }
        
        return "제목 없음";
    }
    
    // 설명 추출
    private String extractDescription(Document doc) {
        // Open Graph description
        Element ogDesc = doc.selectFirst("meta[property=og:description]");
        if (ogDesc != null && !ogDesc.attr("content").isEmpty()) {
            return ogDesc.attr("content");
        }
        
        // Twitter description
        Element twitterDesc = doc.selectFirst("meta[name=twitter:description]");
        if (twitterDesc != null && !twitterDesc.attr("content").isEmpty()) {
            return twitterDesc.attr("content");
        }
        
        // Meta description
        Element metaDesc = doc.selectFirst("meta[name=description]");
        if (metaDesc != null && !metaDesc.attr("content").isEmpty()) {
            return metaDesc.attr("content");
        }
        
        return "";
    }
    
    // 이미지 추출
    private String extractImage(Document doc, String baseUrl) {
        // Open Graph image
        Element ogImage = doc.selectFirst("meta[property=og:image]");
        if (ogImage != null && !ogImage.attr("content").isEmpty()) {
            return resolveUrl(ogImage.attr("content"), baseUrl);
        }
        
        // Twitter image
        Element twitterImage = doc.selectFirst("meta[name=twitter:image]");
        if (twitterImage != null && !twitterImage.attr("content").isEmpty()) {
            return resolveUrl(twitterImage.attr("content"), baseUrl);
        }
        
        // 첫 번째 이미지
        Element firstImg = doc.selectFirst("img");
        if (firstImg != null && !firstImg.attr("src").isEmpty()) {
            return resolveUrl(firstImg.attr("src"), baseUrl);
        }
        
        return "";
    }
    
    // 사이트명 추출
    private String extractSiteName(Document doc, String baseUrl) {
        // Open Graph site name
        Element ogSiteName = doc.selectFirst("meta[property=og:site_name]");
        if (ogSiteName != null && !ogSiteName.attr("content").isEmpty()) {
            return ogSiteName.attr("content");
        }
        
        try {
            URL url = new URL(baseUrl);
            return url.getHost();
        } catch (Exception e) {
            return "";
        }
    }
    
    // 파비콘 추출
    private String extractFavicon(Document doc, String baseUrl) {
        // 다양한 파비콘 태그 시도
        String[] selectors = {
            "link[rel=icon]",
            "link[rel=shortcut icon]",
            "link[rel=apple-touch-icon]"
        };
        
        for (String selector : selectors) {
            Element favicon = doc.selectFirst(selector);
            if (favicon != null && !favicon.attr("href").isEmpty()) {
                return resolveUrl(favicon.attr("href"), baseUrl);
            }
        }
        
        // 기본 파비콘 경로
        try {
            URL url = new URL(baseUrl);
            return url.getProtocol() + "://" + url.getHost() + "/favicon.ico";
        } catch (Exception e) {
            return "";
        }
    }
    
    // 타입 추출
    private String extractType(Document doc) {
        Element ogType = doc.selectFirst("meta[property=og:type]");
        if (ogType != null && !ogType.attr("content").isEmpty()) {
            return ogType.attr("content");
        }
        return "website";
    }
    
    // 상대 URL을 절대 URL로 변환
    private String resolveUrl(String url, String baseUrl) {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return url;
        }
        
        try {
            URL base = new URL(baseUrl);
            URL resolved = new URL(base, url);
            return resolved.toString();
        } catch (Exception e) {
            return url;
        }
    }
} 