import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoProvider } from '../contexts/TodoContext';
import { useTodo } from '../hooks/useTodo';
// import { act } from 'react-dom/test-utils';

const TestComponent = () => {
  const { todos, addTodo, toggleTodoCompletion, deleteTodo } = useTodo();

  return (
    <div>
      <button data-testid="add-todo" onClick={() => addTodo('Test Todo', 'Test Description')}>
        Add Todo
      </button>
      <div data-testid="todo-count">{todos.length}</div>
      {todos.map(todo => (
        <div key={todo.id} data-testid={`todo-item-${todo.id}`}>
          <span data-testid={`todo-title-${todo.id}`}>{todo.title}</span>
          <span data-testid={`todo-desc-${todo.id}`}>{todo.description}</span>
          <span data-testid={`todo-completed-${todo.id}`}>
            {todo.completed ? 'Completed' : 'Not completed'}
          </span>
          <button data-testid={`toggle-${todo.id}`} onClick={() => toggleTodoCompletion(todo.id)}>
            Toggle
          </button>
          <button data-testid={`delete-${todo.id}`} onClick={() => deleteTodo(todo.id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
};

describe('TodoContext', () => {
  it('provides empty todos array initially', () => {
    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    expect(screen.getByTestId('todo-count').textContent).toBe('0');
  });

  it('can add a new todo', async () => {
    const user = userEvent.setup();

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add-todo'));

    expect(screen.getByTestId('todo-count').textContent).toBe('1');
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('can toggle todo completion status', async () => {
    const user = userEvent.setup();

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add-todo'));

    const todoId =
      screen.getByTestId('todo-count').textContent === '1'
        ? screen
            .getByText('Test Todo')
            .closest('[data-testid^="todo-item-"]')
            ?.getAttribute('data-testid')
            ?.replace('todo-item-', '')
        : '';

    expect(screen.getByTestId(`todo-completed-${todoId}`).textContent).toBe('Not completed');

    await user.click(screen.getByTestId(`toggle-${todoId}`));

    expect(screen.getByTestId(`todo-completed-${todoId}`).textContent).toBe('Completed');
  });

  it('can delete a todo', async () => {
    const user = userEvent.setup();

    render(
      <TodoProvider>
        <TestComponent />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add-todo'));

    expect(screen.getByTestId('todo-count').textContent).toBe('1');

    const todoId =
      screen.getByTestId('todo-count').textContent === '1'
        ? screen
            .getByText('Test Todo')
            .closest('[data-testid^="todo-item-"]')
            ?.getAttribute('data-testid')
            ?.replace('todo-item-', '')
        : '';

    await user.click(screen.getByTestId(`delete-${todoId}`));

    expect(screen.getByTestId('todo-count').textContent).toBe('0');
  });

  it('adds a todo with a due date when provided', async () => {
    const user = userEvent.setup();

    const TestWithDueDate = () => {
      const { addTodo, todos } = useTodo();
      return (
        <div>
          <button
            data-testid="add-todo-due"
            onClick={() => addTodo('With Due', 'Has due', '2099-12-31')}
          >
            Add With Due
          </button>
          <div data-testid="todo-due-count">{todos.length}</div>
          {todos.map(t => (
            <div key={t.id} data-testid={`todo-item-${t.id}`}>
              {t.dueDate}
            </div>
          ))}
        </div>
      );
    };

    render(
      <TodoProvider>
        <TestWithDueDate />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add-todo-due'));
    expect(screen.getByTestId('todo-due-count').textContent).toBe('1');
    // Due date should appear
    expect(screen.getByText('2099-12-31')).toBeInTheDocument();
  });

  it('sanitizes invalid due date input (ignored)', async () => {
    const user = userEvent.setup();
    const TestInvalidDue = () => {
      const { addTodo, todos } = useTodo();
      return (
        <div>
          <button
            data-testid="add-invalid-due"
            // Purposely invalid format
            onClick={() => addTodo('Bad Due', 'Invalid', '31-12-2099' as unknown as string)}
          >
            Add Invalid Due
          </button>
          {todos.map(t => (
            <div key={t.id}>{t.dueDate ? 'has due' : 'no due'}</div>
          ))}
        </div>
      );
    };

    render(
      <TodoProvider>
        <TestInvalidDue />
      </TodoProvider>
    );

    await user.click(screen.getByTestId('add-invalid-due'));
    expect(screen.getByText('no due')).toBeInTheDocument();
  });
});
