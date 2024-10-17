import { useLayoutEffect, useState, useEffect } from 'react';
let initialToDoLists;
if (localStorage.getItem('initialized')) {
	initialToDoLists = JSON.parse(localStorage.getItem('toDoLists'));
} else {
	localStorage.setItem('initialized', true);
	initialToDoLists = [
		{
			id: 'b32e784e-8dc4-4f23-bb16-dfae9bc2e2b1',
			title: 'How to plant a garden',
			steps: [
				'Choose a location',
				'Prepare the soil',
				'Plant seeds',
				'Water regularly',
				'Maintain garden',
			],
		},
		{
			id: 'c48f990a-42f3-4e89-a76b-ff6eabdc4a7a',
			title: 'How to change a tire',
			steps: [
				'Gather tools',
				'Loosen lug nuts',
				'Lift car with jack',
				'Remove old tire',
				'Place new tire',
				'Tighten lug nuts',
			],
		},
		{
			id: 'd65b193a-a78d-452c-b916-3389e1d6d2c3',
			title: 'How to create a budget',
			steps: [
				'List income sources',
				'List monthly expenses',
				'Calculate savings',
				'Allocate for goals',
				'Review and adjust',
			],
		},
		{
			id: 'f03c236e-3e7d-4ff4-bb49-bd2ed9cd1b98',
			title: 'How to paint a wall',
			steps: [
				'Gather supplies',
				'Prep the wall',
				'Apply primer',
				'Paint the wall',
				'Clean up',
			],
		},
		{
			id: 'e17d645b-6d8f-4264-9f03-7469f264d1d4',
			title: 'How to write a resume',
			steps: [
				'Choose a format',
				'List contact information',
				'Add work experience',
				'Add education',
				'Review and edit',
			],
		},
	];
	localStorage.setItem('toDoLists', JSON.stringify(initialToDoLists));
}

function useWindowSize() {
	const [size, setSize] = useState([0, 0]);
	useLayoutEffect(() => {
		function updateSize() {
			setSize([window.innerWidth, window.innerHeight]);
		}
		window.addEventListener('resize', updateSize);
		updateSize();
		return () => window.removeEventListener('resize', updateSize);
	}, []);
	return size;
}

export default function App() {
	const [toDoLists, setToDoLists] = useState(initialToDoLists);
	const [showAddForm, setShowAddForm] = useState(false);
	const [page, setPage] = useState(0);
	const [width, height] = useWindowSize();
	const numListsPerPage = width <= 676 ? 4 : 6;
	const pageList = getCurList(page);

	//save toDoLists to local storage
	useEffect(() => {
		localStorage.setItem('toDoLists', JSON.stringify(toDoLists));
	}, [toDoLists]);

	function handlePageUp() {
		setPage(page => page + 1);
	}
	function handlePageDown() {
		if (page === 0) return;
		setPage(page => page - 1);
	}

	function getCurList(page) {
		return toDoLists.slice(
			page * numListsPerPage,
			page * numListsPerPage + numListsPerPage
		);
	}
	function handleDeleteList(listId) {
		setToDoLists(toDoLists =>
			toDoLists.slice().filter(list => list.id !== listId)
		);
	}

	function capitalize(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}
	function handleAddToList(e, title, inputFields) {
		e.preventDefault();
		const steps = inputFields
			.map(inputField =>
				capitalize(inputField.value.split(' ').filter(Boolean).join(' '))
			)
			.filter(Boolean);
		let titleFormated = capitalize(title.split(' ').filter(Boolean).join(' '));
		if (!steps || !titleFormated) return;
		const newList = {
			id: crypto.randomUUID(),
			title: titleFormated,
			steps,
		};
		setToDoLists(toDoList => [...toDoList, newList]);
		setShowAddForm(false);
	}

	return (
		<div className="App">
			<div className="centerGrid">
				{pageList.map(list => (
					<ToDoList
						list={list}
						onDeleteList={handleDeleteList}
						key={list.id}
					></ToDoList>
				))}
				{pageList.length <= numListsPerPage - 1 && (
					<div className="div-form">
						<button
							className={`add ${showAddForm ? 'close' : ''}`}
							onClick={() => setShowAddForm(s => !s)}
						>
							{showAddForm ? '❌' : 'Add new list'}
						</button>
						{showAddForm && (
							<AddToDoForm onAddToList={handleAddToList}></AddToDoForm>
						)}
					</div>
				)}
			</div>
			{toDoLists.length > numListsPerPage - 1 && (
				<div className="page-numbering">
					<button
						className={`button-page ${page <= 0 ? 'hidden' : ''}`}
						onClick={handlePageDown}
					>
						◀
					</button>

					<h1>{page + 1}</h1>

					<button
						className={`button-page ${
							pageList.length <= numListsPerPage - 1 ? 'hidden' : ''
						}`}
						onClick={handlePageUp}
					>
						▶
					</button>
				</div>
			)}
		</div>
	);
}
function AddToDoForm({ onAddToList }) {
	const [inputFields, setInputFields] = useState([{ value: '' }]);
	const [title, setTitle] = useState('');

	function handleValueChange(e, i) {
		const values = [...inputFields];
		values[i].value = e.target.value;
		setInputFields(values);
	}

	function handleAddInputField() {
		setInputFields(inputFields =>
			inputFields.length < 7 ? [...inputFields, { value: '' }] : inputFields
		);
	}

	return (
		<div className="div-list">
			<form
				className="list form-list"
				onSubmit={e => onAddToList(e, title, inputFields)}
			>
				<div className="title-div">
					<label className="title-list">Title</label>
					<input
						className="title-input"
						maxLength="39"
						type="text"
						value={title}
						onChange={e => setTitle(e.target.value)}
					></input>
				</div>
				{inputFields.map((inputField, i, arr) => (
					<Input
						inputField={inputField}
						i={i}
						arr={arr}
						setInputFields={setInputFields}
						handleValueChange={handleValueChange}
						key={i}
					></Input>
				))}
				<button type="button" className="addStep" onClick={handleAddInputField}>
					Add Step
				</button>
				<button className="submit">Submit form</button>
			</form>
		</div>
	);
}

function Input({ inputField, i, arr, setInputFields, handleValueChange }) {
	function handleRemoveInputField() {
		setInputFields(inputFields => [...inputFields].slice(0, -1));
	}
	return (
		<div className="input-field">
			<label>{i + 1}. </label>
			<input
				maxLength="29"
				type="text"
				value={inputField.value}
				onChange={e => handleValueChange(e, i)}
			></input>
			{i + 1 === arr.length && (
				<button onClick={handleRemoveInputField}>❌</button>
			)}
		</div>
	);
}

function ToDoList({ list, onDeleteList }) {
	return (
		<div className="list">
			<label className="title-list">{list.title}</label>
			<button className="button-list" onClick={() => onDeleteList(list.id)}>
				❌
			</button>
			<ol>
				{list.steps.map((step, i) => (
					<Step step={step} key={i}></Step>
				))}
			</ol>
		</div>
	);
}

function Step({ step }) {
	const [checked, setChecked] = useState(false);
	function handleChange() {
		setChecked(checked => !checked);
	}
	return (
		<li>
			<div className="list-point">
				<span style={checked ? { textDecoration: 'line-through' } : {}}>
					{step}
				</span>
				<input type="checkbox" checked={checked} onChange={handleChange} />
			</div>
		</li>
	);
}
