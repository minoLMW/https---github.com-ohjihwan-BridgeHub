import React, { useState, useEffect } from 'react';
import { Doughnut, Bar } from 'react-chartjs-2';
import 'chart.js/auto';
import { fetchStatistics } from '../../services/api';

// --- Main Components ---

const SummaryCard = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
      <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#333' }}>{data.value}</span>
      <ChangeIndicator value={data.change} type={data.change > 0 ? 'up' : 'down'} />
    </div>
  </div>
);

const MemberDistributionCard = ({ data }) => {
  const Bar = ({ label, value, color }) => (
    <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
      <span style={{ width: '60px', fontSize: '14px' }}>{label}</span>
      <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '20px', display: 'flex' }}>
        <div style={{ width: `${value}%`, background: color, borderRadius: '4px' }}></div>
      </div>
      <span style={{ width: '40px', textAlign: 'right', fontSize: '14px' }}>{value}%</span>
    </div>
  );

  return (
    <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
       <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
      <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
      <div>
        <Bar label="남성" value={data.gender.male} color="#3182ce" />
        <Bar label="여성" value={data.gender.female} color="#e53e3e" />
      </div>
      <div style={{ marginTop: '20px' }}>
        {data.age.map(item => (
          <div key={item.range} style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
            <span style={{ width: '60px', fontSize: '14px' }}>{item.range}</span>
            <div style={{ flex: 1, background: '#eee', borderRadius: '4px', height: '20px', display: 'flex' }}>
              <div style={{ width: `${item.male}%`, background: '#3182ce', borderRadius: '4px 0 0 4px' }}></div>
              <div style={{ width: `${item.female}%`, background: '#e53e3e', borderRadius: '0 4px 4px 0' }}></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SalesTrendCard = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    {data.items.map(item => (
      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>{item.label}</span>
        <div style={{display: 'flex', alignItems: 'baseline', gap: '10px'}}>
          <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.value}</span>
          <ChangeIndicator value={item.change} type={item.change > 0 ? 'up' : 'down'} />
        </div>
      </div>
    ))}
  </div>
);

const Top10Table = ({ data }) => (
  <div style={{ background: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', gridColumn: 'span 2' }}>
    <h3 style={{ margin: '0 0 5px 0', fontSize: '16px', color: '#555' }}>{data.title}</h3>
    <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#888' }}>{data.description}</p>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
      <thead>
        <tr>
          {data.headers.map(header => (
            <th key={header} style={{ padding: '10px', background: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.rows.map(row => (
          <tr key={row[0]}>
            {row.map((cell, index) => (
              <td key={index} style={{ padding: '10px', borderBottom: '1px solid #f0f0f0' }}>
                {typeof cell === 'object' ? <ChangeIndicator value={cell.value} type={cell.type} /> : cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// --- 헬퍼 컴포넌트 ---
const Card = ({ children, style, ...rest }) => (
  <div style={{
    background: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
    ...style
  }} {...rest}>
    {children}
  </div>
);

const MiniChartCard = ({ chart, isActive, onClick }) => (
  <Card style={{ 
    cursor: 'pointer', 
    border: isActive ? '2px solid #6a6cff' : '2px solid transparent',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px'
  }} onClick={onClick}>
    <h4 style={{ margin: 0, fontSize: '16px', color: '#555', textAlign: 'center' }}>{chart.title}</h4>
    <div style={{ width: '100px', height: '100px' }}>
      <Doughnut data={chart.data} options={{ plugins: { legend: { display: false } }, responsive: true, maintainAspectRatio: true }} />
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2px 8px', fontSize: '11px', width: '100%' }}>
      {chart.legend.map((item, idx) => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: chart.data.datasets[0].backgroundColor[idx], marginRight: '4px', flexShrink: 0 }}></span>
          {item}
        </div>
      ))}
    </div>
  </Card>
);

const ListCard = ({ title, items, renderItem }) => (
  <Card>
    <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>{title}</h3>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {items.map((item, index) => (
        <li key={index} style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0', fontSize: '14px', color: '#666' }}>
          {renderItem(item)}
        </li>
      ))}
    </ul>
  </Card>
);

// ChangeIndicator 컴포넌트 추가
const ChangeIndicator = ({ value, type }) => (
  <span style={{ 
    color: type === 'up' ? '#10b981' : '#ef4444',
    fontSize: '12px',
    fontWeight: '500'
  }}>
    {type === 'up' ? '↗' : '↘'} {Math.abs(value)}%
  </span>
);

// --- Main Statistics Component ---
export default function Statistics() {
  const [selectedChart, setSelectedChart] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    console.log('통계 데이터 로딩 시작...');
    fetchStatistics()
      .then(res => {
        console.log('통계 API 응답:', res);
        const data = res.data;
        console.log('파싱된 데이터:', data);
        setStats(data);
        
        // 첫 번째 차트를 기본 선택
        if (data.memberStats && Object.keys(data.memberStats).length > 0) {
          const firstChartKey = Object.keys(data.memberStats)[0];
          console.log('첫 번째 차트 키:', firstChartKey);
          setSelectedChart({
            id: firstChartKey,
            title: getChartTitle(firstChartKey),
            data: buildChartData(firstChartKey, data.memberStats[firstChartKey]),
            legend: getChartLegend(firstChartKey, data.memberStats[firstChartKey])
          });
        } else {
          console.log('memberStats가 없거나 비어있음:', data.memberStats);
        }
      })
      .catch(err => {
        console.error('통계 데이터 로딩 에러:', err);
        setError(err);
      })
      .finally(() => {
        console.log('통계 데이터 로딩 완료');
        setLoading(false);
      });
  }, []);

  const getChartTitle = (key) => {
    const titles = {
      gender: '성별',
      education: '학력',
      time: '활동 시간대',
      major: '전공'
    };
    return titles[key] || key;
  };

  const getChartLegend = (key, data) => {
    if (key === 'gender') {
      return ['남성', '여성'];
    } else if (key === 'education') {
      return ['고졸', '대학교', '대학원'];
    } else if (key === 'time') {
      return ['06:00~12:00', '12:00~18:00', '18:00~24:00'];
    } else if (key === 'major') {
      return ['인문•사회', '상경', '자연', '공학', '예체능', '의학', '법학', '융합'];
    }
    return Object.keys(data);
  };

  const buildChartData = (key, data) => {
    const labels = getChartLegend(key, data);
    const values = labels.map(label => data[label] || 0);
    
    let colors;
    if (key === 'gender') {
      colors = ['#0043AC', '#FF9F40'];
    } else if (key === 'education') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40'];
    } else if (key === 'time') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40'];
    } else if (key === 'major') {
      colors = ['#0043AC', '#36A2EB', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#DE7C7D'];
    } else {
      colors = ['#0043AC', '#36A2EB', '#FF9F40', '#FFCD56', '#4BC0C0', '#9966FF', '#C9CBCF', '#DE7C7D'];
    }

    return {
      labels,
      datasets: [{ data: values, backgroundColor: colors }]
    };
  };

  const buildBarData = () => {
    if (!stats?.activityStats?.quarterlySignups) return null;
    
    const quarters = Object.keys(stats.activityStats.quarterlySignups);
    return {
      labels: quarters,
      datasets: [
        {
          label: '신규 가입자 수',
          data: quarters.map(q => stats.activityStats.quarterlySignups[q]),
          backgroundColor: '#0043AC'
        },
        {
          label: '총 접속자 수',
          data: quarters.map(q => stats.activityStats.quarterlyVisitors[q]),
          backgroundColor: '#FF9F40'
        }
      ]
    };
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px',
      fontSize: '16px',
      color: '#666'
    }}>
      통계 데이터를 불러오는 중...
    </div>
  );

  if (error) return (
    <div style={{ 
      color: 'red', 
      padding: '20px',
      textAlign: 'center'
    }}>
      에러: {error.message}
    </div>
  );

  if (!stats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        통계 데이터가 없습니다.
      </div>
    );
  }

  // 데이터가 비어있는지 확인
  const hasMemberStats = stats.memberStats && Object.keys(stats.memberStats).length > 0;
  const hasActivityStats = stats.activityStats && Object.keys(stats.activityStats).length > 0;
  const hasReportStats = stats.reportStats && Object.keys(stats.reportStats).length > 0;

  if (!hasMemberStats && !hasActivityStats && !hasReportStats) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '16px',
        color: '#666'
      }}>
        표시할 통계 데이터가 없습니다.
      </div>
    );
  }

  // 차트 데이터 리스트 생성
  const chartDataList = Object.keys(stats.memberStats || {}).map(key => ({
    id: key,
    title: getChartTitle(key),
    data: buildChartData(key, stats.memberStats[key]),
    legend: getChartLegend(key, stats.memberStats[key])
  }));

  const barData = buildBarData();

  return (
    <div style={{ padding: '20px', background: '#f4f7fa' }}>
      {/* 페이지 제목 */}
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '20px' }}>통계</h1>

      {/* 상단: 작은 도넛 차트들 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        {chartDataList.map(chart => (
          <MiniChartCard
            key={chart.id}
            chart={chart}
            isActive={selectedChart?.id === chart.id}
            onClick={() => setSelectedChart(chart)}
          />
        ))}
      </div>

      {/* 메인 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', alignItems: 'start' }}>
        
        {/* 선택된 차트 상세 */}
        {selectedChart && (
          <Card style={{ gridColumn: 'span 1' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>{selectedChart.title} 상세</h3>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Doughnut data={selectedChart.data} options={{ plugins: { legend: { position: 'right' } } }} />
            </div>
          </Card>
        )}
        
        {/* 방문자 수 바 차트 */}
        {barData && (
          <Card style={{ gridColumn: 'span 2' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#555' }}>방문자 수</h3>
            <div style={{ height: '300px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </Card>
        )}
        
        {/* 하단 위젯들 */}
        {stats.activityStats?.topActiveUsers && (
          <ListCard 
            title="활동 TOP 10"
            items={stats.activityStats.topActiveUsers}
            renderItem={user => (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{user.name}</span>
                <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{user.activity}회</span>
              </div>
            )}
          />
        )}
        
        {stats.activityStats?.popularRooms && (
          <ListCard
            title="인기 채팅방 TOP 10"
            items={stats.activityStats.popularRooms}
            renderItem={room => (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>{room.name}</span>
                <span style={{ fontWeight: 'bold', color: '#6a6cff' }}>{room.count}명</span>
              </div>
            )}
          />
        )}
        
        {stats.reportStats?.recentReports && (
          <ListCard
            title="최근 신고 TOP 10"
            items={stats.reportStats.recentReports}
            renderItem={report => (
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <span>{report.reporter} → {report.target}</span>
                <span style={{ color: '#888' }}>({report.reason})</span>
              </div>
            )}
          />
        )}
      </div>

      {/* 반응형 스타일 */}
      <style>{`
        @media (max-width: 900px) {
          .main-grid {
            grid-template-columns: 1fr !important;
          }
          .main-grid > div {
            grid-column: span 1 !important;
          }
        }
      `}</style>
    </div>
  );
}