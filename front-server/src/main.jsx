import { createRoot } from 'react-dom/client';
import '@scss/common-ui.scss';
import alertUtils from '@js/common-ui';
import App from '@/App.jsx';
import Loading from '@common/Loading';

// 전역으로 등록
window.customAlert = alertUtils.customAlert;
window.customConfirm = alertUtils.customConfirm;
window.customPrompt = alertUtils.customPrompt;

createRoot(document.getElementById('root')).render(
	<>
		<App />
		<Loading />
	</>
)