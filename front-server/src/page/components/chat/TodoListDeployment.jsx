const TodoList = ({ todos, selectedIndex, onAssignUser }) => {
	return (
		<>
			<div className="todolist">
				{todos.map((todo, index) => (
					<div className="todolist__unit" key={index}>
						<div className="todolist__info">
							<h4 className="todolist__name">{todo.title}</h4>
							<ul className="todolist__users">
								{todo.users.map((user, idx) => (
									<li key={idx} className="todolist__user">{user}</li>
								))}
							</ul>
						</div>
						<div className="todolist__buttons">
							<button 
								type="button" 
								className={`todolist__button ${selectedIndex === index ? 'todolist__button--active' : ''}`} 
								onClick={() => onAssignUser(index)}
							>
								{selectedIndex === index ? "목표 선택 취소하기" : "목표 선택"}
							</button>
						</div>
					</div>
				))}
			</div>
			<div class="todolist-comf">
				<button type="button" class="todolist-comf__button button-primary">목표 결정</button>
			</div>
		</>
	);
};

export default TodoList;
