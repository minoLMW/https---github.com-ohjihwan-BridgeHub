import { useState } from 'react';
import Login from './login';
import SignUp from './signup';

function Auth() {
	const [isLoginView, setIsLoginView] = useState(true);

	return (
		<div className="auth">
			<div className={`auth__container ${isLoginView ? 'auth__container--login' : 'auth__container--signup'}`}>
				<div className="auth__forms-wrapper">
					<Login onSwitchToSignUp={() => setIsLoginView(false)} />
					{<SignUp
						onSwitchToLogin={() => setIsLoginView(true)}
						isActive={!isLoginView}
					/>}
				</div>
			</div>
		</div>
	);
}

export default Auth; 