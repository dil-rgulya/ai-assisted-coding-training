import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { useTodo } from '../../hooks/useTodo';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { isValidDateOnly } from '../../utils/date';
// Todo type is used in the context, no need to import it directly here

interface TodoModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  initialValues?: {
    id: string;
    title: string;
    description: string;
    completed: boolean;
    dueDate?: string;
  };
}

export const TodoModal: React.FC<TodoModalProps> = ({
  isOpen,
  onClose,
  mode = 'create',
  initialValues,
}) => {
  const { addTodo, editTodo } = useTodo();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [completed, setCompleted] = useState(false);
  const [titleError, setTitleError] = useState('');
  const [dueDate, setDueDate] = useState<string | undefined>(undefined);

  // Reset form or load values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialValues) {
        setTitle(initialValues.title);
        setDescription(initialValues.description);
        setCompleted(initialValues.completed);
        setDueDate(initialValues.dueDate);
      } else {
        setTitle('');
        setDescription('');
        setCompleted(false);
        setDueDate(undefined);
      }
      setTitleError('');
    }
  }, [isOpen, mode, initialValues]);

  const validateForm = () => {
    if (!title.trim()) {
      setTitleError('Title is required');
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (mode === 'create') {
      addTodo(title.trim(), description.trim(), dueDate);
    } else if (mode === 'edit' && initialValues) {
      editTodo(initialValues.id, {
        title: title.trim(),
        description: description.trim(),
        completed,
        dueDate,
      });
    }
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="todo-dialog-title"
    >
      <DialogTitle id="todo-dialog-title">
        {mode === 'create' ? 'Create Todo' : 'Edit Todo'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              value={title}
              onChange={e => {
                setTitle(e.target.value);
                if (e.target.value.trim()) setTitleError('');
              }}
              fullWidth
              required
              error={!!titleError}
              helperText={titleError}
              autoFocus
              inputProps={
                { 'data-testid': 'title-input' } as React.InputHTMLAttributes<HTMLInputElement>
              }
            />
            <TextField
              label="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
              inputProps={
                {
                  'data-testid': 'description-input',
                } as React.InputHTMLAttributes<HTMLInputElement>
              }
            />
            <DatePicker
              label="Due Date"
              value={dueDate ? new Date(dueDate) : null}
              disablePast
              onChange={date => {
                if (date && !isNaN(date.getTime())) {
                  // convert to YYYY-MM-DD local
                  const y = date.getFullYear();
                  const m = String(date.getMonth() + 1).padStart(2, '0');
                  const d = String(date.getDate()).padStart(2, '0');
                  const val = `${y}-${m}-${d}`;
                  setDueDate(isValidDateOnly(val) ? val : undefined);
                } else {
                  setDueDate(undefined);
                }
              }}
              slotProps={{ textField: { helperText: 'Optional', fullWidth: true } }}
            />
            {dueDate && (
              <Button
                variant="text"
                color="secondary"
                size="small"
                onClick={() => setDueDate(undefined)}
                data-testid="clear-due-date"
                sx={{ alignSelf: 'flex-start', mt: -1 }}
              >
                Clear due date
              </Button>
            )}
            {mode === 'edit' && (
              <FormControlLabel
                control={
                  <Checkbox
                    checked={completed}
                    onChange={e => setCompleted(e.target.checked)}
                    inputProps={
                      {
                        'data-testid': 'completed-checkbox',
                      } as React.InputHTMLAttributes<HTMLInputElement>
                    }
                  />
                }
                label="Mark as completed"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" data-testid="submit-button">
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
