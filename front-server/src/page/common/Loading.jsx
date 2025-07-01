import React from 'react';

const Loader = () => {
	return (
		<>
			<div id="global-loading" className="loading">
				<div className="cats">
					<div className="cats__body"></div>
					<div className="cats__body"></div>
					<div className="cats__tail"></div>
					<div className="cats__head"></div>
					<p className="loading__text">
						<span>L</span>
						<span>o</span>
						<span>a</span>
						<span>d</span>
						<span>i</span>
						<span>n</span>
						<span>g</span>
						<span>:-)</span>
					</p>
				</div>
			</div>
		</>
	);
};

export default Loader;
